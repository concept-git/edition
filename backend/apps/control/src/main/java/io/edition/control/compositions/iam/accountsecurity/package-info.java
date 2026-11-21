/**
 * 账户安全 flow：接收改密、忘记密码与重置，完成密码、撤销屏障和会话联动。
 * 共置安全 sync、专属异常与中断恢复；不负责 HTTP 限流或邮件基础设施策略。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.compositions.iam.accountsecurity;
