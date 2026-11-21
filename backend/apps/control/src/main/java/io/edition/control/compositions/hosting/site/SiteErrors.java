package io.edition.control.compositions.hosting.site;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

/** 本 flow 专属 error case；跨 flow 共用的删除拒绝仍是顶层公开类型。 */
final class BrandingInvalidException extends FlowException {
    BrandingInvalidException(String field) {
        super(ProblemCode.BRANDING_INVALID, List.of(new ValidationViolation(field, "invalid_format")));
    }
}

final class HomeNotMountedException extends FlowException {
    HomeNotMountedException() {
        super(ProblemCode.HOME_NOT_MOUNTED, List.of(new ValidationViolation("home", "not_mounted")));
    }
}

final class OrderInvalidException extends FlowException {
    OrderInvalidException() {
        super(ProblemCode.ORDER_INVALID, List.of(new ValidationViolation("slugs", "not_permutation")));
    }
}

final class SiteNameInvalidException extends FlowException {
    SiteNameInvalidException() {
        super(ProblemCode.SITE_NAME_INVALID, List.of(new ValidationViolation("name", "size_out_of_range")));
    }
}

final class SitePatchInvalidException extends FlowException {
    SitePatchInvalidException() {
        super(ProblemCode.VALIDATION_FAILED, "the Site patch is empty or contains an unsupported value");
    }

    SitePatchInvalidException(String field, String code) {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
    }
}

final class SiteSlugTakenException extends FlowException {
    SiteSlugTakenException() {
        super(ProblemCode.SLUG_TAKEN);
    }
}

final class SlugInvalidException extends FlowException {
    SlugInvalidException() {
        super(ProblemCode.SLUG_INVALID, List.of(new ValidationViolation("slug", "invalid_format")));
    }
}

final class SpaceAlreadyMountedException extends FlowException {
    SpaceAlreadyMountedException() {
        super(ProblemCode.SPACE_ALREADY_MOUNTED);
    }
}
