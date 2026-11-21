package io.edition.control.entry.http.account;

import io.edition.control.compositions.iam.usererasure.EraseSelfUseCase;
import io.edition.control.entry.http.auth.RefreshCookie;
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
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me:erase")
@SecurityRequirement(name = "bearerAuth")
class AccountErasureController {
    private static final String PROBLEM = "application/problem+json";
    private final EraseSelfUseCase eraseSelfUseCase;
    private final BearerCredential bearer;

    AccountErasureController(EraseSelfUseCase eraseSelfUseCase, BearerCredential bearer) {
        this.eraseSelfUseCase = eraseSelfUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "eraseCurrentUser",
            summary = "Irreversibly erase the authenticated user",
            description = "Server-verifies the email and current password, then atomically ends every session, "
                    + "revokes machine credentials, removes memberships and grants, and leaves a stable tombstone.")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(responseCode = "204", description = "User erased; refresh cookie cleared")
    @ApiResponse(
            responseCode = "400",
            description = "Confirmation rejected (erase_confirmation_invalid)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    @ApiResponse(
            responseCode = "409",
            description = "Ownership must be transferred first (ownership_transfer_required)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(ref = "#/components/schemas/ApiProblem")))
    void erase(@Valid @RequestBody EraseRequest body, HttpServletRequest request, HttpServletResponse response) {
        eraseSelfUseCase.eraseSelf(
                bearer.require(),
                body.confirmationEmail(),
                body.currentPassword(),
                IdempotencyKeyFilter.require(request));
        RefreshCookie.clear(response);
    }

    record EraseRequest(
            @NotBlank @Email String confirmationEmail,
            @NotBlank String currentPassword) {}
}
