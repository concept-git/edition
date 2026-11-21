package io.edition.control.entry.http.platform;

import io.edition.control.compositions.iam.usererasure.DeactivateUserUseCase;
import io.edition.control.compositions.iam.usererasure.EraseUserUseCase;
import io.edition.control.compositions.iam.usererasure.ReactivateUserUseCase;
import io.edition.control.compositions.iam.usererasure.SearchUsersUseCase;
import io.edition.control.compositions.iam.usererasure.UserDetailUseCase;
import io.edition.control.compositions.iam.usererasure.UserErasureTypes;
import io.edition.control.entry.http.security.BearerCredential;
import io.edition.control.entry.http.security.IdempotencyKeyFilter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(
        responseCode = "403",
        description = "Caller is not a platform operator (platform_operator_required)",
        content =
                @Content(
                        mediaType = AdminUserController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
class AdminUserController {
    static final String PROBLEM = "application/problem+json";
    private final SearchUsersUseCase searchUsersUseCase;
    private final UserDetailUseCase userDetailUseCase;
    private final DeactivateUserUseCase deactivateUserUseCase;
    private final ReactivateUserUseCase reactivateUserUseCase;
    private final EraseUserUseCase eraseUserUseCase;
    private final BearerCredential bearer;

    AdminUserController(
            SearchUsersUseCase searchUsersUseCase,
            UserDetailUseCase userDetailUseCase,
            DeactivateUserUseCase deactivateUserUseCase,
            ReactivateUserUseCase reactivateUserUseCase,
            EraseUserUseCase eraseUserUseCase,
            BearerCredential bearer) {
        this.searchUsersUseCase = searchUsersUseCase;
        this.userDetailUseCase = userDetailUseCase;
        this.deactivateUserUseCase = deactivateUserUseCase;
        this.reactivateUserUseCase = reactivateUserUseCase;
        this.eraseUserUseCase = eraseUserUseCase;
        this.bearer = bearer;
    }

    @GetMapping
    @Operation(operationId = "searchAdminUsers", summary = "Search global users by email or name prefix")
    @ApiResponse(
            responseCode = "200",
            description = "One page of matching users",
            content = @Content(schema = @Schema(implementation = UserErasureTypes.UserPage.class)))
    UserErasureTypes.UserPage search(
            @RequestParam @Size(min = 3) String q,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return searchUsersUseCase.searchUsers(bearer.require(), q, cursor, limit);
    }

    @GetMapping("/{id}")
    @Operation(operationId = "getAdminUser", summary = "Read global user lifecycle and membership details")
    @ApiResponse(
            responseCode = "200",
            description = "Global user detail",
            content = @Content(schema = @Schema(implementation = UserErasureTypes.UserDetail.class)))
    UserErasureTypes.UserDetail detail(@PathVariable UUID id) {
        return userDetailUseCase.userDetail(bearer.require(), id);
    }

    @PostMapping("/{id}:deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @Operation(operationId = "deactivateAdminUser", summary = "Globally freeze a user and revoke credentials")
    void deactivate(
            @PathVariable UUID id,
            @Valid @RequestBody ConfirmRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        deactivateUserUseCase.deactivateUser(
                bearer.require(),
                id,
                body.confirmationEmail(),
                body.currentPassword(),
                IdempotencyKeyFilter.require(request));
    }

    @PostMapping("/{id}:reactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @Operation(
            operationId = "reactivateAdminUser",
            summary = "Re-enable a deactivated user",
            description = "Memberships and user grants become usable again; old sessions and API tokens stay revoked.")
    void reactivate(@PathVariable UUID id, @Parameter(hidden = true) HttpServletRequest request) {
        reactivateUserUseCase.reactivateUser(bearer.require(), id, IdempotencyKeyFilter.require(request));
    }

    @PostMapping("/{id}:erase")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @Operation(operationId = "eraseAdminUser", summary = "Irreversibly erase a deactivated global user")
    void erase(
            @PathVariable UUID id,
            @Valid @RequestBody ConfirmRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        eraseUserUseCase.eraseUser(
                bearer.require(),
                id,
                body.confirmationEmail(),
                body.currentPassword(),
                IdempotencyKeyFilter.require(request));
    }

    record ConfirmRequest(
            @NotBlank @Email String confirmationEmail,
            @NotBlank String currentPassword) {}
}
