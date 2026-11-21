package io.edition.control.bootstrap;

import io.edition.concepts.analytics.adapters.AnalyticsConfiguration;
import io.edition.concepts.apitoken.adapters.ApiTokenConfiguration;
import io.edition.concepts.audit.adapters.AuditConfiguration;
import io.edition.concepts.bundleexport.adapters.BundleExportConfiguration;
import io.edition.concepts.certificateinspection.adapters.CertificateInspectionConfiguration;
import io.edition.concepts.collection.adapters.CollectionConfiguration;
import io.edition.concepts.contenttype.adapters.ContentTypeConfiguration;
import io.edition.concepts.customdomain.adapters.CustomDomainConfiguration;
import io.edition.concepts.deletionrecovery.adapters.DeletionRecoveryConfiguration;
import io.edition.concepts.dnslookup.adapters.DnsLookupConfiguration;
import io.edition.concepts.idempotency.adapters.IdempotencyConfiguration;
import io.edition.concepts.importformat.adapters.ImportFormatConfiguration;
import io.edition.concepts.importjob.adapters.ImportJobConfiguration;
import io.edition.concepts.mailoutbox.adapters.MailOutboxConfiguration;
import io.edition.concepts.managementtoken.adapters.ManagementTokenConfiguration;
import io.edition.concepts.membership.adapters.MembershipConfiguration;
import io.edition.concepts.objectstore.adapters.ObjectStoreConfiguration;
import io.edition.concepts.page.adapters.PageConfiguration;
import io.edition.concepts.password.adapters.PasswordConfiguration;
import io.edition.concepts.permission.adapters.PermissionConfiguration;
import io.edition.concepts.plugindevelopment.adapters.PluginDevelopmentConfiguration;
import io.edition.concepts.pluginverification.adapters.PluginVerificationConfiguration;
import io.edition.concepts.readersecurity.adapters.ReaderSecurityConfiguration;
import io.edition.concepts.redirect.adapters.RedirectConfiguration;
import io.edition.concepts.release.adapters.ReleaseConfiguration;
import io.edition.concepts.revision.adapters.RevisionConfiguration;
import io.edition.concepts.search.adapters.SearchConfiguration;
import io.edition.concepts.servicehealth.adapters.ServiceHealthConfiguration;
import io.edition.concepts.session.adapters.SessionConfiguration;
import io.edition.concepts.site.adapters.SiteConfiguration;
import io.edition.concepts.space.adapters.SpaceConfiguration;
import io.edition.concepts.tag.adapters.TagConfiguration;
import io.edition.concepts.team.adapters.TeamConfiguration;
import io.edition.concepts.tenantregistry.adapters.TenantRegistryConfiguration;
import io.edition.concepts.toc.adapters.TocConfiguration;
import io.edition.concepts.user.adapters.UserConfiguration;
import io.edition.concepts.webhook.adapters.WebhookConfiguration;

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
