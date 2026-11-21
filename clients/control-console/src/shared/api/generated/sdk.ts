// Generated from contracts/openapi.json. Do not edit.
import createClient, { type FetchOptions } from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';
import type { paths, operations } from './types';
import { checked } from '../validation';
import { multipartBody } from '../transfer';
export function createApi(
  fetcher: (request: Request) => Promise<Response>,
  baseUrl = globalThis.location?.origin ?? 'http://localhost',
) {
  const client = createClient<paths>({ baseUrl, fetch: fetcher });
  return {
    ...{
      updateWebhook: (options: FetchOptions<operations['updateWebhook']>) =>
        checked('updateWebhook', options, () =>
          client.PUT('/webhooks/{id}', { ...options }),
        ),
      setRetention: (options: FetchOptions<operations['setRetention']>) =>
        checked('setRetention', options, () =>
          client.PUT('/api/v1/tenants/{tenantId}/spaces/{spaceId}/retention', {
            ...options,
          }),
        ),
      putSpaceGrant: (options: FetchOptions<operations['putSpaceGrant']>) =>
        checked('putSpaceGrant', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/grants/{principalKey}',
            { ...options },
          ),
        ),
      deleteSpaceGrant: (
        options: FetchOptions<operations['deleteSpaceGrant']>,
      ) =>
        checked('deleteSpaceGrant', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/grants/{principalKey}',
            { ...options },
          ),
        ),
      tagPage: (options: FetchOptions<operations['tagPage']>) =>
        checked('tagPage', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/tags/{label}',
            { ...options },
          ),
        ),
      untagPage: (options: FetchOptions<operations['untagPage']>) =>
        checked('untagPage', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/tags/{label}',
            { ...options },
          ),
        ),
      setPageProperty: (options: FetchOptions<operations['setPageProperty']>) =>
        checked('setPageProperty', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/properties/{field}',
            { ...options },
          ),
        ),
      removePageProperty: (
        options: FetchOptions<operations['removePageProperty']>,
      ) =>
        checked('removePageProperty', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/properties/{field}',
            { ...options },
          ),
        ),
      putPageRestriction: (
        options: FetchOptions<operations['putPageRestriction']>,
      ) =>
        checked('putPageRestriction', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions/restriction',
            { ...options },
          ),
        ),
      deletePageRestriction: (
        options: FetchOptions<operations['deletePageRestriction']>,
      ) =>
        checked('deletePageRestriction', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions/restriction',
            { ...options },
          ),
        ),
      setPageIcon: (options: FetchOptions<operations['setPageIcon']>) =>
        checked('setPageIcon', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/icon',
            { ...options },
          ),
        ),
      viewPageContent: (options: FetchOptions<operations['viewPageContent']>) =>
        checked('viewPageContent', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/content',
            { ...options },
          ),
        ),
      editPage: (options: FetchOptions<operations['editPage']>) =>
        checked('editPage', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/content',
            { ...options },
          ),
        ),
      reorderMountsBySpaceId: (
        options: FetchOptions<operations['reorderMountsBySpaceId']>,
      ) =>
        checked('reorderMountsBySpaceId', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts:order',
            { ...options },
          ),
        ),
      searchConfiguration: (
        options: FetchOptions<operations['searchConfiguration']>,
      ) =>
        checked('searchConfiguration', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/sites/{siteId}/search', {
            ...options,
          }),
        ),
      configureSearch: (options: FetchOptions<operations['configureSearch']>) =>
        checked('configureSearch', options, () =>
          client.PUT('/api/v1/tenants/{tenantId}/sites/{siteId}/search', {
            ...options,
          }),
        ),
      putSiteGrant: (options: FetchOptions<operations['putSiteGrant']>) =>
        checked('putSiteGrant', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/grants/{principalKey}',
            { ...options },
          ),
        ),
      deleteSiteGrant: (options: FetchOptions<operations['deleteSiteGrant']>) =>
        checked('deleteSiteGrant', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/grants/{principalKey}',
            { ...options },
          ),
        ),
      reorderMounts: (options: FetchOptions<operations['reorderMounts']>) =>
        checked('reorderMounts', options, () =>
          client.PUT('/api/v1/tenants/{tenantId}/sites/{siteId}/mounts:order', {
            ...options,
          }),
        ),
      mountSpace: (options: FetchOptions<operations['mountSpace']>) =>
        checked('mountSpace', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}',
            { ...options },
          ),
        ),
      unmountSpace: (options: FetchOptions<operations['unmountSpace']>) =>
        checked('unmountSpace', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}',
            { ...options },
          ),
        ),
      viewPluginDevelopment: (
        options: FetchOptions<operations['viewPluginDevelopment']>,
      ) =>
        checked('viewPluginDevelopment', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/plugin-developments/{id}', {
            ...options,
          }),
        ),
      savePluginDevelopment: (
        options: FetchOptions<operations['savePluginDevelopment']>,
      ) =>
        checked('savePluginDevelopment', options, () =>
          client.PUT('/api/v1/tenants/{tenantId}/plugin-developments/{id}', {
            ...options,
          }),
        ),
      deletePluginDevelopment: (
        options: FetchOptions<operations['deletePluginDevelopment']>,
      ) =>
        checked('deletePluginDevelopment', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/plugin-developments/{id}', {
            ...options,
          }),
        ),
      placeSpace: (options: FetchOptions<operations['placeSpace']>) =>
        checked('placeSpace', options, () =>
          client.PUT(
            '/api/v1/tenants/{tenantId}/collections/{collectionId}/spaces/{spaceId}',
            { ...options },
          ),
        ),
      unplaceSpace: (options: FetchOptions<operations['unplaceSpace']>) =>
        checked('unplaceSpace', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/collections/{collectionId}/spaces/{spaceId}',
            { ...options },
          ),
        ),
      getCurrentUser: (options: FetchOptions<operations['getCurrentUser']>) =>
        checked('getCurrentUser', options, () =>
          client.GET('/api/v1/me', { ...options }),
        ),
      replaceCurrentUser: (
        options: FetchOptions<operations['replaceCurrentUser']>,
      ) =>
        checked('replaceCurrentUser', options, () =>
          client.PUT('/api/v1/me', { ...options }),
        ),
      updateCurrentUser: (
        options: FetchOptions<operations['updateCurrentUser']>,
      ) =>
        checked('updateCurrentUser', options, () =>
          client.PATCH('/api/v1/me', { ...options }),
        ),
      listWebhooks: (options: FetchOptions<operations['listWebhooks']>) =>
        checked('listWebhooks', options, () =>
          client.GET('/webhooks', { ...options }),
        ),
      createWebhook: (options: FetchOptions<operations['createWebhook']>) =>
        checked('createWebhook', options, () =>
          client.POST('/webhooks', { ...options }),
        ),
      rotateWebhook: (options: FetchOptions<operations['rotateWebhook']>) =>
        checked('rotateWebhook', options, () =>
          client.POST('/webhooks/{id}:rotate', { ...options }),
        ),
      redeliverWebhook: (
        options: FetchOptions<operations['redeliverWebhook']>,
      ) =>
        checked('redeliverWebhook', options, () =>
          client.POST('/webhooks/{id}/deliveries/{deliveryId}:redeliver', {
            ...options,
          }),
        ),
      purgeTrash: (options: FetchOptions<operations['purgeTrash']>) =>
        checked('purgeTrash', options, () =>
          client.POST('/ops/trash:purge', { ...options }),
        ),
      retryStorage: (options: FetchOptions<operations['retryStorage']>) =>
        checked('retryStorage', options, () =>
          client.POST('/ops/storage:retry', { ...options }),
        ),
      reindexSearch: (options: FetchOptions<operations['reindexSearch']>) =>
        checked('reindexSearch', options, () =>
          client.POST('/ops/search:reindex', { ...options }),
        ),
      retryMailJob: (options: FetchOptions<operations['retryMailJob']>) =>
        checked('retryMailJob', options, () =>
          client.POST('/ops/mail-jobs/{id}:retry', { ...options }),
        ),
      retryJob: (options: FetchOptions<operations['retryJob']>) =>
        checked('retryJob', options, () =>
          client.POST('/ops/jobs/{jobId}:retry', { ...options }),
        ),
      ingestAnalytics: (options: FetchOptions<operations['ingestAnalytics']>) =>
        checked('ingestAnalytics', options, () =>
          client.POST('/internal/analytics', { ...options }),
        ),
      register: (options: FetchOptions<operations['register']>) =>
        checked('register', options, () =>
          client.POST('/auth/register', { ...options }),
        ),
      refreshSession: (options: FetchOptions<operations['refreshSession']>) =>
        checked('refreshSession', options, () =>
          client.POST('/auth/refresh', { ...options }),
        ),
      resetPassword: (options: FetchOptions<operations['resetPassword']>) =>
        checked('resetPassword', options, () =>
          client.POST('/auth/password:reset', { ...options }),
        ),
      forgotPassword: (options: FetchOptions<operations['forgotPassword']>) =>
        checked('forgotPassword', options, () =>
          client.POST('/auth/password:forgot', { ...options }),
        ),
      logout: (options: FetchOptions<operations['logout']>) =>
        checked('logout', options, () =>
          client.POST('/auth/logout', { ...options }),
        ),
      login: (options: FetchOptions<operations['login']>) =>
        checked('login', options, () =>
          client.POST('/auth/login', { ...options }),
        ),
      verifyEmail: (options: FetchOptions<operations['verifyEmail']>) =>
        checked('verifyEmail', options, () =>
          client.POST('/auth/email:verify', { ...options }),
        ),
      resendVerification: (
        options: FetchOptions<operations['resendVerification']>,
      ) =>
        checked('resendVerification', options, () =>
          client.POST('/auth/email:resend', { ...options }),
        ),
      exportAudit: (options: FetchOptions<operations['exportAudit']>) =>
        checked('exportAudit', options, () =>
          client.POST('/audit:export', { ...options }),
        ),
      list: (options: FetchOptions<operations['list']>) =>
        checked('list', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/tokens', { ...options }),
        ),
      issue: (options: FetchOptions<operations['issue']>) =>
        checked('issue', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/tokens', { ...options }),
        ),
      list_1: (options: FetchOptions<operations['list_1']>) =>
        checked('list_1', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/teams', { ...options }),
        ),
      create: (options: FetchOptions<operations['create']>) =>
        checked('create', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/teams', { ...options }),
        ),
      invitations: (options: FetchOptions<operations['invitations']>) =>
        checked('invitations', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/teams/{teamId}/invitations', {
            ...options,
          }),
        ),
      invite: (options: FetchOptions<operations['invite']>) =>
        checked('invite', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/teams/{teamId}/invitations', {
            ...options,
          }),
        ),
      renameTag: (options: FetchOptions<operations['renameTag']>) =>
        checked('renameTag', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/tags/{label}:rename', {
            ...options,
          }),
        ),
      listSpaces: (options: FetchOptions<operations['listSpaces']>) =>
        checked('listSpaces', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces', { ...options }),
        ),
      createSpace: (options: FetchOptions<operations['createSpace']>) =>
        checked('createSpace', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/spaces', { ...options }),
        ),
      restoreSpace: (options: FetchOptions<operations['restoreSpace']>) =>
        checked('restoreSpace', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/spaces/{spaceId}:restore', {
            ...options,
          }),
        ),
      requestBundleExport: (
        options: FetchOptions<operations['requestBundleExport']>,
      ) =>
        checked('requestBundleExport', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/spaces/{spaceId}:export', {
            ...options,
          }),
        ),
      convertSpace: (options: FetchOptions<operations['convertSpace']>) =>
        checked('convertSpace', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/spaces/{spaceId}:convert', {
            ...options,
          }),
        ),
      archiveSpace: (options: FetchOptions<operations['archiveSpace']>) =>
        checked('archiveSpace', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/spaces/{spaceId}:archive', {
            ...options,
          }),
        ),
      viewToc: (options: FetchOptions<operations['viewToc']>) =>
        checked('viewToc', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries',
            { ...options },
          ),
        ),
      addTocEntry: (options: FetchOptions<operations['addTocEntry']>) =>
        checked('addTocEntry', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries',
            { ...options },
          ),
        ),
      moveTocEntry: (options: FetchOptions<operations['moveTocEntry']>) =>
        checked('moveTocEntry', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}:move',
            { ...options },
          ),
        ),
      importRelease: (options: FetchOptions<operations['importRelease']>) =>
        checked('importRelease', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:import',
            { ...options },
          ),
        ),
      startImportUpload: (
        options: FetchOptions<operations['startImportUpload']>,
      ) =>
        checked('startImportUpload', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:import-uploads',
            { ...options },
          ),
        ),
      buildRelease: (options: FetchOptions<operations['buildRelease']>) =>
        checked('buildRelease', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:build',
            { ...options },
          ),
        ),
      rollbackRelease: (options: FetchOptions<operations['rollbackRelease']>) =>
        checked('rollbackRelease', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:rollback',
            { ...options },
          ),
        ),
      promoteRelease: (options: FetchOptions<operations['promoteRelease']>) =>
        checked('promoteRelease', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:promote',
            { ...options },
          ),
        ),
      discardRelease: (options: FetchOptions<operations['discardRelease']>) =>
        checked('discardRelease', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:discard',
            { ...options },
          ),
        ),
      approveRelease: (options: FetchOptions<operations['approveRelease']>) =>
        checked('approveRelease', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:approve',
            { ...options },
          ),
        ),
      listPages: (options: FetchOptions<operations['listPages']>) =>
        checked('listPages', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages', {
            ...options,
          }),
        ),
      createPage: (options: FetchOptions<operations['createPage']>) =>
        checked('createPage', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages', {
            ...options,
          }),
        ),
      unpublishPages: (options: FetchOptions<operations['unpublishPages']>) =>
        checked('unpublishPages', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:unpublish',
            { ...options },
          ),
        ),
      publishPages: (options: FetchOptions<operations['publishPages']>) =>
        checked('publishPages', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:publish',
            { ...options },
          ),
        ),
      previewPage: (options: FetchOptions<operations['previewPage']>) =>
        checked('previewPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:preview',
            { ...options },
          ),
        ),
      batchGetPages: (options: FetchOptions<operations['batchGetPages']>) =>
        checked('batchGetPages', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:batchGet',
            { ...options },
          ),
        ),
      unpublishPage: (options: FetchOptions<operations['unpublishPage']>) =>
        checked('unpublishPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:unpublish',
            { ...options },
          ),
        ),
      trashPage: (options: FetchOptions<operations['trashPage']>) =>
        checked('trashPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:trash',
            { ...options },
          ),
        ),
      transferPage: (options: FetchOptions<operations['transferPage']>) =>
        checked('transferPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:transfer',
            { ...options },
          ),
        ),
      revertPage: (options: FetchOptions<operations['revertPage']>) =>
        checked('revertPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:revert',
            { ...options },
          ),
        ),
      restorePage: (options: FetchOptions<operations['restorePage']>) =>
        checked('restorePage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:restore',
            { ...options },
          ),
        ),
      reslugPage: (options: FetchOptions<operations['reslugPage']>) =>
        checked('reslugPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:reslug',
            { ...options },
          ),
        ),
      publishPage: (options: FetchOptions<operations['publishPage']>) =>
        checked('publishPage', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:publish',
            { ...options },
          ),
        ),
      attachPageFile: (options: FetchOptions<operations['attachPageFile']>) =>
        checked('attachPageFile', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments',
            { ...options, bodySerializer: multipartBody },
          ),
        ),
      retryBundleExport: (
        options: FetchOptions<operations['retryBundleExport']>,
      ) =>
        checked('retryBundleExport', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}:retry',
            { ...options },
          ),
        ),
      listSites: (options: FetchOptions<operations['listSites']>) =>
        checked('listSites', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/sites', { ...options }),
        ),
      createSite: (options: FetchOptions<operations['createSite']>) =>
        checked('createSite', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/sites', { ...options }),
        ),
      remountSpaceById: (
        options: FetchOptions<operations['remountSpaceById']>,
      ) =>
        checked('remountSpaceById', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts/{spaceId}:remount',
            { ...options },
          ),
        ),
      listRedirects: (options: FetchOptions<operations['listRedirects']>) =>
        checked('listRedirects', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/sites/{siteId}/redirects', {
            ...options,
          }),
        ),
      createRedirect: (options: FetchOptions<operations['createRedirect']>) =>
        checked('createRedirect', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/sites/{siteId}/redirects', {
            ...options,
          }),
        ),
      deleteRedirect: (options: FetchOptions<operations['deleteRedirect']>) =>
        checked('deleteRedirect', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/sites/{siteId}/redirects', {
            ...options,
          }),
        ),
      remountSpace: (options: FetchOptions<operations['remountSpace']>) =>
        checked('remountSpace', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}:remount',
            { ...options },
          ),
        ),
      bindDomain: (options: FetchOptions<operations['bindDomain']>) =>
        checked('bindDomain', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/sites/{siteId}/domains', {
            ...options,
          }),
        ),
      verifyDomain: (options: FetchOptions<operations['verifyDomain']>) =>
        checked('verifyDomain', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}:verify',
            { ...options },
          ),
        ),
      setPrimaryDomain: (
        options: FetchOptions<operations['setPrimaryDomain']>,
      ) =>
        checked('setPrimaryDomain', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}:setPrimary',
            { ...options },
          ),
        ),
      retrySiteDelivery: (
        options: FetchOptions<operations['retrySiteDelivery']>,
      ) =>
        checked('retrySiteDelivery', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/delivery/retry',
            { ...options },
          ),
        ),
      listPluginVerifications: (
        options: FetchOptions<operations['listPluginVerifications']>,
      ) =>
        checked('listPluginVerifications', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/plugin-verifications', {
            ...options,
          }),
        ),
      verifyPluginCandidate: (
        options: FetchOptions<operations['verifyPluginCandidate']>,
      ) =>
        checked('verifyPluginCandidate', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/plugin-verifications', {
            ...options,
          }),
        ),
      listPluginDevelopments: (
        options: FetchOptions<operations['listPluginDevelopments']>,
      ) =>
        checked('listPluginDevelopments', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/plugin-developments', {
            ...options,
          }),
        ),
      createPluginDevelopment: (
        options: FetchOptions<operations['createPluginDevelopment']>,
      ) =>
        checked('createPluginDevelopment', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/plugin-developments', {
            ...options,
          }),
        ),
      listPluginCandidates: (
        options: FetchOptions<operations['listPluginCandidates']>,
      ) =>
        checked('listPluginCandidates', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates',
            { ...options },
          ),
        ),
      compilePluginCandidate: (
        options: FetchOptions<operations['compilePluginCandidate']>,
      ) =>
        checked('compilePluginCandidate', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates',
            { ...options },
          ),
        ),
      listTenantInvitations: (
        options: FetchOptions<operations['listTenantInvitations']>,
      ) =>
        checked('listTenantInvitations', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/invitations', { ...options }),
        ),
      inviteTenantMember: (
        options: FetchOptions<operations['inviteTenantMember']>,
      ) =>
        checked('inviteTenantMember', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/invitations', { ...options }),
        ),
      retryDeletion: (options: FetchOptions<operations['retryDeletion']>) =>
        checked('retryDeletion', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/deletions/{resourceId}:retry',
            { ...options },
          ),
        ),
      listContentTypeVersions: (
        options: FetchOptions<operations['listContentTypeVersions']>,
      ) =>
        checked('listContentTypeVersions', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/content-types/versions', {
            ...options,
          }),
        ),
      registerContentTypeVersion: (
        options: FetchOptions<operations['registerContentTypeVersion']>,
      ) =>
        checked('registerContentTypeVersion', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/content-types/versions', {
            ...options,
          }),
        ),
      deactivateContentType: (
        options: FetchOptions<operations['deactivateContentType']>,
      ) =>
        checked('deactivateContentType', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/content-types/deactivate', {
            ...options,
          }),
        ),
      activateContentType: (
        options: FetchOptions<operations['activateContentType']>,
      ) =>
        checked('activateContentType', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/content-types/activate', {
            ...options,
          }),
        ),
      viewCollections: (options: FetchOptions<operations['viewCollections']>) =>
        checked('viewCollections', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/collections', { ...options }),
        ),
      createCollection: (
        options: FetchOptions<operations['createCollection']>,
      ) =>
        checked('createCollection', options, () =>
          client.POST('/api/v1/tenants/{tenantId}/collections', { ...options }),
        ),
      moveCollection: (options: FetchOptions<operations['moveCollection']>) =>
        checked('moveCollection', options, () =>
          client.POST(
            '/api/v1/tenants/{tenantId}/collections/{collectionId}:move',
            { ...options },
          ),
        ),
      eraseCurrentUser: (
        options: FetchOptions<operations['eraseCurrentUser']>,
      ) =>
        checked('eraseCurrentUser', options, () =>
          client.POST('/api/v1/me:erase', { ...options }),
        ),
      changePassword: (options: FetchOptions<operations['changePassword']>) =>
        checked('changePassword', options, () =>
          client.POST('/api/v1/me/password:change', { ...options }),
        ),
      listManagementTokens: (
        options: FetchOptions<operations['listManagementTokens']>,
      ) =>
        checked('listManagementTokens', options, () =>
          client.GET('/api/v1/me/access-tokens', { ...options }),
        ),
      issueManagementToken: (
        options: FetchOptions<operations['issueManagementToken']>,
      ) =>
        checked('issueManagementToken', options, () =>
          client.POST('/api/v1/me/access-tokens', { ...options }),
        ),
      acceptInvitation: (
        options: FetchOptions<operations['acceptInvitation']>,
      ) =>
        checked('acceptInvitation', options, () =>
          client.POST('/api/v1/invitations/{token}:accept', { ...options }),
        ),
      reactivateAdminUser: (
        options: FetchOptions<operations['reactivateAdminUser']>,
      ) =>
        checked('reactivateAdminUser', options, () =>
          client.POST('/admin/users/{id}:reactivate', { ...options }),
        ),
      eraseAdminUser: (options: FetchOptions<operations['eraseAdminUser']>) =>
        checked('eraseAdminUser', options, () =>
          client.POST('/admin/users/{id}:erase', { ...options }),
        ),
      deactivateAdminUser: (
        options: FetchOptions<operations['deactivateAdminUser']>,
      ) =>
        checked('deactivateAdminUser', options, () =>
          client.POST('/admin/users/{id}:deactivate', { ...options }),
        ),
      listTenants: (options: FetchOptions<operations['listTenants']>) =>
        checked('listTenants', options, () =>
          client.GET('/admin/tenants', { ...options }),
        ),
      provisionTenant: (options: FetchOptions<operations['provisionTenant']>) =>
        checked('provisionTenant', options, () =>
          client.POST('/admin/tenants', { ...options }),
        ),
      suspendTenant: (options: FetchOptions<operations['suspendTenant']>) =>
        checked('suspendTenant', options, () =>
          client.POST('/admin/tenants/{id}:suspend', { ...options }),
        ),
      resumeTenant: (options: FetchOptions<operations['resumeTenant']>) =>
        checked('resumeTenant', options, () =>
          client.POST('/admin/tenants/{id}:resume', { ...options }),
        ),
      view: (options: FetchOptions<operations['view']>) =>
        checked('view', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/teams/{teamId}', {
            ...options,
          }),
        ),
      delete: (options: FetchOptions<operations['delete']>) =>
        checked('delete', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/teams/{teamId}', {
            ...options,
          }),
        ),
      rename: (options: FetchOptions<operations['rename']>) =>
        checked('rename', options, () =>
          client.PATCH('/api/v1/tenants/{tenantId}/teams/{teamId}', {
            ...options,
          }),
        ),
      removeMember: (options: FetchOptions<operations['removeMember']>) =>
        checked('removeMember', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/teams/{teamId}/members/{userId}',
            { ...options },
          ),
        ),
      setRole: (options: FetchOptions<operations['setRole']>) =>
        checked('setRole', options, () =>
          client.PATCH(
            '/api/v1/tenants/{tenantId}/teams/{teamId}/members/{userId}',
            { ...options },
          ),
        ),
      viewSpace: (options: FetchOptions<operations['viewSpace']>) =>
        checked('viewSpace', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}', {
            ...options,
          }),
        ),
      deleteSpace: (options: FetchOptions<operations['deleteSpace']>) =>
        checked('deleteSpace', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/spaces/{spaceId}', {
            ...options,
          }),
        ),
      updateSpace: (options: FetchOptions<operations['updateSpace']>) =>
        checked('updateSpace', options, () =>
          client.PATCH('/api/v1/tenants/{tenantId}/spaces/{spaceId}', {
            ...options,
          }),
        ),
      removeTocEntry: (options: FetchOptions<operations['removeTocEntry']>) =>
        checked('removeTocEntry', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}',
            { ...options },
          ),
        ),
      relabelTocEntry: (options: FetchOptions<operations['relabelTocEntry']>) =>
        checked('relabelTocEntry', options, () =>
          client.PATCH(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}',
            { ...options },
          ),
        ),
      viewRelease: (options: FetchOptions<operations['viewRelease']>) =>
        checked('viewRelease', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}',
            { ...options },
          ),
        ),
      patchRelease: (options: FetchOptions<operations['patchRelease']>) =>
        checked('patchRelease', options, () =>
          client.PATCH(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}',
            { ...options },
          ),
        ),
      viewPage: (options: FetchOptions<operations['viewPage']>) =>
        checked('viewPage', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}',
            { ...options },
          ),
        ),
      renamePage: (options: FetchOptions<operations['renamePage']>) =>
        checked('renamePage', options, () =>
          client.PATCH(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}',
            { ...options },
          ),
        ),
      setPageSeo: (options: FetchOptions<operations['setPageSeo']>) =>
        checked('setPageSeo', options, () =>
          client.PATCH(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/seo',
            { ...options },
          ),
        ),
      viewSite: (options: FetchOptions<operations['viewSite']>) =>
        checked('viewSite', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/sites/{siteId}', {
            ...options,
          }),
        ),
      deleteSite: (options: FetchOptions<operations['deleteSite']>) =>
        checked('deleteSite', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/sites/{siteId}', {
            ...options,
          }),
        ),
      updateSite: (options: FetchOptions<operations['updateSite']>) =>
        checked('updateSite', options, () =>
          client.PATCH('/api/v1/tenants/{tenantId}/sites/{siteId}', {
            ...options,
          }),
        ),
      removeTenantMember: (
        options: FetchOptions<operations['removeTenantMember']>,
      ) =>
        checked('removeTenantMember', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/members/{userId}', {
            ...options,
          }),
        ),
      setTenantMemberRole: (
        options: FetchOptions<operations['setTenantMemberRole']>,
      ) =>
        checked('setTenantMemberRole', options, () =>
          client.PATCH('/api/v1/tenants/{tenantId}/members/{userId}', {
            ...options,
          }),
        ),
      removeCollection: (
        options: FetchOptions<operations['removeCollection']>,
      ) =>
        checked('removeCollection', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/collections/{collectionId}',
            { ...options },
          ),
        ),
      patchCollection: (options: FetchOptions<operations['patchCollection']>) =>
        checked('patchCollection', options, () =>
          client.PATCH(
            '/api/v1/tenants/{tenantId}/collections/{collectionId}',
            { ...options },
          ),
        ),
      listWebhookDeliveries: (
        options: FetchOptions<operations['listWebhookDeliveries']>,
      ) =>
        checked('listWebhookDeliveries', options, () =>
          client.GET('/webhooks/{id}/deliveries', { ...options }),
        ),
      tenantUsage: (options: FetchOptions<operations['tenantUsage']>) =>
        checked('tenantUsage', options, () =>
          client.GET('/stats/tenants/{id}', { ...options }),
        ),
      spaceUsage: (options: FetchOptions<operations['spaceUsage']>) =>
        checked('spaceUsage', options, () =>
          client.GET('/stats/spaces/{id}', { ...options }),
        ),
      siteTraffic: (options: FetchOptions<operations['siteTraffic']>) =>
        checked('siteTraffic', options, () =>
          client.GET('/stats/sites/{id}/traffic', { ...options }),
        ),
      siteSearchStats: (options: FetchOptions<operations['siteSearchStats']>) =>
        checked('siteSearchStats', options, () =>
          client.GET('/stats/sites/{id}/search', { ...options }),
        ),
      readiness: (options: FetchOptions<operations['readiness']>) =>
        checked('readiness', options, () =>
          client.GET('/readyz', { ...options }),
        ),
      storageUsage: (options: FetchOptions<operations['storageUsage']>) =>
        checked('storageUsage', options, () =>
          client.GET('/ops/storage', { ...options }),
        ),
      listMailJobs: (options: FetchOptions<operations['listMailJobs']>) =>
        checked('listMailJobs', options, () =>
          client.GET('/ops/mail-jobs', { ...options }),
        ),
      listJobs: (options: FetchOptions<operations['listJobs']>) =>
        checked('listJobs', options, () =>
          client.GET('/ops/jobs', { ...options }),
        ),
      domainCertificate: (
        options: FetchOptions<operations['domainCertificate']>,
      ) =>
        checked('domainCertificate', options, () =>
          client.GET('/ops/domains/{host}/certificate', { ...options }),
        ),
      allowDomain: (options: FetchOptions<operations['allowDomain']>) =>
        checked('allowDomain', options, () =>
          client.GET('/ops/domains/allowed', { ...options }),
        ),
      health: (options: FetchOptions<operations['health']>) =>
        checked('health', options, () =>
          client.GET('/healthz', { ...options }),
        ),
      listAudit: (options: FetchOptions<operations['listAudit']>) =>
        checked('listAudit', options, () =>
          client.GET('/audit', { ...options }),
        ),
      viewAuditExport: (options: FetchOptions<operations['viewAuditExport']>) =>
        checked('viewAuditExport', options, () =>
          client.GET('/audit/exports/{id}', { ...options }),
        ),
      downloadAuditExport: (
        options: FetchOptions<operations['downloadAuditExport']>,
      ) =>
        checked('downloadAuditExport', options, () =>
          client.GET('/audit/exports/{id}/content', {
            ...options,
            parseAs: 'text',
          }),
        ),
      members: (options: FetchOptions<operations['members']>) =>
        checked('members', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/teams/{teamId}/members', {
            ...options,
          }),
        ),
      listTags: (options: FetchOptions<operations['listTags']>) =>
        checked('listTags', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/tags', { ...options }),
        ),
      listTaggedPages: (options: FetchOptions<operations['listTaggedPages']>) =>
        checked('listTaggedPages', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/tags/{label}/pages', {
            ...options,
          }),
        ),
      planSpaceTermination: (
        options: FetchOptions<operations['planSpaceTermination']>,
      ) =>
        checked('planSpaceTermination', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}:deletion-plan',
            { ...options },
          ),
        ),
      listTrash: (options: FetchOptions<operations['listTrash']>) =>
        checked('listTrash', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}/trash', {
            ...options,
          }),
        ),
      listReleases: (options: FetchOptions<operations['listReleases']>) =>
        checked('listReleases', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases', {
            ...options,
          }),
        ),
      diffReleases: (options: FetchOptions<operations['diffReleases']>) =>
        checked('diffReleases', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:diff',
            { ...options },
          ),
        ),
      listReleasePreviewPages: (
        options: FetchOptions<operations['listReleasePreviewPages']>,
      ) =>
        checked('listReleasePreviewPages', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview',
            { ...options },
          ),
        ),
      previewRelease: (options: FetchOptions<operations['previewRelease']>) =>
        checked('previewRelease', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview/{slug}',
            { ...options },
          ),
        ),
      previewReleaseByPageId: (
        options: FetchOptions<operations['previewReleaseByPageId']>,
      ) =>
        checked('previewReleaseByPageId', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview/by-id/{pageId}',
            { ...options },
          ),
        ),
      listSpacePermissions: (
        options: FetchOptions<operations['listSpacePermissions']>,
      ) =>
        checked('listSpacePermissions', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions',
            { ...options },
          ),
        ),
      searchPermissionUsers: (
        options: FetchOptions<operations['searchPermissionUsers']>,
      ) =>
        checked('searchPermissionUsers', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/principals/users',
            { ...options },
          ),
        ),
      searchPermissionTeams: (
        options: FetchOptions<operations['searchPermissionTeams']>,
      ) =>
        checked('searchPermissionTeams', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/principals/teams',
            { ...options },
          ),
        ),
      listPermissionPages: (
        options: FetchOptions<operations['listPermissionPages']>,
      ) =>
        checked('listPermissionPages', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/pages',
            { ...options },
          ),
        ),
      listPageRevisions: (
        options: FetchOptions<operations['listPageRevisions']>,
      ) =>
        checked('listPageRevisions', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions',
            { ...options },
          ),
        ),
      diffPageRevisions: (
        options: FetchOptions<operations['diffPageRevisions']>,
      ) =>
        checked('diffPageRevisions', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions:diff',
            { ...options },
          ),
        ),
      viewPageRevision: (
        options: FetchOptions<operations['viewPageRevision']>,
      ) =>
        checked('viewPageRevision', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions/{revision}',
            { ...options },
          ),
        ),
      viewPagePermission: (
        options: FetchOptions<operations['viewPagePermission']>,
      ) =>
        checked('viewPagePermission', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions',
            { ...options },
          ),
        ),
      explainPageRead: (options: FetchOptions<operations['explainPageRead']>) =>
        checked('explainPageRead', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions:effective',
            { ...options },
          ),
        ),
      viewPageAttachment: (
        options: FetchOptions<operations['viewPageAttachment']>,
      ) =>
        checked('viewPageAttachment', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}',
            { ...options },
          ),
        ),
      detachPageFile: (options: FetchOptions<operations['detachPageFile']>) =>
        checked('detachPageFile', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}',
            { ...options },
          ),
        ),
      downloadPageAttachment: (
        options: FetchOptions<operations['downloadPageAttachment']>,
      ) =>
        checked('downloadPageAttachment', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}/content',
            { ...options, parseAs: 'blob' },
          ),
        ),
      listSpaceMounts: (options: FetchOptions<operations['listSpaceMounts']>) =>
        checked('listSpaceMounts', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}/mounts', {
            ...options,
          }),
        ),
      viewImportJob: (options: FetchOptions<operations['viewImportJob']>) =>
        checked('viewImportJob', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/import-jobs/{jobId}',
            { ...options },
          ),
        ),
      listBundleExports: (
        options: FetchOptions<operations['listBundleExports']>,
      ) =>
        checked('listBundleExports', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports', {
            ...options,
          }),
        ),
      viewBundleExport: (
        options: FetchOptions<operations['viewBundleExport']>,
      ) =>
        checked('viewBundleExport', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}',
            { ...options },
          ),
        ),
      downloadBundleExport: (
        options: FetchOptions<operations['downloadBundleExport']>,
      ) =>
        checked('downloadBundleExport', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}/download',
            { ...options, parseAs: 'blob' },
          ),
        ),
      viewDrift: (options: FetchOptions<operations['viewDrift']>) =>
        checked('viewDrift', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/spaces/{spaceId}/drift', {
            ...options,
          }),
        ),
      listSpaceAttachments: (
        options: FetchOptions<operations['listSpaceAttachments']>,
      ) =>
        checked('listSpaceAttachments', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/spaces/{spaceId}/attachments',
            { ...options },
          ),
        ),
      planSiteTermination: (
        options: FetchOptions<operations['planSiteTermination']>,
      ) =>
        checked('planSiteTermination', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/sites/{siteId}:deletion-plan',
            { ...options },
          ),
        ),
      listSitePermissions: (
        options: FetchOptions<operations['listSitePermissions']>,
      ) =>
        checked('listSitePermissions', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/sites/{siteId}/permissions', {
            ...options,
          }),
        ),
      explainSiteAdmin: (
        options: FetchOptions<operations['explainSiteAdmin']>,
      ) =>
        checked('explainSiteAdmin', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions:effective',
            { ...options },
          ),
        ),
      searchSitePermissionUsers: (
        options: FetchOptions<operations['searchSitePermissionUsers']>,
      ) =>
        checked('searchSitePermissionUsers', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/principals/users',
            { ...options },
          ),
        ),
      searchSitePermissionTeams: (
        options: FetchOptions<operations['searchSitePermissionTeams']>,
      ) =>
        checked('searchSitePermissionTeams', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/principals/teams',
            { ...options },
          ),
        ),
      viewDomain: (options: FetchOptions<operations['viewDomain']>) =>
        checked('viewDomain', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}',
            { ...options },
          ),
        ),
      unbindDomain: (options: FetchOptions<operations['unbindDomain']>) =>
        checked('unbindDomain', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}',
            { ...options },
          ),
        ),
      siteDeliveryStatus: (
        options: FetchOptions<operations['siteDeliveryStatus']>,
      ) =>
        checked('siteDeliveryStatus', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/sites/{siteId}/delivery', {
            ...options,
          }),
        ),
      listTenantReleases: (
        options: FetchOptions<operations['listTenantReleases']>,
      ) =>
        checked('listTenantReleases', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/releases', { ...options }),
        ),
      viewPluginVerification: (
        options: FetchOptions<operations['viewPluginVerification']>,
      ) =>
        checked('viewPluginVerification', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/plugin-verifications/{id}', {
            ...options,
          }),
        ),
      viewPluginCandidate: (
        options: FetchOptions<operations['viewPluginCandidate']>,
      ) =>
        checked('viewPluginCandidate', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates/{candidateId}',
            { ...options },
          ),
        ),
      operationsCapabilities: (
        options: FetchOptions<operations['operationsCapabilities']>,
      ) =>
        checked('operationsCapabilities', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/operations', { ...options }),
        ),
      listTenantMembers: (
        options: FetchOptions<operations['listTenantMembers']>,
      ) =>
        checked('listTenantMembers', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/members', { ...options }),
        ),
      listTenantDomains: (
        options: FetchOptions<operations['listTenantDomains']>,
      ) =>
        checked('listTenantDomains', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/domains', { ...options }),
        ),
      listDeletions: (options: FetchOptions<operations['listDeletions']>) =>
        checked('listDeletions', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/deletions', { ...options }),
        ),
      listContentTypes: (
        options: FetchOptions<operations['listContentTypes']>,
      ) =>
        checked('listContentTypes', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/content-types', {
            ...options,
          }),
        ),
      viewContentTypeVersion: (
        options: FetchOptions<operations['viewContentTypeVersion']>,
      ) =>
        checked('viewContentTypeVersion', options, () =>
          client.GET(
            '/api/v1/tenants/{tenantId}/content-types/versions/{versionRef}',
            { ...options },
          ),
        ),
      contentPluginCatalog: (
        options: FetchOptions<operations['contentPluginCatalog']>,
      ) =>
        checked('contentPluginCatalog', options, () =>
          client.GET('/api/v1/tenants/{tenantId}/content-plugins', {
            ...options,
          }),
        ),
      listSessions: (options: FetchOptions<operations['listSessions']>) =>
        checked('listSessions', options, () =>
          client.GET('/api/v1/me/sessions', { ...options }),
        ),
      previewInvitation: (
        options: FetchOptions<operations['previewInvitation']>,
      ) =>
        checked('previewInvitation', options, () =>
          client.GET('/api/v1/invitations/{token}', { ...options }),
        ),
      authenticationContext: (
        options: FetchOptions<operations['authenticationContext']>,
      ) =>
        checked('authenticationContext', options, () =>
          client.GET('/api/v1/auth/context', { ...options }),
        ),
      searchAdminUsers: (
        options: FetchOptions<operations['searchAdminUsers']>,
      ) =>
        checked('searchAdminUsers', options, () =>
          client.GET('/admin/users', { ...options }),
        ),
      getAdminUser: (options: FetchOptions<operations['getAdminUser']>) =>
        checked('getAdminUser', options, () =>
          client.GET('/admin/users/{id}', { ...options }),
        ),
      platformHealth: (options: FetchOptions<operations['platformHealth']>) =>
        checked('platformHealth', options, () =>
          client.GET('/admin/health', { ...options }),
        ),
      keys: (options: FetchOptions<operations['keys']>) =>
        checked('keys', options, () =>
          client.GET('/.well-known/jwks.json', { ...options }),
        ),
      revoke: (options: FetchOptions<operations['revoke']>) =>
        checked('revoke', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/tokens/{tokenId}', {
            ...options,
          }),
        ),
      revoke_1: (options: FetchOptions<operations['revoke_1']>) =>
        checked('revoke_1', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/teams/{teamId}/invitations/{inviteId}',
            { ...options },
          ),
        ),
      unmountSpaceById: (
        options: FetchOptions<operations['unmountSpaceById']>,
      ) =>
        checked('unmountSpaceById', options, () =>
          client.DELETE(
            '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts/{spaceId}',
            { ...options },
          ),
        ),
      revokeTenantInvitation: (
        options: FetchOptions<operations['revokeTenantInvitation']>,
      ) =>
        checked('revokeTenantInvitation', options, () =>
          client.DELETE('/api/v1/tenants/{tenantId}/invitations/{inviteId}', {
            ...options,
          }),
        ),
      endSession: (options: FetchOptions<operations['endSession']>) =>
        checked('endSession', options, () =>
          client.DELETE('/api/v1/me/sessions/{id}', { ...options }),
        ),
      revokeManagementToken: (
        options: FetchOptions<operations['revokeManagementToken']>,
      ) =>
        checked('revokeManagementToken', options, () =>
          client.DELETE('/api/v1/me/access-tokens/{tokenId}', { ...options }),
        ),
    },
    query: createQueryClient(client),
  };
}
export type Api = ReturnType<typeof createApi>;
