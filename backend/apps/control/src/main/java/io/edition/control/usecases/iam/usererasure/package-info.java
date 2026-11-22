/**
 * 用户注销 flow：接收本人或平台运营员注销请求，产出主体停用、抹除及关联撤销。
 * UserDirectory 管只读投影，UserErasureAccess 管二次确认，UserErasureCascade 管同事务级联。
 * 共置注销 sync 与专属结果；不负责一般资料编辑或租户成员管理。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.usecases.iam.usererasure;
