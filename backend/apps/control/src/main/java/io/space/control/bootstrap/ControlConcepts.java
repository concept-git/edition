package io.space.control.bootstrap;

import io.space.concepts.analytics.adapters.AnalyticsConfiguration;
import io.space.concepts.apitoken.adapters.ApiTokenConfiguration;
import io.space.concepts.audit.adapters.AuditConfiguration;
import io.space.concepts.bundleexport.adapters.BundleExportConfiguration;
import io.space.concepts.certificateinspection.adapters.CertificateInspectionConfiguration;
import io.space.concepts.collection.adapters.CollectionConfiguration;
import io.space.concepts.contenttype.adapters.ContentTypeConfiguration;
import io.space.concepts.customdomain.adapters.CustomDomainConfiguration;
import io.space.concepts.deletionrecovery.adapters.DeletionRecoveryConfiguration;
import io.space.concepts.dnslookup.adapters.DnsLookupConfiguration;
import io.space.concepts.idempotency.adapters.IdempotencyConfiguration;
import io.space.concepts.importformat.adapters.ImportFormatConfiguration;
import io.space.concepts.importjob.adapters.ImportJobConfiguration;
import io.space.concepts.mailoutbox.adapters.MailOutboxConfiguration;
import io.space.concepts.managementtoken.adapters.ManagementTokenConfiguration;
import io.space.concepts.membership.adapters.MembershipConfiguration;
import io.space.concepts.objectstore.adapters.ObjectStoreConfiguration;
import io.space.concepts.page.adapters.PageConfiguration;
import io.space.concepts.password.adapters.PasswordConfiguration;
import io.space.concepts.permission.adapters.PermissionConfiguration;
import io.space.concepts.plugindevelopment.adapters.PluginDevelopmentConfiguration;
import io.space.concepts.pluginverification.adapters.PluginVerificationConfiguration;
import io.space.concepts.readersecurity.adapters.ReaderSecurityConfiguration;
import io.space.concepts.redirect.adapters.RedirectConfiguration;
import io.space.concepts.release.adapters.ReleaseConfiguration;
import io.space.concepts.revision.adapters.RevisionConfiguration;
import io.space.concepts.search.adapters.SearchConfiguration;
import io.space.concepts.servicehealth.adapters.ServiceHealthConfiguration;
import io.space.concepts.session.adapters.SessionConfiguration;
import io.space.concepts.site.adapters.SiteConfiguration;
import io.space.concepts.space.adapters.SpaceConfiguration;
import io.space.concepts.tag.adapters.TagConfiguration;
import io.space.concepts.team.adapters.TeamConfiguration;
import io.space.concepts.tenantregistry.adapters.TenantRegistryConfiguration;
import io.space.concepts.toc.adapters.TocConfiguration;
import io.space.concepts.user.adapters.UserConfiguration;
import io.space.concepts.webhook.adapters.WebhookConfiguration;

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
