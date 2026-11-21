/**
 * 身份与访问 flow 的组织根。
 *
 * <p>具体实现按 registration/login/accountsession/accountsecurity/membership/team/
 * usererasure/apitoken 一层浅包归放；本包不承载具体 flow，也不形成新的 Modulith 模块边界。
 * 唯一留在这里的是被两个以上 flow 抛出、又不属于任一 flow 词汇的 {@code PasswordTooWeakException}
 * （注册与账户安全共用）；跨组共用的错误（如 invalid_cursor）在组合根。
 * 根与各 flow 的同名 NamedInterface 共同向 gateway 暴露 IAM 入口及错误。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.compositions.iam;
