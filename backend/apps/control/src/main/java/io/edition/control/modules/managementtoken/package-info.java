/** 用户管理凭据；身份有效性与授权由组合层执行。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.managementtoken",
        displayName = "ManagementToken",
        allowedDependencies = {"shared"})
package io.edition.control.modules.managementtoken;

import io.edition.control.modules.managementtoken.api.*;
