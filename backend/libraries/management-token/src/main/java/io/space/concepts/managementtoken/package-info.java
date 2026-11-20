/** 用户管理凭据；身份有效性与授权由组合层执行。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.managementtoken",
        displayName = "ManagementToken",
        allowedDependencies = {"shared"})
package io.space.concepts.managementtoken;

import io.space.concepts.managementtoken.api.*;
