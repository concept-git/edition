/**
 * 登录与凭据会话 flow：接收登录、刷新、退出请求并返回或撤销凭据。
 * 共置登录 sync 与认证拒绝；不负责账户资料和设备清单。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.usecases.iam.login;
