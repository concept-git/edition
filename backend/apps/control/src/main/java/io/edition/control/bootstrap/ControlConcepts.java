package io.edition.control.bootstrap;

import io.edition.control.modules.analytics.AnalyticsConfiguration;
import io.edition.control.modules.apitoken.ApiTokenConfiguration;
import io.edition.control.modules.audit.AuditConfiguration;
import io.edition.control.modules.bundleexport.BundleExportConfiguration;
import io.edition.control.modules.certificateinspection.CertificateInspectionConfiguration;
import io.edition.control.modules.collection.CollectionConfiguration;
import io.edition.control.modules.contenttype.ContentTypeConfiguration;
import io.edition.control.modules.customdomain.CustomDomainConfiguration;
import io.edition.control.modules.deletionrecovery.DeletionRecoveryConfiguration;
import io.edition.control.modules.dnslookup.DnsLookupConfiguration;
import io.edition.control.modules.idempotency.IdempotencyConfiguration;
import io.edition.control.modules.importformat.ImportFormatConfiguration;
import io.edition.control.modules.importjob.ImportJobConfiguration;
import io.edition.control.modules.mailoutbox.MailOutboxConfiguration;
import io.edition.control.modules.managementtoken.ManagementTokenConfiguration;
import io.edition.control.modules.membership.MembershipConfiguration;
import io.edition.control.modules.objectstore.ObjectStoreConfiguration;
import io.edition.control.modules.page.PageConfiguration;
import io.edition.control.modules.password.PasswordConfiguration;
import io.edition.control.modules.permission.PermissionConfiguration;
import io.edition.control.modules.plugindevelopment.PluginDevelopmentConfiguration;
import io.edition.control.modules.pluginverification.PluginVerificationConfiguration;
import io.edition.control.modules.readersecurity.ReaderSecurityConfiguration;
import io.edition.control.modules.redirect.RedirectConfiguration;
import io.edition.control.modules.release.ReleaseConfiguration;
import io.edition.control.modules.revision.RevisionConfiguration;
import io.edition.control.modules.search.SearchConfiguration;
import io.edition.control.modules.servicehealth.ServiceHealthConfiguration;
import io.edition.control.modules.session.SessionConfiguration;
import io.edition.control.modules.site.SiteConfiguration;
import io.edition.control.modules.space.SpaceConfiguration;
import io.edition.control.modules.tag.TagConfiguration;
import io.edition.control.modules.team.TeamConfiguration;
import io.edition.control.modules.tenantregistry.TenantRegistryConfiguration;
import io.edition.control.modules.toc.TocConfiguration;
import io.edition.control.modules.user.UserConfiguration;
import io.edition.control.modules.webhook.WebhookConfiguration;

/** Final application assembly of the declared concept instances. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.Import({
    CollectionConfiguration.class,
    PageConfiguration.class,
    PasswordConfiguration.class,
    RevisionConfiguration.class,
    SpaceConfiguration.class,
    TagConfiguration.class,
    TocConfiguration.class,
    CustomDomainConfiguration.class,
    RedirectConfiguration.class,
    SearchConfiguration.class,
    SiteConfiguration.class,
    ApiTokenConfiguration.class,
    ManagementTokenConfiguration.class,
    MembershipConfiguration.class,
    PermissionConfiguration.class,
    SessionConfiguration.class,
    TeamConfiguration.class,
    UserConfiguration.class,
    ReleaseConfiguration.class,
    AnalyticsConfiguration.class,
    AuditConfiguration.class,
    BundleExportConfiguration.class,
    CertificateInspectionConfiguration.class,
    ContentTypeConfiguration.class,
    DeletionRecoveryConfiguration.class,
    DnsLookupConfiguration.class,
    IdempotencyConfiguration.class,
    ImportFormatConfiguration.class,
    ImportJobConfiguration.class,
    MailOutboxConfiguration.class,
    ObjectStoreConfiguration.class,
    PluginDevelopmentConfiguration.class,
    PluginVerificationConfiguration.class,
    ReaderSecurityConfiguration.class,
    ServiceHealthConfiguration.class,
    TenantRegistryConfiguration.class,
    WebhookConfiguration.class
})
public class ControlConcepts {}
