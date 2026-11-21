package io.edition.concepts.password.domain;

import io.edition.shared.ValidationViolation;
import java.util.ArrayList;
import java.util.List;

public final class PasswordStrength {
    private PasswordStrength() {}

    public static List<ValidationViolation> violations(String password) {
        var violations = new ArrayList<ValidationViolation>();
        if (password == null || password.length() < 8)
            violations.add(new ValidationViolation("password", "password_too_short"));
        if (password == null || password.chars().noneMatch(Character::isLetter))
            violations.add(new ValidationViolation("password", "password_letter_required"));
        if (password == null || password.chars().noneMatch(Character::isDigit))
            violations.add(new ValidationViolation("password", "password_digit_required"));
        return List.copyOf(violations);
    }
}
