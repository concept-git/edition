/**
 * 本人账户与设备 flow：接收资料和会话管理请求，返回资料、租户与设备视图。
 * 共置账户会话 sync 与专属拒绝；不负责凭据签发或密码变更。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.usecases.iam.accountsession;
