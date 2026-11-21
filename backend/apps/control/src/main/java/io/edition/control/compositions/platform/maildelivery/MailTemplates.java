package io.edition.control.compositions.platform.maildelivery;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
final class MailTemplates {
    private final String verify, invite, reset;

    MailTemplates(
            @Value("${io.edition.verify-url-template}") String verify,
            @Value("${io.edition.invite-url-template}") String invite,
            @Value("${io.edition.reset-url-template}") String reset) {
        this.verify = verify;
        this.invite = invite;
        this.reset = reset;
    }

    record Content(String subject, String text) {}

    Content render(String kind, Map<String, String> payload) {
        String instructions =
                switch (kind) {
                    case "verification" ->
                        instructions(verify, "user=%s\ntoken=%s", payload.get("userId"), payload.get("token"));
                    case "invitation" -> instructions(invite, "token=%s", payload.get("token"));
                    case "password_reset" -> instructions(reset, "token=%s", payload.get("token"));
                    default -> throw new IllegalArgumentException("unknown mail kind");
                };
        String subject =
                switch (kind) {
                    case "verification" -> "Space · 验证邮箱";
                    case "invitation" -> "Space · 成员邀请";
                    default -> "Space · 重设密码";
                };
        return new Content(subject, subject + "\n\n" + instructions + "\n\n如果不是你发起的请求，请忽略本邮件。凭据过期后请重新申请。\n");
    }

    private static String instructions(String template, String fields, Object... values) {
        return template.isBlank()
                ? "请通过管理 API 提交以下一次性凭据：\n" + fields.formatted(values)
                : "请打开以下链接完成操作：\n" + template.formatted(values);
    }
}
