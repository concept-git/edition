/**
 * 注册与激活 flow：接收注册/验证请求，产出账户创建或有限业务拒绝。
 * 共置注册 sync 与专属异常；不负责登录、会话或账户安全操作。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.usecases.iam.registration;
