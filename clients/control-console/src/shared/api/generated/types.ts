// Generated from contracts/openapi.json. Do not edit.
export interface paths {
  '/webhooks/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Edit or disable a webhook subscription */
    put: operations['updateWebhook'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/retention': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Set how many archived Releases to keep */
    put: operations['setRetention'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/grants/{principalKey}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Create or replace a local Space grant */
    put: operations['putSpaceGrant'];
    post?: never;
    /** Delete a local Space grant */
    delete: operations['deleteSpaceGrant'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/tags/{label}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Tag a Page; idempotent; does not bump revision */
    put: operations['tagPage'];
    post?: never;
    /** Remove a tag from a Page; missing labels are idempotent */
    delete: operations['untagPage'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/properties/{field}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Upsert one free-form Page property */
    put: operations['setPageProperty'];
    post?: never;
    /** Remove one Page property (idempotent) */
    delete: operations['removePageProperty'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions/restriction': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Replace the complete Page restriction */
    put: operations['putPageRestriction'];
    post?: never;
    /** Remove the Page restriction */
    delete: operations['deletePageRestriction'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/icon': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Set or clear the Page icon URL */
    put: operations['setPageIcon'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/content': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Read atomic Page content and its content ETag
     * @description The rev-N ETag covers content and its interpretation profile from one baseline; use it as If-Match when replacing content.
     */
    get: operations['viewPageContent'];
    /** Replace Page content at a strong baseline */
    put: operations['editPage'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts:order': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Reorder mounts using the complete sequence of Space IDs */
    put: operations['reorderMountsBySpaceId'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read desired search field order */
    get: operations['searchConfiguration'];
    /** Queue a search field order change */
    put: operations['configureSearch'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/grants/{principalKey}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Create or replace a local Site grant */
    put: operations['putSiteGrant'];
    post?: never;
    /** Delete a local Site grant */
    delete: operations['deleteSiteGrant'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts:order': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Reorder Site mounts */
    put: operations['reorderMounts'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Mount a Space at a Site slug */
    put: operations['mountSpace'];
    post?: never;
    /** Unmount a Space from a Site slug */
    delete: operations['unmountSpace'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/plugin-developments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read the current source and baseline */
    get: operations['viewPluginDevelopment'];
    /** Atomically save source using the current baseline */
    put: operations['savePluginDevelopment'];
    post?: never;
    /** Archive the editable source while preserving immutable evidence */
    delete: operations['deletePluginDevelopment'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/collections/{collectionId}/spaces/{spaceId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Place a Space into a Collection */
    put: operations['placeSpace'];
    post?: never;
    /** Remove a Space from this Collection if present */
    delete: operations['unplaceSpace'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read the authenticated user's profile */
    get: operations['getCurrentUser'];
    /**
     * Replace the authenticated user's complete profile
     * @description All fields must be present. Explicit null clears locale or avatar; omitted fields are rejected without changing the profile.
     */
    put: operations['replaceCurrentUser'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Replace the authenticated user's profile
     * @deprecated
     * @description Deprecated full replacement: name is required, an omitted locale or avatar clears the stored value. Use PUT /me with all fields explicit.
     */
    patch: operations['updateCurrentUser'];
    trace?: never;
  };
  '/webhooks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List tenant webhook subscriptions without secrets */
    get: operations['listWebhooks'];
    put?: never;
    /** Create a signed webhook subscription */
    post: operations['createWebhook'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/webhooks/{id}:rotate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rotate the signing secret; returned once */
    post: operations['rotateWebhook'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/webhooks/{id}/deliveries/{deliveryId}:redeliver': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Redeliver the same event with a new attempt */
    post: operations['redeliverWebhook'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/trash:purge': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Scan expired trash without bypassing reference protection */
    post: operations['purgeTrash'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/storage:retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Requeue failed source cleanup without bypassing reference protection */
    post: operations['retryStorage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/search:reindex': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Queue a complete search rebuild as platform operator */
    post: operations['reindexSearch'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/mail-jobs/{id}:retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Replay the original failed mail intent */
    post: operations['retryMailJob'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/jobs/{jobId}:retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retry a failed import with current publish authorization */
    post: operations['retryJob'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/internal/analytics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Internal scoped collector ingestion */
    post: operations['ingestAnalytics'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/register': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Register a new account
     * @description Creates the user, sets the password and issues an email verification token. The verification email intent is persisted for asynchronous delivery.
     */
    post: operations['register'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/refresh': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rotate the refresh cookie and issue a new access token */
    post: operations['refreshSession'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/password:reset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Redeem a one-time password reset token */
    post: operations['resetPassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/password:forgot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Request a password reset
     * @description Always returns the same accepted response for unknown, inactive and active accounts.
     */
    post: operations['forgotPassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/logout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Revoke the current device session
     * @description Idempotent: always clears the refresh cookie, with or without a valid session.
     */
    post: operations['logout'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Exchange credentials for an access token
     * @description Returns the access token in the body and the refresh token as a Secure/HttpOnly/SameSite=Lax cookie scoped to /auth. The refresh token never appears in JSON.
     */
    post: operations['login'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/email:verify': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Redeem an email verification token */
    post: operations['verifyEmail'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/email:resend': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Request a new verification email
     * @description Uniform accepted response; does not disclose identity eligibility or delivery outcome.
     */
    post: operations['resendVerification'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/audit:export': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a snapshot CSV export of all filtered audit records */
    post: operations['exportAudit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/tokens': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['list'];
    put?: never;
    post: operations['issue'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['list_1'];
    put?: never;
    post: operations['create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/teams/{teamId}/invitations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['invitations'];
    put?: never;
    /**
     * Invite an existing tenant member to the team
     * @description The invited account must already belong to the tenant. Team roles are owner or member.
     */
    post: operations['invite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/tags/{label}:rename': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rename a tag across the tenant; merge if the target exists */
    post: operations['renameTag'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List readable Spaces with an opaque cursor */
    get: operations['listSpaces'];
    put?: never;
    /** Create a tenant Space */
    post: operations['createSpace'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}:restore': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Restore an archived Space */
    post: operations['restoreSpace'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}:export': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Queue a complete portable ZIP for a retained live or archived release */
    post: operations['requestBundleExport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}:convert': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Convert a Space between authored and synced modes */
    post: operations['convertSpace'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}:archive': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Archive a Space */
    post: operations['archiveSpace'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read the Space directory tree in author order */
    get: operations['viewToc'];
    put?: never;
    /** Add a directory entry */
    post: operations['addTocEntry'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}:move': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Move a directory entry */
    post: operations['moveTocEntry'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:import': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Import a zip or uploadKey into a synced Space and enqueue the job */
    post: operations['importRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:import-uploads': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a short-lived PUT URL for a large import zip */
    post: operations['startImportUpload'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:build': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Build a Release from published Pages and promote when it differs */
    post: operations['buildRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:rollback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Promote an archived Release back to live */
    post: operations['rollbackRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:promote': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Promote a validated or archived Release */
    post: operations['promoteRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:discard': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Discard a draft, flagged or validated Release */
    post: operations['discardRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:approve': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Approve a flagged import Release and promote it */
    post: operations['approveRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List readable Pages in a Space */
    get: operations['listPages'];
    put?: never;
    /** Create and place an authored Page */
    post: operations['createPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:unpublish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Atomically deselect up to 100 Pages with one publication pipeline */
    post: operations['unpublishPages'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Atomically select up to 100 Pages for one publication pipeline */
    post: operations['publishPages'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:preview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Render a safe Page preview without persistence */
    post: operations['previewPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:batchGet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Read up to 100 selected Pages without writes; at most 4MiB */
    post: operations['batchGetPages'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:unpublish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Mark a Page unpublished and auto-promote when wiki mode is on */
    post: operations['unpublishPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:trash': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Move a Page to trash without deleting it */
    post: operations['trashPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:transfer': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Move a Page to another Space and register redirects */
    post: operations['transferPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:revert': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Save historical content as a new Revision */
    post: operations['revertPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:restore': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Restore a trashed Page without re-hanging the Toc */
    post: operations['restorePage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:reslug': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Change a Page slug and register redirects */
    post: operations['reslugPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Mark a Page published and auto-promote when wiki mode is on */
    post: operations['publishPage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Upload one attachment (≤10 MiB; png/jpeg/gif/webp/pdf detected from content) */
    post: operations['attachPageFile'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}:retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retry the same failed captured export after checking current permissions */
    post: operations['retryBundleExport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List readable Sites with an opaque cursor */
    get: operations['listSites'];
    put?: never;
    /** Create a tenant Site */
    post: operations['createSite'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts/{spaceId}:remount': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Change the mount address of a Space identified by ID */
    post: operations['remountSpaceById'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/redirects': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Site redirect rules */
    get: operations['listRedirects'];
    put?: never;
    /**
     * Create or replace a manual redirect
     * @description The target Space must be mounted on this Site. A page target must belong to a mounted Space.
     */
    post: operations['createRedirect'];
    /** Delete a manual redirect */
    delete: operations['deleteRedirect'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}:remount': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Change a Site mount slug and register a redirect */
    post: operations['remountSpace'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/domains': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bind a custom domain to a Site */
    post: operations['bindDomain'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}:verify': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Verify a custom domain via DNS TXT */
    post: operations['verifyDomain'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}:setPrimary': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Mark a verified custom domain as primary */
    post: operations['setPrimaryDomain'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/delivery/retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retry the existing durable publication without republishing */
    post: operations['retrySiteDelivery'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/plugin-verifications': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List immutable verification evidence */
    get: operations['listPluginVerifications'];
    put?: never;
    /** Bind browser evidence and independent server validation to candidate fixtures */
    post: operations['verifyPluginCandidate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/plugin-developments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List tenant plugin source workspaces */
    get: operations['listPluginDevelopments'];
    put?: never;
    /** Create a tenant-admin plugin source workspace */
    post: operations['createPluginDevelopment'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List immutable development candidates */
    get: operations['listPluginCandidates'];
    put?: never;
    /** Capture an immutable browser-built candidate and recompute its digest */
    post: operations['compilePluginCandidate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/invitations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List pending invitations
     * @description Summaries only: the one-time token is never readable again.
     */
    get: operations['listTenantInvitations'];
    put?: never;
    /**
     * Invite someone to the tenant
     * @description Valid for seven days. Re-inviting the same address invalidates the earlier link. Idempotency-Key is required; retries with the same canonical request replay the first 201 response including its plaintext token.
     */
    post: operations['inviteTenantMember'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/deletions/{resourceId}:retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retry the original cleanup and delivery intentions */
    post: operations['retryDeletion'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/content-types/versions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List immutable definition metadata */
    get: operations['listContentTypeVersions'];
    put?: never;
    /** Register a new immutable content type definition */
    post: operations['registerContentTypeVersion'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/content-types/deactivate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Disable future selection and publication without changing history */
    post: operations['deactivateContentType'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/content-types/activate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Enable a content type and select its default definition */
    post: operations['activateContentType'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/collections': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read the tenant Collection forest in author order */
    get: operations['viewCollections'];
    put?: never;
    /** Create a Collection */
    post: operations['createCollection'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/collections/{collectionId}:move': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Move a Collection */
    post: operations['moveCollection'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me:erase': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Irreversibly erase the authenticated user
     * @description Server-verifies the email and current password, then atomically ends every session, revokes machine credentials, removes memberships and grants, and leaves a stable tombstone.
     */
    post: operations['eraseCurrentUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me/password:change': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Change the authenticated user's password */
    post: operations['changePassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me/access-tokens': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List own personal management credentials without secrets; session only */
    get: operations['listManagementTokens'];
    put?: never;
    /** Issue a scoped personal management credential; session only */
    post: operations['issueManagementToken'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/invitations/{token}:accept': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Accept an invitation
     * @description The signed-in account's email must match the invited address, so a forwarded link is useless to anyone else.
     */
    post: operations['acceptInvitation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users/{id}:reactivate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Re-enable a deactivated user
     * @description Memberships and user grants become usable again; old sessions and API tokens stay revoked.
     */
    post: operations['reactivateAdminUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users/{id}:erase': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Irreversibly erase a deactivated global user */
    post: operations['eraseAdminUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users/{id}:deactivate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Globally freeze a user and revoke credentials */
    post: operations['deactivateAdminUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/tenants': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List tenants
     * @description Cursor paginated by provisioning time. The cursor is opaque; pass nextCursor verbatim.
     */
    get: operations['listTenants'];
    put?: never;
    /**
     * Provision a tenant and seat its first owner
     * @description Registers the tenant and seats ownerEmail as owner in one transaction. When that email has no verified account yet an owner invite is issued instead, and its one-time token is returned so the operator can pass the link on.
     */
    post: operations['provisionTenant'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/tenants/{id}:suspend': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Freeze a tenant
     * @description Idempotent. Freezes tenant-scoped management operations only: sessions stay alive, the same user keeps working in other tenants, and the platform plane is exempt.
     */
    post: operations['suspendTenant'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/tenants/{id}:resume': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Unfreeze a tenant
     * @description Idempotent.
     */
    post: operations['resumeTenant'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/teams/{teamId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['view'];
    put?: never;
    post?: never;
    delete: operations['delete'];
    options?: never;
    head?: never;
    patch: operations['rename'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/teams/{teamId}/members/{userId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['removeMember'];
    options?: never;
    head?: never;
    patch: operations['setRole'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one Space by stable id */
    get: operations['viewSpace'];
    put?: never;
    post?: never;
    /** Permanently delete an archived Space with name confirmation */
    delete: operations['deleteSpace'];
    options?: never;
    head?: never;
    /** Merge-patch Space metadata */
    patch: operations['updateSpace'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Remove a directory entry and its descendants */
    delete: operations['removeTocEntry'];
    options?: never;
    head?: never;
    /** Rename a directory entry */
    patch: operations['relabelTocEntry'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one Release with its report and live diff */
    get: operations['viewRelease'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Merge-patch Release label and notes */
    patch: operations['patchRelease'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Read one Page
     * @description ETag validates the complete response representation. X-Content-ETag is a legacy content-baseline bridge; read /content for atomic content and its ETag.
     */
    get: operations['viewPage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Rename a Page */
    patch: operations['renamePage'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/seo': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Merge-patch Page SEO (TDK); omitted keeps, null clears */
    patch: operations['setPageSeo'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one Site by stable id */
    get: operations['viewSite'];
    put?: never;
    post?: never;
    /** Delete an unmounted Site and unbind its domains */
    delete: operations['deleteSite'];
    options?: never;
    head?: never;
    /** Merge-patch Site settings */
    patch: operations['updateSite'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/members/{userId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Remove a member
     * @description Idempotent for non-members. Removing an owner also revokes its tenant-root admin.
     */
    delete: operations['removeTenantMember'];
    options?: never;
    head?: never;
    /**
     * Change a member's role
     * @description Promoting to owner grants tenant-root admin immediately; demoting revokes it.
     */
    patch: operations['setTenantMemberRole'];
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/collections/{collectionId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete an empty Collection */
    delete: operations['removeCollection'];
    options?: never;
    head?: never;
    /** Rename a Collection or set its icon */
    patch: operations['patchCollection'];
    trace?: never;
  };
  '/webhooks/{id}/deliveries': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inspect delivery state and attempts */
    get: operations['listWebhookDeliveries'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/stats/tenants/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Tenant logical usage and activity */
    get: operations['tenantUsage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/stats/spaces/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Space logical usage and activity */
    get: operations['spaceUsage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/stats/sites/{id}/traffic': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Page views, daily estimated visitors and missing paths */
    get: operations['siteTraffic'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/stats/sites/{id}/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Submitted searches, zero results and observable click rate */
    get: operations['siteSearchStats'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/readyz': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Readiness probe */
    get: operations['readiness'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/storage': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inspect platform physical source storage and database size */
    get: operations['storageUsage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/mail-jobs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List masked mail delivery metadata */
    get: operations['listMailJobs'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/jobs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inspect import work and recovery state */
    get: operations['listJobs'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/domains/{host}/certificate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inspect the actual TLS certificate of a bound domain */
    get: operations['domainCertificate'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ops/domains/allowed': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Caddy on-demand TLS ask */
    get: operations['allowDomain'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/healthz': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Liveness probe */
    get: operations['health'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/audit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Query tenant or platform audit facts */
    get: operations['listAudit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/audit/exports/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inspect export generation state */
    get: operations['viewAuditExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/audit/exports/{id}/content': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Download an export after checking current authorization */
    get: operations['downloadAuditExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/teams/{teamId}/members': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['members'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/tags': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List visible tags in a tenant with observer-relative pageCount */
    get: operations['listTags'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/tags/{label}/pages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List readable Pages that carry a tag */
    get: operations['listTaggedPages'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}:deletion-plan': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Validate current Space termination prerequisites and observe cascade impact without mutation */
    get: operations['planSpaceTermination'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/trash': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List trashed Pages in a Space */
    get: operations['listTrash'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Releases in a Space */
    get: operations['listReleases'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:diff': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Diff two Releases in a Space */
    get: operations['diffReleases'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List snapshot pages available for preview */
    get: operations['listReleasePreviewPages'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview/{slug}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Render one snapshot page from a not-yet-live Release */
    get: operations['previewRelease'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview/by-id/{pageId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Render one frozen snapshot page by Page ID */
    get: operations['previewReleaseByPageId'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List inherited and local Space grants */
    get: operations['listSpacePermissions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/principals/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Search active tenant Users for ACL editing */
    get: operations['searchPermissionUsers'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/principals/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Search tenant Teams for ACL editing */
    get: operations['searchPermissionTeams'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/pages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List every Page for ACL administration */
    get: operations['listPermissionPages'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Page Revisions newest first */
    get: operations['listPageRevisions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions:diff': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Compare two Page Revisions */
    get: operations['diffPageRevisions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions/{revision}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one Page Revision */
    get: operations['viewPageRevision'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read the Page restriction snapshot */
    get: operations['viewPagePermission'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions:effective': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Explain effective Page read access */
    get: operations['explainPageRead'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Short-lived signed download URL for one attachment */
    get: operations['viewPageAttachment'];
    put?: never;
    post?: never;
    /** Detach one attachment (reference only; idempotent) */
    delete: operations['detachPageFile'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}/content': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Download an attachment with current authorization */
    get: operations['downloadPageAttachment'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/mounts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List delivery mounts for one Space */
    get: operations['listSpaceMounts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/import-jobs/{jobId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one import job in this Space */
    get: operations['viewImportJob'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List export tasks in this space */
    get: operations['listBundleExports'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read export progress without exposing snapshot or object keys */
    get: operations['viewBundleExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}/download': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Reauthorize every current page before streaming the complete private ZIP */
    get: operations['downloadBundleExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/drift': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read live vs last-import drift in this Space */
    get: operations['viewDrift'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/spaces/{spaceId}/attachments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Browse readable working attachments with bounded scanning */
    get: operations['listSpaceAttachments'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}:deletion-plan': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Validate current Site termination prerequisites and observe cascade impact without mutation */
    get: operations['planSiteTermination'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List inherited and local Site grants */
    get: operations['listSitePermissions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions:effective': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Explain effective Site admin access */
    get: operations['explainSiteAdmin'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/principals/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Search active tenant Users for Site ACL */
    get: operations['searchSitePermissionUsers'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/principals/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Search tenant Teams for Site ACL */
    get: operations['searchSitePermissionTeams'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read a bound custom domain including the TXT challenge */
    get: operations['viewDomain'];
    put?: never;
    post?: never;
    /** Unbind a custom domain */
    delete: operations['unbindDomain'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/delivery': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Read desired and actual per-site online versions
     * @description desired identifies the current durable target; current identifies the Reader's actual snapshot. successful requires that exact target online without an access fence. Search status is independent. Reader links use verified hosts and deployment configuration. Poll within a bounded budget; a changed target supersedes an unobserved older target.
     */
    get: operations['siteDeliveryStatus'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/releases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Releases across every readable Space of a tenant */
    get: operations['listTenantReleases'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/plugin-verifications/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read browser evidence separately from server authority */
    get: operations['viewPluginVerification'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates/{candidateId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read an immutable candidate including captured source and artifact */
    get: operations['viewPluginCandidate'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/operations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List the current actor's operational capabilities */
    get: operations['operationsCapabilities'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/members': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List the tenant's members
     * @description Cursor paginated by join time. The cursor is opaque; pass nextCursor verbatim.
     */
    get: operations['listTenantMembers'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/domains': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List custom domains across every readable Site of a tenant */
    get: operations['listTenantDomains'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/deletions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Query deletion cleanup even after the resource is gone */
    get: operations['listDeletions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/content-types': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Discover tenant content types and selected definition versions */
    get: operations['listContentTypes'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/content-types/versions/{versionRef}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one complete immutable definition and schema closure */
    get: operations['viewContentTypeVersion'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/content-plugins': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Discover trusted build-registered content plugins */
    get: operations['contentPluginCatalog'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List the authenticated user's device sessions
     * @description Cursor paginated by last activity. The cursor is opaque; pass nextCursor verbatim.
     */
    get: operations['listSessions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/invitations/{token}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Read an invitation summary
     * @description Public on purpose: whoever holds the link was sent it, and an unregistered invitee must see which tenant and address the invite is for before signing up.
     */
    get: operations['previewInvitation'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/context': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inspect current credential limits without returning any secret */
    get: operations['authenticationContext'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Search global users by email or name prefix */
    get: operations['searchAdminUsers'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read global user lifecycle and membership details */
    get: operations['getAdminUser'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Report liveness and lag of the management, reader and worker processes
     * @description Heartbeats older than 60s are lagging, older than 180s are lost; the reader is probed over HTTP and reports unconfigured when no READER_HEALTH_URL is set.
     */
    get: operations['platformHealth'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/.well-known/jwks.json': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['keys'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/tokens/{tokenId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['revoke'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/teams/{teamId}/invitations/{inviteId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['revoke_1'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts/{spaceId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Unmount the Space identified by ID */
    delete: operations['unmountSpaceById'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/tenants/{tenantId}/invitations/{inviteId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Revoke a pending invitation
     * @description Idempotent. The invite link stops working immediately.
     */
    delete: operations['revokeTenantInvitation'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me/sessions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Revoke one of the authenticated user's sessions
     * @description Idempotent, and limited to the caller's own sessions. Revoking the current session logs this device out immediately.
     */
    delete: operations['endSession'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/me/access-tokens/{tokenId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Revoke own management credential; missing credentials are idempotent */
    delete: operations['revokeManagementToken'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description RFC 9457 error response */
    ApiProblem: {
      type: string;
      title: string;
      /** Format: int32 */
      status: number;
      code: components['schemas']['ProblemCode'];
      detail: string;
      traceId: string;
      /** @description Field-level reasons that let the caller correct rejected input */
      violations?: components['schemas']['Violation'][];
      /** @description Stable related resource ids for conflicts that require another resource to change */
      relatedIds?: string[];
      /** @description Minimal group references that require ownership transfer before user erasure */
      relatedGroups?: components['schemas']['RelatedGroup'][];
      /** @description Current Page baseline and content for a caller-resolvable edit conflict */
      conflict?: components['schemas']['Conflict'];
    };
    Conflict: {
      /** Format: int32 */
      currentRevision: number;
      currentEtag: string;
      theirs: string;
      currentContentType?: string | null;
      currentVersionRef?: string | null;
      currentInterpretation?: {
        [key: string]: unknown;
      } | null;
    };
    /** @enum {string} */
    ProblemCode:
      | 'space_not_archived'
      | 'deletion_confirmation_invalid'
      | 'resource_busy'
      | 'webhook_disabled'
      | 'webhook_delivery_not_replayable'
      | 'already_member'
      | 'attachment_not_found'
      | 'authentication_required'
      | 'collection_name_taken'
      | 'collection_not_empty'
      | 'collection_not_found'
      | 'cross_site_request_rejected'
      | 'cycle_detected'
      | 'depth_exceeded'
      | 'domain_is_primary'
      | 'domain_not_found'
      | 'domain_not_verified'
      | 'domain_taken'
      | 'dependency_timeout'
      | 'dependency_unavailable'
      | 'email_taken'
      | 'edit_conflict'
      | 'erase_confirmation_invalid'
      | 'file_too_large'
      | 'file_type_unsupported'
      | 'invalid_credentials'
      | 'invalid_cursor'
      | 'invalid_idempotency_key'
      | 'idempotency_key_reused'
      | 'idempotency_request_in_progress'
      | 'invalid_old_password'
      | 'invalid_precondition'
      | 'invalid_refresh'
      | 'invalid_token'
      | 'invalid_token_expiry'
      | 'invalid_token_role'
      | 'invalid_token_scope'
      | 'invalid_management_token_scope'
      | 'management_scope_required'
      | 'invite_email_mismatch'
      | 'invite_expired'
      | 'invite_already_accepted'
      | 'invite_invalid'
      | 'import_blocked'
      | 'import_in_progress'
      | 'import_job_not_found'
      | 'import_source_unreachable'
      | 'import_source_forbidden'
      | 'invalid_bundle'
      | 'export_not_ready'
      | 'export_expired'
      | 'export_not_found'
      | 'last_owner'
      | 'malformed_json'
      | 'method_not_allowed'
      | 'media_type_not_supported'
      | 'response_not_acceptable'
      | 'member_not_found'
      | 'member_role_invalid'
      | 'password_locked'
      | 'password_too_weak'
      | 'ownership_transfer_required'
      | 'not_proven'
      | 'page_not_found'
      | 'permission_denied'
      | 'permission_principal_inactive'
      | 'permission_principal_not_found'
      | 'permission_principal_type_unsupported'
      | 'permission_restriction_too_large'
      | 'permission_role_invalid'
      | 'permission_version_conflict'
      | 'platform_operator_required'
      | 'position_invalid'
      | 'profile_invalid'
      | 'precondition_required'
      | 'rate_limited'
      | 'release_not_archived'
      | 'release_not_discardable'
      | 'release_not_flagged'
      | 'release_not_found'
      | 'release_not_promotable'
      | 'reset_token_invalid'
      | 'revision_not_found'
      | 'resource_not_found'
      | 'role_escalation_forbidden'
      | 'space_archived'
      | 'space_icon_invalid'
      | 'space_name_invalid'
      | 'space_mode_restricted'
      | 'live_release_required'
      | 'space_not_found'
      | 'tenant_name_invalid'
      | 'tenant_membership_required'
      | 'tenant_not_found'
      | 'tenant_space_mismatch'
      | 'tenant_suspended'
      | 'team_name_invalid'
      | 'team_name_taken'
      | 'team_not_found'
      | 'site_has_domains'
      | 'site_name_invalid'
      | 'site_not_empty'
      | 'site_not_found'
      | 'slug_invalid'
      | 'slug_taken'
      | 'mount_not_found'
      | 'redirect_not_found'
      | 'redirect_not_manual'
      | 'redirect_target_not_found'
      | 'space_already_mounted'
      | 'home_not_mounted'
      | 'order_invalid'
      | 'branding_invalid'
      | 'team_last_owner'
      | 'token_not_found'
      | 'tag_not_found'
      | 'toc_entry_not_found'
      | 'too_many_attachments'
      | 'too_many_tags'
      | 'unexpected_error'
      | 'user_erased'
      | 'user_must_be_deactivated'
      | 'user_not_found'
      | 'validation_failed'
      | 'verify_token_invalid';
    RelatedGroup: {
      type: string;
      id: string;
      tenantId: string;
      name: string;
    };
    Violation: {
      field: string;
      code: string;
    };
    WebhookConfiguration: {
      url: string;
      scopeType: string;
      /** Format: uuid */
      scopeId?: string;
      events: string[];
      active?: boolean;
    };
    Subscription: {
      /** Format: uuid */
      id?: string;
      url?: string;
      scopeType?: string;
      /** Format: uuid */
      scopeId?: string;
      events?: string[];
      active?: boolean;
      /** Format: date-time */
      createdAt?: string;
    };
    RetentionRequest: {
      /** Format: int32 */
      keep: number;
    };
    SpaceDetail: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      tenantId: string;
      name: string;
      /** @enum {string|null} */
      icon: 'book' | 'code' | 'api' | 'guide' | 'reference' | null;
      description: string | null;
      /** @enum {string} */
      mode: 'authored' | 'synced';
      /** @enum {string} */
      status: 'active' | 'archived';
      /** Format: int64 */
      pageCount: number;
      /** Format: int64 */
      driftCount: number;
      /** Format: date-time */
      lastReleaseAt: string | null;
      /** Format: date-time */
      createdAt: string;
      /** Format: uuid */
      createdBy: string | null;
      /** Format: date-time */
      updatedAt: string;
      /** Format: uuid */
      updatedBy: string | null;
      /** Format: uuid */
      collectionId: string | null;
      allowedActions: (
        | 'delete'
        | 'create'
        | 'read'
        | 'update'
        | 'archive'
        | 'restore'
        | 'convert'
        | 'write_pages'
        | 'manage_permissions'
      )[];
      collectionPath: string[];
      mounts: components['schemas']['SpaceMount'][];
      /** Format: int32 */
      retention: number;
      autoRelease: boolean | null;
    };
    SpaceMount: {
      /** Format: uuid */
      siteId: string;
      slug: string;
    };
    GrantRequest: {
      role: string;
    };
    GrantView: {
      resource?: components['schemas']['ResourceView'];
      principal?: components['schemas']['PrincipalView'];
      /** @enum {string} */
      role?: 'admin' | 'maintainer' | 'author' | 'reader' | 'none';
      operations?: ('read' | 'write' | 'publish' | 'admin')[];
      editable?: boolean;
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PrincipalView: {
      key?: string;
      type?: string;
      /** Format: uuid */
      id?: string | null;
      name?: string;
      status?: string;
      email?: string | null;
      avatar?: string | null;
      /** Format: int64 */
      memberCount?: number | null;
    };
    ResourceView: {
      type?: string;
      /** Format: uuid */
      id?: string;
      source?: string;
    };
    Attachment: {
      /** Format: uuid */
      id?: string;
      filename?: string;
      mime?: string;
      /** Format: int64 */
      sizeBytes?: number;
      contentPath?: string;
    };
    PageDetail: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      format?: string;
      icon?: string | null;
      tags?: string[];
      driftFlag?: boolean;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string;
      /**
       * Format: date-time
       * @deprecated
       * @description Unknown page-level publication time; use Release.promotedAt and site delivery facts
       */
      publishedAt?: string | null;
      allowedActions?: string[];
      content?: string;
      /** Format: int32 */
      revision?: number;
      seo?: components['schemas']['Seo'];
      properties?: {
        [key: string]: string;
      };
      attachments?: components['schemas']['Attachment'][];
      /** Format: date-time */
      trashedAt?: string | null;
      /** Format: int64 */
      revisionCount?: number;
      /** Format: int64 */
      wordCount?: number;
      /** Format: int64 */
      readingTime?: number;
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    Seo: {
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      ogImage?: string | null;
      noIndex?: boolean;
    };
    SetPagePropertyRequest: {
      value: string;
    };
    RestrictionRequest: {
      principals: string[];
    };
    PagePermissionView: {
      /** Format: uuid */
      pageId?: string;
      restriction?: components['schemas']['RestrictionView'];
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    RestrictionView: {
      active?: boolean;
      principals?: components['schemas']['PrincipalView'][];
      /** Format: int64 */
      revision?: number;
    };
    /** @description icon 为 http(s) URL；null 清空 */
    SetPageIconRequest: {
      icon?: string | null;
    };
    EditPageRequest: {
      content: string;
      contentType?: string;
      versionRef?: string | null;
      interpretation?: {
        [key: string]: unknown;
      };
      /**
       * @description Explicit effect constraint; omitted only for legacy clients
       * @enum {string|null}
       */
      intent?: 'draft_only' | 'hotfix' | null;
    };
    SpaceOrderRequest: {
      spaceIds: string[];
    };
    SiteBranding: {
      logo: string | null;
      favicon: string | null;
      primaryColor: string | null;
    };
    SiteDetail: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      tenantId: string;
      name: string;
      rule: string;
      /** Format: uuid */
      home: string | null;
      /** @enum {string} */
      robotsPolicy: 'index' | 'noindex';
      titleTemplate: string | null;
      branding: components['schemas']['SiteBranding'];
      locale: string | null;
      analyticsId: string | null;
      mounts: components['schemas']['SiteMount'][];
      domains: components['schemas']['SiteDomain'][];
      /** Format: date-time */
      createdAt: string;
      /** Format: uuid */
      createdBy: string | null;
      /** Format: date-time */
      updatedAt: string;
      /** Format: uuid */
      updatedBy: string | null;
      allowedActions: (
        | 'create'
        | 'read'
        | 'update'
        | 'mount'
        | 'unmount'
        | 'remount'
        | 'reorder'
        | 'delete'
        | 'manage_permissions'
      )[];
    };
    SiteDomain: {
      host: string;
      verified: boolean;
      isPrimary: boolean;
    };
    SiteMount: {
      /** Format: uuid */
      spaceId: string;
      slug: string;
    };
    Fields: {
      fields: ('title' | 'headings' | 'body')[];
    };
    Configuration: {
      fields?: string[];
      /** Format: int64 */
      revision?: number;
    };
    OrderRequest: {
      slugs: string[];
    };
    MountRequest: {
      /** Format: uuid */
      spaceId: string;
    };
    Save: {
      /** Format: int32 */
      baseRevision?: number;
      name: string;
      contentType: string;
      source: components['schemas']['Source'];
    };
    Source: {
      files?: {
        [key: string]: string;
      };
      manifest?: string;
      configuration?: string;
      fixtures?: string;
      dependencyLock?: string;
      baselineRef?: string;
    };
    Development: {
      /** Format: uuid */
      id?: string;
      name?: string;
      contentType?: string;
      /** Format: int32 */
      revision?: number;
      source?: components['schemas']['Source'];
      sourceDigest?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    PlaceRequest: {
      /** Format: int32 */
      position?: number;
    };
    ReplaceProfileRequest: {
      name: string;
      locale: string | null;
      avatar: string | null;
    };
    Profile: {
      /** Format: uuid */
      id?: string;
      email?: string;
      name?: string;
      avatar?: string;
      locale?: string;
      verified?: boolean;
      status?: string;
      platformOperator?: boolean;
      tenants?: components['schemas']['TenantMembership'][];
    };
    TenantMembership: {
      /** Format: uuid */
      id?: string;
      name?: string;
      role?: string;
      status?: string;
    };
    SecretResult: {
      subscription?: components['schemas']['Subscription'];
      secret?: string;
    };
    TenantRequest: {
      /** Format: uuid */
      tenantId: string;
    };
    PurgeReport: {
      /** Format: int32 */
      scanned?: number;
      /** Format: int32 */
      purged?: number;
      /** Format: int32 */
      protectedCount?: number;
    };
    StorageRetry: {
      /** Format: int32 */
      retriedObjects?: number;
    };
    Target: {
      /** Format: uuid */
      tenantId: string;
      /** Format: uuid */
      siteId: string;
    };
    MailJob: {
      /** Format: uuid */
      id?: string;
      kind?: string;
      recipient?: string;
      /** Format: uuid */
      tenantId?: string;
      status?: string;
      /** Format: int32 */
      attempt?: number;
      /** Format: date-time */
      nextRunAt?: string;
      error?: string;
      /** Format: uuid */
      traceId?: string;
      outcome?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      completedAt?: string;
      canRetry?: boolean;
    };
    RetryRequest: {
      /** Format: uuid */
      tenantId: string;
      platform?: boolean;
    };
    TelemetryEvent: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      sourceId?: string;
      /** Format: date-time */
      time?: string;
      /** Format: uuid */
      tenantId?: string;
      /** Format: uuid */
      siteId?: string;
      /** Format: uuid */
      pageId?: string;
      type?: string;
      path?: string;
      query?: string;
      /** Format: uuid */
      searchId?: string;
      visitor?: string;
      referrer?: string;
      zero?: boolean;
      observable?: boolean;
      /** Format: int64 */
      dropped?: number;
    };
    Accepted: {
      /** Format: int32 */
      accepted?: number;
    };
    RegisterRequest: {
      /**
       * Format: email
       * @example alice@example.com
       */
      email: string;
      /** @example Alice */
      name: string;
      password: string;
    };
    RegisterResponse: {
      /** Format: uuid */
      userId: string;
    };
    TokenResponse: {
      accessToken?: string;
      tokenType?: string;
      /** Format: int64 */
      expiresIn?: number;
    };
    ResetRequest: {
      token: string;
      newPassword: string;
    };
    ForgotRequest: {
      /** Format: email */
      email: string;
    };
    LoginRequest: {
      /** Format: email */
      email: string;
      password: string;
    };
    VerifyEmailRequest: {
      /** Format: uuid */
      user: string;
      token: string;
    };
    ResendRequest: {
      /** Format: email */
      email: string;
    };
    AuditFilter: {
      /** Format: uuid */
      actor?: string;
      action?: string;
      /** Format: uuid */
      target?: string;
      outcome?: string;
      /** Format: date-time */
      from?: string;
      /** Format: date-time */
      to?: string;
      /** Format: int64 */
      cursor?: number;
    };
    ExportRequest: {
      /** Format: uuid */
      tenantId?: string;
      filter: components['schemas']['AuditFilter'];
    };
    ExportStatus: {
      /** Format: uuid */
      id?: string;
      status?: string;
      error?: string;
      /** Format: date-time */
      expiresAt?: string;
    };
    IssueTokenRequest: {
      name: string;
      /** Format: uuid */
      spaceId: string;
      role: string;
      scopes: ('read' | 'write' | 'publish')[];
      /** Format: date-time */
      expiry: string;
    };
    IssuedToken: {
      /** Format: uuid */
      id?: string;
      name?: string;
      /** Format: uuid */
      ownerId?: string;
      /** Format: uuid */
      tenantId?: string;
      /** Format: uuid */
      spaceId?: string;
      role?: string;
      scopes?: string[];
      /** Format: date-time */
      expiry?: string;
      status?: string;
      /** Format: date-time */
      createdAt?: string;
      secret?: string;
    };
    TeamNameRequest: {
      name: string;
    };
    TeamView: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      callerRole?: string;
      /** Format: int64 */
      memberCount?: number;
      /** Format: int64 */
      ownerCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    InviteRequest: {
      /** Format: email */
      email: string;
      /** @enum {string} */
      role: 'owner' | 'member';
    };
    TeamInvitationSummary: {
      /** Format: uuid */
      id?: string;
      email?: string;
      role?: string;
      /** Format: date-time */
      expiresAt?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    TeamIssuedInvitation: {
      invite?: components['schemas']['TeamInvitationSummary'];
      token?: string;
    };
    RenameRequest: {
      to: string;
    };
    TagRename: {
      from?: string;
      to?: string;
    };
    CreateSpaceRequest: {
      name: string;
      mode: string;
    };
    BundleExportRequest: {
      /** Format: uuid */
      releaseId: string;
    };
    BundleExportJob: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      releaseId?: string;
      status?: string;
      /** Format: int32 */
      attempts?: number;
      error?: string;
      traceId?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      expiresAt?: string;
      /** Format: int64 */
      bytes?: number;
    };
    ConvertSpaceRequest: {
      mode: string;
    };
    AddEntryRequest: {
      /** Format: uuid */
      parentId?: string;
      label: string;
      kind: string;
      /** Format: uuid */
      targetId?: string;
      url?: string;
      /** Format: int32 */
      position?: number;
    };
    TocEntry: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      parentId?: string;
      /** Format: int32 */
      position?: number;
      label?: string;
      kind?: string;
      /** Format: uuid */
      targetId?: string;
      url?: string;
      /** Format: int32 */
      depth?: number;
      children?: components['schemas']['TocEntry'][];
    };
    TocView: {
      entries?: components['schemas']['TocEntry'][];
      allowedActions?: string[];
    };
    MoveRequest: {
      /** Format: uuid */
      parentId?: string;
      /** Format: int32 */
      position: number;
    };
    ImportZipFilePart: {
      /** Format: binary */
      file?: Blob;
    };
    DiffSummary: {
      /** Format: int32 */
      added?: number;
      /** Format: int32 */
      changed?: number;
      /** Format: int32 */
      removed?: number;
    };
    ImportAccepted: {
      job?: components['schemas']['ImportJob'];
      release?: components['schemas']['ReleaseDetail'];
    };
    ImportJob: {
      /** Format: uuid */
      id?: string;
      /** @enum {string} */
      status?:
        'queued' | 'running' | 'retrying' | 'held' | 'failed' | 'completed';
      /** @enum {string} */
      phase?:
        | 'queued'
        | 'inspecting'
        | 'adapting'
        | 'storing'
        | 'loading'
        | 'validating'
        | 'comparing'
        | 'promoting'
        | 'mirroring'
        | 'completing'
        | 'running'
        | 'retrying'
        | 'held'
        | 'failed'
        | 'completed';
      progress?: components['schemas']['ImportJobProgress'];
      /** Format: int32 */
      attempt?: number;
      /** Format: date-time */
      nextRunAt?: string | null;
      traceId?: string;
      /** @enum {string|null} */
      outcome?:
        | 'promoted'
        | 'skipped'
        | 'held'
        | 'flagged'
        | 'invalid_bundle'
        | 'dependency_failed'
        | 'unexpected_error'
        | 'resource_unavailable'
        | 'resource_deleted'
        | null;
      /** Format: uuid */
      releaseId?: string | null;
      /** @description Public https address the zip was fetched from; null for uploads */
      sourceUrl?: string | null;
      /** @description Import format detected by sniffing (bundle-v1, hwcloud-docs, okf-v0.1, file-tree); null until the zip has been inspected or when no adapter matched */
      adapterId?: string | null;
      report?: components['schemas']['ImportJobReport'];
      terminal: boolean;
      successful: boolean;
      /**
       * Format: int32
       * @description Suggested read-only polling interval; null when terminal
       */
      nextPollAfterSeconds: number | null;
    };
    ImportJobIssue: {
      code?: string;
      path?: string | null;
      detail?: string | null;
    };
    ImportJobProgress: {
      /** Format: int32 */
      done?: number | null;
      /** Format: int32 */
      total?: number | null;
    };
    ImportJobReport: {
      errors?: components['schemas']['ImportJobIssue'][];
      info?: components['schemas']['ImportJobIssue'][];
    };
    IssueView: {
      code?: string;
      path?: string;
      /** Format: uuid */
      pageId?: string;
      detail?: string;
    };
    ReleaseDetail: {
      /** Format: uuid */
      id?: string;
      label?: string;
      /** @enum {string} */
      status?: 'draft' | 'flagged' | 'validated' | 'live' | 'archived';
      source?: components['schemas']['ReleaseSource'];
      /** Format: int32 */
      pageCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      promotedAt?: string;
      allowedActions?: string[];
      notes?: string;
      report?: components['schemas']['ReportView'];
      diffSummary?: components['schemas']['DiffSummary'];
      /** Format: int64 */
      size?: number;
    };
    ReleaseSource: {
      kind?: string;
      ref?: string;
      /** Format: uuid */
      actor?: string;
    };
    ReportView: {
      errors?: components['schemas']['IssueView'][];
      warnings?: components['schemas']['IssueView'][];
      info?: components['schemas']['IssueView'][];
    };
    /** @description Exactly one of uploadKey (presigned upload) or url (public https zip fetched by the server). */
    ImportFromUploadRequest: {
      uploadKey?: string | null;
      url?: string | null;
    };
    ImportUpload: {
      putUrl?: string;
      /** Format: date-time */
      expiresAt?: string;
      uploadKey?: string;
    };
    BuildReleaseResult: {
      /** @enum {string} */
      outcome?: 'promoted' | 'skipped' | 'held' | 'unchanged';
      release?: components['schemas']['ReleaseDetail'];
    };
    ApproveReleaseResult: {
      /** @enum {string} */
      outcome?:
        | 'promoted'
        | 'skipped'
        | 'held'
        | 'flagged'
        | 'invalid_bundle'
        | 'dependency_failed'
        | 'unexpected_error'
        | 'resource_unavailable'
        | 'resource_deleted';
      release?: components['schemas']['ReleaseDetail'];
    };
    CreatePageRequest: {
      format: string;
      title: string;
      slug: string;
      contentType?: string;
      versionRef?: string | null;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    PageIdsRequest: {
      ids: string[];
    };
    BatchPublishResult: {
      pages?: components['schemas']['PageSummary'][];
      /** @enum {string} */
      outcome?: 'promoted' | 'skipped' | 'held' | 'unchanged';
      release?: components['schemas']['ReleaseDetail'];
    };
    PageSummary: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      format?: string;
      icon?: string | null;
      tags?: string[];
      driftFlag?: boolean;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string;
      /** Format: date-time */
      publishedAt?: string | null;
      allowedActions?: (
        | 'create'
        | 'read'
        | 'rename'
        | 'edit'
        | 'revert'
        | 'reslug'
        | 'transfer'
        | 'publish'
        | 'unpublish'
      )[];
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    PreviewPageRequest: {
      format: string;
      content: string;
    };
    PagePreview: {
      html?: string;
    };
    BatchReadRequest: {
      ids: string[];
      /** @enum {string} */
      view: 'summary' | 'content';
    };
    BatchPageItem: {
      /** Format: uuid */
      id: string;
      /** @enum {string} */
      status: 'ok' | 'not_found';
      page?: components['schemas']['PageSummary'] | null;
      content?: components['schemas']['ContentSnapshot'] | null;
      etag?: string | null;
    };
    BatchPageResponse: {
      items?: components['schemas']['BatchPageItem'][];
    };
    ContentSnapshot: {
      /** Format: uuid */
      id: string;
      format: string;
      content: string;
      /** Format: int32 */
      revision: number;
      contentType: string;
      versionRef: string | null;
      interpretation: {
        [key: string]: unknown;
      };
    };
    PublishResult: {
      page?: components['schemas']['PageDetail'];
      /** @enum {string} */
      outcome?: 'promoted' | 'skipped' | 'held' | 'unchanged';
      release?: components['schemas']['ReleaseDetail'];
    };
    TransferPageRequest: {
      /** Format: uuid */
      toSpace: string;
      slug: string;
    };
    RevertPageRequest: {
      /** Format: int32 */
      n?: number;
    };
    ReslugPageRequest: {
      slug: string;
    };
    CreateSiteRequest: {
      name: string;
    };
    RemountRequest: {
      newSlug: string;
    };
    CreateRedirectRequest: {
      path: string;
      targetType: string;
      /** Format: uuid */
      targetId: string;
    };
    RedirectView: {
      path?: string;
      /** Format: uuid */
      targetId?: string;
      targetType?: string;
      origin?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: int64 */
      hitCount?: number;
      currentPath?: string;
      targetLabel?: string;
      reachable?: boolean;
    };
    BindRequest: {
      host: string;
    };
    DomainDetail: {
      host: string;
      verified: boolean;
      isPrimary: boolean;
      dnsToken: string;
      txtName: string;
      txtValue: string;
    };
    Check: {
      name?: string;
      passed?: boolean;
      message?: string;
    };
    Evidence: {
      passed?: boolean;
      checks?: components['schemas']['Check'][];
    };
    Verify: {
      /** Format: uuid */
      developmentId: string;
      /** Format: uuid */
      candidateId: string;
      fixtureDigest: string;
      environment: string;
      browserEvidence: components['schemas']['Evidence'];
    };
    Verification: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: uuid */
      candidateId?: string;
      sourceDigest?: string;
      bundleDigest?: string;
      fixtureDigest?: string;
      environment?: string;
      browserEvidence?: components['schemas']['Evidence'];
      serverValidation?: components['schemas']['Evidence'];
      productionEligible?: boolean;
      /** Format: date-time */
      createdAt?: string;
    };
    Create: {
      name: string;
      contentType: string;
      source: components['schemas']['Source'];
    };
    Compile: {
      /** Format: int32 */
      baseRevision?: number;
      sourceDigest: string;
      entryPoint: string;
      bundle: string;
      environment: string;
    };
    Candidate: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: int32 */
      sourceRevision?: number;
      sourceDigest?: string;
      bundleDigest?: string;
      entryPoint?: string;
      bundle?: string;
      environment?: string;
      source?: components['schemas']['Source'];
      /** Format: date-time */
      createdAt?: string;
    };
    TenantInvitationSummary: {
      /** Format: uuid */
      id?: string;
      email?: string;
      role?: string;
      /** Format: date-time */
      expiresAt?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    TenantIssuedInvitation: {
      invite?: components['schemas']['TenantInvitationSummary'];
      token?: string;
    };
    ContentTypeDefinition: {
      id?: string;
      version?: string;
      label?: string;
      format?: string;
      mediaType?: string;
      language?: string;
      renderHost?: string;
      defaultInterpretation?: {
        [key: string]: unknown;
      };
      validation?: components['schemas']['Validation'] | null;
      schemaResources?: {
        [key: string]: string;
      };
      editors?: components['schemas']['Contribution'][];
      renderers?: components['schemas']['Contribution'][];
    };
    Contribution: {
      pluginId?: string;
      pluginVersion?: string;
      contributionId?: string;
      config?: {
        [key: string]: unknown;
      };
    };
    Register: {
      contentType: string;
      /** Format: int32 */
      baseRevision?: number;
      definition: components['schemas']['ContentTypeDefinition'];
    };
    Validation: {
      encoding?: string;
      schemaRef?: string | null;
      instanceSchemaPointer?: string | null;
    };
    Version: {
      versionRef?: string;
      digest?: string;
      definition?: components['schemas']['ContentTypeDefinition'];
      /** Format: date-time */
      createdAt?: string | null;
    };
    Deactivate: {
      contentType: string;
      /** Format: int32 */
      baseRevision?: number;
    };
    State: {
      contentType?: string;
      enabled?: boolean;
      /** Format: int32 */
      revision?: number;
      activeVersionRef?: string;
      label?: string;
      format?: string;
      mediaType?: string;
      builtin?: boolean;
    };
    Activate: {
      contentType: string;
      /** Format: int32 */
      baseRevision?: number;
      versionRef: string;
    };
    CreateRequest: {
      /** Format: uuid */
      parentId?: string;
      name: string;
      icon?: string;
      /** Format: int32 */
      position?: number;
    };
    CollectionNode: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      parentId?: string;
      /** Format: int32 */
      position?: number;
      name?: string;
      icon?: string;
      /** Format: int32 */
      depth?: number;
      /** Format: int64 */
      spaceCount?: number;
      children?: components['schemas']['CollectionNode'][];
    };
    CollectionView: {
      collections?: components['schemas']['CollectionNode'][];
      allowedActions?: string[];
    };
    EraseRequest: {
      /** Format: email */
      confirmationEmail: string;
      currentPassword: string;
    };
    ChangeRequest: {
      oldPassword: string;
      newPassword: string;
    };
    IssueRequest: {
      name: string;
      scopes: (
        | 'content:read'
        | 'content:write'
        | 'content:publish'
        | 'members:read'
        | 'members:write'
        | 'permissions:read'
        | 'permissions:write'
        | 'hosting:read'
        | 'hosting:write'
        | 'audit:read'
        | 'operations:read'
        | 'operations:write'
        | 'account:read'
        | 'account:write'
        | 'platform:read'
        | 'platform:write'
        | 'platform:erase'
      )[];
      /** Format: uuid */
      tenantId?: string | null;
      /** Format: date-time */
      expiry: string;
    };
    IssuedManagementToken: {
      token?: components['schemas']['ManagementTokenView'];
      secret?: string;
    };
    ManagementTokenView: {
      /** Format: uuid */
      id?: string;
      name?: string;
      scopes?: (
        | 'content:read'
        | 'content:write'
        | 'content:publish'
        | 'members:read'
        | 'members:write'
        | 'permissions:read'
        | 'permissions:write'
        | 'hosting:read'
        | 'hosting:write'
        | 'audit:read'
        | 'operations:read'
        | 'operations:write'
        | 'account:read'
        | 'account:write'
        | 'platform:read'
        | 'platform:write'
        | 'platform:erase'
      )[];
      /** Format: uuid */
      tenantId?: string | null;
      /** Format: date-time */
      expiry?: string;
      /** @enum {string} */
      status?: 'active' | 'expired' | 'revoked';
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      lastUsedAt?: string | null;
      /** Format: date-time */
      revokedAt?: string | null;
    };
    InvitationAcceptance: {
      kind?: string;
      tenant?: components['schemas']['InviteGroup'];
      team?: components['schemas']['InviteGroup'];
      role?: string;
    };
    InviteGroup: {
      /** Format: uuid */
      id?: string;
      name?: string;
    };
    ConfirmRequest: {
      /** Format: email */
      confirmationEmail: string;
      currentPassword: string;
    };
    ProvisionTenantRequest: {
      name: string;
      /** Format: email */
      ownerEmail: string;
    };
    Provisioned: {
      tenant?: components['schemas']['TenantView'];
      ownerInviteToken?: string;
    };
    TenantView: {
      /** Format: uuid */
      id?: string;
      name?: string;
      status?: string;
      /** Format: int64 */
      ownerCount?: number;
      /** Format: date-time */
      createdAt?: string;
    };
    RoleRequest: {
      /** @enum {string} */
      role: 'owner' | 'member';
    };
    /** @description JSON Merge Patch: omitted keeps, null clears */
    UpdateSpaceRequest: {
      name?: string | null;
      /** @enum {string|null} */
      icon?: 'book' | 'code' | 'api' | 'guide' | 'reference' | null;
      description?: string | null;
      autoRelease?: boolean | null;
    };
    RelabelRequest: {
      label: string;
    };
    /** @description JSON Merge Patch: omitted keeps */
    PatchReleaseRequest: {
      label?: string | null;
      notes?: string | null;
    };
    RenamePageRequest: {
      title: string;
    };
    /** @description JSON Merge Patch: omitted keeps, null clears */
    PageSeoPatchRequest: {
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      ogImage?: string | null;
      noIndex?: boolean | null;
    };
    UpdateSiteBranding: {
      logo?: string | null;
      favicon?: string | null;
      primaryColor?: string | null;
    };
    /** @description JSON Merge Patch: omitted keeps, null clears */
    UpdateSiteRequest: {
      name?: string | null;
      /** @description Contains exactly one %s placeholder; null restores the default. */
      titleTemplate?: string | null;
      branding?: components['schemas']['UpdateSiteBranding'] | null;
      locale?: string | null;
      analyticsId?: string | null;
      /** @enum {string|null} */
      robotsPolicy?: 'index' | 'noindex' | null;
      /** Format: uuid */
      home?: string | null;
      rule?: string | null;
    };
    MemberRoleRequest: {
      /** @enum {string} */
      role: 'owner' | 'member';
    };
    PatchRequest: {
      name?: string | null;
      /** @enum {string|null} */
      icon?: 'book' | 'code' | 'api' | 'guide' | 'reference' | null;
    };
    UpdateProfileRequest: {
      name: string;
      locale?: string;
      avatar?: string;
    };
    SubscriptionPage: {
      items?: components['schemas']['Subscription'][];
      /** Format: uuid */
      nextCursor?: string;
      eventTypes?: string[];
    };
    Attempt: {
      /** Format: uuid */
      id?: string;
      /** Format: date-time */
      startedAt?: string;
      /** Format: int32 */
      responseCode?: number;
      error?: string;
      /** Format: int64 */
      durationMs?: number;
    };
    Delivery: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      eventId?: string;
      eventType?: string;
      status?: string;
      /** Format: int32 */
      attempts?: number;
      /** Format: date-time */
      nextRunAt?: string;
      /** Format: int32 */
      responseCode?: number;
      /** Format: date-time */
      createdAt?: string;
      history?: components['schemas']['Attempt'][];
    };
    DeliveryPage: {
      items?: components['schemas']['Delivery'][];
      /** Format: uuid */
      nextCursor?: string;
    };
    Usage: {
      /** Format: int64 */
      workingPages?: number;
      /** Format: int64 */
      trashedPages?: number;
      /** Format: int64 */
      publishedPages?: number;
      /** Format: int64 */
      workingTextBytes?: number;
      /** Format: int64 */
      trashedTextBytes?: number;
      /** Format: int64 */
      attachmentCount?: number;
      /** Format: int64 */
      attachmentBytes?: number;
      /** Format: int64 */
      releases?: number;
      /** Format: int64 */
      snapshotPages?: number;
      /** Format: int64 */
      snapshotTextBytes?: number;
      /** Format: int64 */
      promotions?: number;
      /** Format: int64 */
      activeAuthors?: number;
      imports?: {
        [key: string]: number;
      };
      /** Format: date-time */
      computedAt?: string;
    };
    Bucket: {
      /** Format: date-time */
      time?: string;
      /** Format: int64 */
      pv?: number;
      /** Format: int64 */
      uv?: number;
    };
    Health: {
      status?: string;
      /** Format: date-time */
      updatedAt?: string;
      lossDetected?: boolean;
      /** Format: int64 */
      staleSources?: number;
      /** Format: date-time */
      retainedFrom?: string;
    };
    Ranked: {
      label?: string;
      /** Format: int64 */
      count?: number;
    };
    Traffic: {
      /** Format: int64 */
      pv?: number;
      series?: components['schemas']['Bucket'][];
      pages?: components['schemas']['Ranked'][];
      notFound?: components['schemas']['Ranked'][];
      referrers?: components['schemas']['Ranked'][];
      health?: components['schemas']['Health'];
    };
    Search: {
      /** Format: int64 */
      searches?: number;
      /** Format: int64 */
      observable?: number;
      /** Format: int64 */
      clicked?: number;
      /** Format: double */
      clickRate?: number;
      popular?: components['schemas']['Ranked'][];
      zeroResults?: components['schemas']['Ranked'][];
      health?: components['schemas']['Health'];
    };
    ProbeResponse: {
      status?: string;
    };
    StorageUsage: {
      /** Format: int64 */
      sourceObjects?: number;
      /** Format: int64 */
      sourceBytes?: number;
      /** Format: date-time */
      measuredAt?: string;
      /** Format: int64 */
      databaseBytes?: number;
      /** Format: int64 */
      failedSourceObjects?: number;
    };
    MailJobPage: {
      items?: components['schemas']['MailJob'][];
      nextCursor?: string;
    };
    Job: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      /** Format: uuid */
      spaceId?: string;
      type?: string;
      status?: string;
      phase?: string;
      /** Format: int32 */
      done?: number;
      /** Format: int32 */
      total?: number;
      /** Format: int32 */
      attempt?: number;
      /** Format: date-time */
      nextRunAt?: string;
      outcome?: string;
      traceId?: string;
      allowedActions?: string[];
    };
    JobPage: {
      items?: components['schemas']['Job'][];
      /** Format: uuid */
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
    };
    Certificate: {
      host?: string;
      status?: string;
      issuer?: string;
      /** Format: date-time */
      notBefore?: string;
      /** Format: date-time */
      notAfter?: string;
      /** Format: date-time */
      checkedAt?: string;
      error?: string;
    };
    AuditItem: {
      /** Format: int64 */
      id?: number;
      /** Format: uuid */
      eventId?: string;
      /** Format: uuid */
      rootId?: string;
      /** Format: date-time */
      time?: string;
      kind?: string;
      actorType?: string;
      /** Format: uuid */
      actorId?: string;
      actorName?: string;
      action?: string;
      targetType?: string;
      /** Format: uuid */
      targetId?: string;
      outcome?: string;
      ip?: string;
      requestId?: string;
      /** Format: uuid */
      credentialId?: string;
    };
    AuditPage: {
      items?: components['schemas']['AuditItem'][];
      /** Format: int64 */
      nextCursor?: number;
      /** Format: int64 */
      total?: number;
    };
    TokenPage: {
      tokens?: components['schemas']['TokenView'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
    };
    TokenView: {
      /** Format: uuid */
      id?: string;
      name?: string;
      /** Format: uuid */
      ownerId?: string;
      /** Format: uuid */
      tenantId?: string;
      /** Format: uuid */
      spaceId?: string;
      role?: string;
      scopes?: string[];
      /** Format: date-time */
      expiry?: string;
      status?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    TeamPage: {
      items?: components['schemas']['TeamView'][];
      nextCursor?: string | null;
    };
    TeamMemberPage: {
      items?: components['schemas']['TeamMemberSummary'][];
      nextCursor?: string | null;
    };
    TeamMemberSummary: {
      /** Format: uuid */
      id?: string;
      name?: string;
      avatar?: string;
      email?: string;
      role?: string;
      /** Format: date-time */
      joinedAt?: string;
    };
    TeamInvitationPage: {
      items?: components['schemas']['TeamInvitationSummary'][];
      nextCursor?: string | null;
    };
    TagCount: {
      label?: string;
      /** Format: int64 */
      pageCount?: number;
    };
    TagPage: {
      items?: components['schemas']['TagCount'][];
      nextCursor?: string;
      allowedActions?: string[];
    };
    /** @description PageSummary plus spaceId for cross-space aggregation */
    TaggedPage: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      /** Format: uuid */
      spaceId?: string;
      status?: string;
      format?: string;
      icon?: string;
      tags?: string[];
      driftFlag?: boolean;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string;
      /** Format: date-time */
      publishedAt?: string;
      allowedActions?: string[];
    };
    TaggedPagePage: {
      items?: components['schemas']['TaggedPage'][];
      nextCursor?: string;
    };
    SpacePage: {
      items: components['schemas']['SpaceSummary'][];
      nextCursor: string | null;
      /** Format: int64 */
      total: number | null;
      allowedActions: (
        | 'delete'
        | 'create'
        | 'read'
        | 'update'
        | 'archive'
        | 'restore'
        | 'convert'
        | 'write_pages'
        | 'manage_permissions'
      )[];
    };
    SpaceSummary: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      tenantId: string;
      name: string;
      /** @enum {string|null} */
      icon: 'book' | 'code' | 'api' | 'guide' | 'reference' | null;
      /** @enum {string} */
      mode: 'authored' | 'synced';
      /** @enum {string} */
      status: 'active' | 'archived';
      /** Format: int64 */
      pageCount: number;
      /** Format: int64 */
      driftCount: number;
      /** Format: date-time */
      lastReleaseAt: string | null;
      /** Format: date-time */
      createdAt: string;
      /** Format: uuid */
      createdBy: string | null;
      /** Format: date-time */
      updatedAt: string;
      /** Format: uuid */
      updatedBy: string | null;
      /** Format: uuid */
      collectionId: string | null;
      allowedActions: (
        | 'delete'
        | 'create'
        | 'read'
        | 'update'
        | 'archive'
        | 'restore'
        | 'convert'
        | 'write_pages'
        | 'manage_permissions'
      )[];
    };
    TerminationPlan: {
      resourceType?: string;
      /** Format: uuid */
      resourceId?: string;
      validationLevel?: string;
      /** Format: date-time */
      observedAt?: string;
      counts?: {
        [key: string]: number;
      };
      effects?: string[];
      unknowns?: string[];
    };
    TrashItem: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      format?: string;
      /** Format: date-time */
      trashedAt?: string | null;
      allowedActions?: string[];
    };
    TrashPage: {
      items?: components['schemas']['TrashItem'][];
      nextCursor?: string | null;
      /** Format: int64 */
      total?: number | null;
      allowedActions?: string[];
    };
    ReleasePage: {
      items?: components['schemas']['ReleaseSummary'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
      allowedActions?: string[];
    };
    ReleaseSummary: {
      /** Format: uuid */
      id?: string;
      label?: string;
      /** @enum {string} */
      status?: 'draft' | 'flagged' | 'validated' | 'live' | 'archived';
      source?: components['schemas']['ReleaseSource'];
      /** Format: int32 */
      pageCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      promotedAt?: string;
      allowedActions?: string[];
    };
    ReleaseDelta: {
      added?: string[];
      changed?: string[];
      removed?: string[];
    };
    SnapshotPreviewPage: {
      /** Format: uuid */
      pageId?: string;
      slug?: string;
      title?: string;
    };
    SnapshotPreviewPages: {
      items?: components['schemas']['SnapshotPreviewPage'][];
    };
    ContentTypeSnapshot: {
      versionRef?: string;
      digest?: string;
      definition?: components['schemas']['ContentTypeDefinition'];
    };
    SnapshotPreview: {
      html?: string;
      title?: string;
      slug?: string;
      format?: string;
      content?: string;
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
      contentTypeDefinition?: components['schemas']['ContentTypeSnapshot'];
    };
    GrantPage: {
      items?: components['schemas']['GrantView'][];
      nextCursor?: string | null;
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PrincipalPage: {
      items?: components['schemas']['PrincipalView'][];
      nextCursor?: string | null;
    };
    PagePermissionSummary: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      restrictionActive?: boolean;
      /** Format: int32 */
      restrictionCount?: number;
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PermissionPage: {
      items?: components['schemas']['PagePermissionSummary'][];
      nextCursor?: string | null;
    };
    PagePage: {
      items?: components['schemas']['PageSummary'][];
      nextCursor?: string | null;
      /** Format: int64 */
      total?: number | null;
      allowedActions?: string[];
    };
    ActorView: {
      type?: string;
      /** Format: uuid */
      id?: string;
      displayName?: string;
      status?: string;
    };
    RevisionEntry: {
      /** Format: int32 */
      n?: number;
      actor?: components['schemas']['ActorView'];
      /** Format: date-time */
      createdAt?: string;
      note?: string | null;
      /** Format: int64 */
      sizeBytes?: number;
      /** Format: int64 */
      sizeDelta?: number;
    };
    RevisionPage: {
      items?: components['schemas']['RevisionEntry'][];
      nextCursor?: string;
    };
    DiffHunkResponse: {
      /** Format: int32 */
      oldStart?: number;
      /** Format: int32 */
      oldLines?: number;
      /** Format: int32 */
      newStart?: number;
      /** Format: int32 */
      newLines?: number;
      lines?: components['schemas']['DiffLineResponse'][];
    };
    DiffLineResponse: {
      type?: string;
      content?: string;
    };
    RevisionDiff: {
      /** Format: int32 */
      from?: number;
      /** Format: int32 */
      to?: number;
      hunks?: components['schemas']['DiffHunkResponse'][];
    };
    RevisionDetail: {
      /** Format: int32 */
      n?: number;
      actor?: components['schemas']['ActorView'];
      /** Format: date-time */
      createdAt?: string;
      note?: string | null;
      /** Format: int64 */
      sizeBytes?: number;
      /** Format: int64 */
      sizeDelta?: number;
      content?: string;
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    DecisionTraceView: {
      resource?: components['schemas']['ResourceView'];
      subjectGrants?: components['schemas']['EffectiveGrantView'][];
      restrictionActive?: boolean;
      /** Format: int64 */
      restrictionRevision?: number;
      restrictionMatches?: string[];
      restrictionSatisfied?: boolean;
      decisive?: boolean;
    };
    EffectiveGrantView: {
      resource?: components['schemas']['ResourceView'];
      principalKey?: string;
      /** @enum {string} */
      role?: 'admin' | 'maintainer' | 'author' | 'reader' | 'none';
    };
    EffectivePermissionView: {
      principal?: components['schemas']['PrincipalView'];
      allowed?: boolean;
      /** @enum {string} */
      reason?:
        | 'direct_grant'
        | 'team_grant'
        | 'explicit_none'
        | 'no_grant'
        | 'restriction_miss';
      effectiveOperations?: ('read' | 'write' | 'publish' | 'admin')[];
      matchedLayer?: components['schemas']['ResourceView'];
      matchedGrants?: components['schemas']['EffectiveGrantView'][];
      trace?: components['schemas']['DecisionTraceView'][];
    };
    /** @description 实时鉴权代理地址；expiresAt为空；不进 PageDetail */
    AttachmentLink: {
      url?: string;
      /** Format: date-time */
      expiresAt?: string | null;
      filename?: string;
      mime?: string;
      /** Format: int64 */
      sizeBytes?: number;
    };
    BundleExportPage: {
      items?: components['schemas']['BundleExportJob'][];
      nextCursor?: string;
    };
    DriftBoard: {
      /** Format: int32 */
      driftCount?: number;
      items?: components['schemas']['DriftItem'][];
    };
    DriftItem: {
      /** Format: uuid */
      pageId?: string;
      slug?: string;
      title?: string;
      externalId?: string;
    };
    AttachmentPageResponse: {
      items?: components['schemas']['SpaceAttachmentResponse'][];
      nextCursor?: string | null;
    };
    SpaceAttachmentResponse: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      pageId?: string;
      pageTitle?: string;
      filename?: string;
      mime?: string;
      /** Format: int64 */
      sizeBytes?: number;
      /** Format: date-time */
      createdAt?: string;
    };
    SitePage: {
      items: components['schemas']['SiteSummary'][];
      nextCursor: string | null;
      /** Format: int64 */
      total: number | null;
      allowedActions: (
        | 'create'
        | 'read'
        | 'update'
        | 'mount'
        | 'unmount'
        | 'remount'
        | 'reorder'
        | 'delete'
        | 'manage_permissions'
      )[];
    };
    SiteSummary: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      tenantId: string;
      name: string;
      rule: string;
      /** Format: uuid */
      home: string | null;
      /** @enum {string} */
      robotsPolicy: 'index' | 'noindex';
      domains: components['schemas']['SiteDomain'][];
      /** Format: date-time */
      createdAt: string;
      /** Format: uuid */
      createdBy: string | null;
      /** Format: date-time */
      updatedAt: string;
      /** Format: uuid */
      updatedBy: string | null;
      allowedActions: (
        | 'create'
        | 'read'
        | 'update'
        | 'mount'
        | 'unmount'
        | 'remount'
        | 'reorder'
        | 'delete'
        | 'manage_permissions'
      )[];
    };
    RedirectPageResponse: {
      items?: components['schemas']['RedirectResponse'][];
      nextCursor?: string;
    };
    RedirectResponse: {
      path?: string;
      /** Format: uuid */
      targetId?: string;
      targetType?: string;
      origin?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: int64 */
      hitCount?: number;
      currentPath?: string;
      targetLabel?: string;
      reachable?: boolean;
    };
    Current: {
      /** Format: int64 */
      epoch?: number;
      primaryHost?: string | null;
      readerHref?: string | null;
      spaces?: components['schemas']['OnlineSpace'][];
      /** @description The actual snapshot is present and has no pending site fence. Each Reader request still enforces current reader policy; this does not prove anonymous access. */
      readable?: boolean;
      searchStatus?: string | null;
    };
    Desired: {
      /** Format: int64 */
      epoch?: number;
      spaces?: components['schemas']['OnlineSpace'][];
    };
    OnlineSpace: {
      /** Format: uuid */
      spaceId?: string;
      slug?: string;
      /** Format: uuid */
      releaseId?: string | null;
      readerHref?: string | null;
    };
    Status: {
      enabled: boolean;
      /** @enum {string} */
      status:
        | 'disabled'
        | 'queued'
        | 'running'
        | 'retrying'
        | 'failed'
        | 'completed'
        | 'access_pending';
      /** Format: int64 */
      targetEpoch: number;
      /** Format: int64 */
      onlineEpoch?: number | null;
      primaryHost?: string | null;
      spaces?: components['schemas']['OnlineSpace'][];
      error?: string | null;
      canRetry?: boolean;
      searchStatus?: string | null;
      desired?: components['schemas']['Desired'] | null;
      current?: components['schemas']['Current'] | null;
      terminal: boolean;
      successful: boolean;
      /** Format: int32 */
      nextPollAfterSeconds?: number;
    };
    ReleaseSpaceChoice: {
      /** Format: uuid */
      id?: string;
      name?: string;
      mode?: string;
      status?: string;
    };
    TenantReleasePage: {
      items?: components['schemas']['TenantReleaseSummary'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
      spaces?: components['schemas']['ReleaseSpaceChoice'][];
    };
    TenantReleaseSummary: {
      /** Format: uuid */
      id?: string;
      label?: string;
      /** @enum {string} */
      status?: 'draft' | 'flagged' | 'validated' | 'live' | 'archived';
      source?: components['schemas']['ReleaseSource'];
      /** Format: int32 */
      pageCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      promotedAt?: string;
      allowedActions?: string[];
      /** Format: uuid */
      spaceId?: string;
      spaceName?: string;
      spaceMode?: string;
      spaceStatus?: string;
    };
    VerificationList: {
      items?: components['schemas']['VerificationSummary'][];
    };
    VerificationSummary: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: uuid */
      candidateId?: string;
      sourceDigest?: string;
      bundleDigest?: string;
      fixtureDigest?: string;
      environment?: string;
      browserPassed?: boolean;
      serverPassed?: boolean;
      productionEligible?: boolean;
      /** Format: date-time */
      createdAt?: string;
    };
    DevelopmentList: {
      items?: components['schemas']['DevelopmentSummary'][];
    };
    DevelopmentSummary: {
      /** Format: uuid */
      id?: string;
      name?: string;
      contentType?: string;
      /** Format: int32 */
      revision?: number;
      sourceDigest?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    CandidateList: {
      items?: components['schemas']['CandidateSummary'][];
    };
    CandidateSummary: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: int32 */
      sourceRevision?: number;
      sourceDigest?: string;
      bundleDigest?: string;
      entryPoint?: string;
      environment?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    Capabilities: {
      audit?: boolean;
      webhooks?: boolean;
      tenantStats?: boolean;
      spaces?: components['schemas']['Choice'][];
      sites?: components['schemas']['Choice'][];
    };
    Choice: {
      /** Format: uuid */
      id?: string;
      name?: string;
    };
    TenantMemberPage: {
      items?: components['schemas']['TenantMemberSummary'][];
      nextCursor?: string | null;
    };
    TenantMemberSummary: {
      /** Format: uuid */
      id?: string;
      name?: string;
      role?: string;
      /** Format: date-time */
      joinedAt?: string;
    };
    TenantInvitationPage: {
      items?: components['schemas']['TenantInvitationSummary'][];
      nextCursor?: string | null;
    };
    DomainSiteChoice: {
      /** Format: uuid */
      id: string;
      name: string;
      allowedActions: string[];
    };
    TenantDomainPage: {
      items: components['schemas']['TenantDomainSummary'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
      sites: components['schemas']['DomainSiteChoice'][];
    };
    TenantDomainSummary: {
      host: string;
      verified: boolean;
      isPrimary: boolean;
      /** Format: date-time */
      createdAt: string;
      /** Format: uuid */
      siteId: string;
      siteName: string;
      allowedActions: string[];
    };
    Deletion: {
      /** Format: uuid */
      id?: string;
      resourceType?: string;
      /** Format: uuid */
      resourceId?: string;
      status?: string;
      error?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    DeletionPage: {
      items?: components['schemas']['Deletion'][];
      /** Format: uuid */
      nextCursor?: string;
    };
    TypeList: {
      items?: components['schemas']['State'][];
      canManage?: boolean;
    };
    VersionList: {
      items?: components['schemas']['VersionSummary'][];
    };
    VersionSummary: {
      versionRef?: string;
      contentType?: string;
      version?: string;
      digest?: string;
      /** Format: date-time */
      createdAt?: string | null;
    };
    Catalog: {
      items?: components['schemas']['Descriptor'][];
      productionLoading?: string;
      canDevelop?: boolean;
    };
    Descriptor: {
      id?: string;
      name?: string;
      version?: string;
      contentTypes?: string[];
      formats?: string[];
      capabilities?: string[];
      trusted?: boolean;
    };
    Device: {
      name?: string;
      browser?: string;
      os?: string;
    };
    SessionView: {
      /** Format: uuid */
      id?: string;
      device?: components['schemas']['Device'];
      ipApproximate?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      lastSeenAt?: string;
      /** Format: date-time */
      expiresAt?: string;
      current?: boolean;
    };
    Sessions: {
      sessions?: components['schemas']['SessionView'][];
      nextCursor?: string;
    };
    ManagementTokenPage: {
      items?: components['schemas']['ManagementTokenView'][];
      nextCursor?: string | null;
    };
    InvitePreview: {
      kind?: string;
      tenant?: components['schemas']['InviteGroup'];
      team?: components['schemas']['InviteGroup'];
      email?: string;
      role?: string;
      /** Format: date-time */
      expiresAt?: string;
    };
    ManagementAuthenticationContext: {
      /** @enum {string} */
      credentialType?: 'session' | 'space_token' | 'management_token';
      /** Format: uuid */
      actorId?: string;
      /** Format: uuid */
      credentialId?: string | null;
      scopes?: string[];
      /** Format: uuid */
      tenantId?: string | null;
      /** Format: date-time */
      expiry?: string | null;
    };
    UserPage: {
      users?: components['schemas']['UserSummary'][];
      nextCursor?: string;
    };
    UserSummary: {
      /** Format: uuid */
      id?: string;
      email?: string;
      name?: string;
      status?: string;
      platformOperator?: boolean;
      /** Format: date-time */
      updatedAt?: string;
    };
    MembershipSummary: {
      type?: string;
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      role?: string;
      soleOwner?: boolean;
    };
    UserDetail: {
      /** Format: uuid */
      id?: string;
      email?: string;
      name?: string;
      avatar?: string;
      locale?: string;
      verified?: boolean;
      status?: string;
      platformOperator?: boolean;
      memberships?: components['schemas']['MembershipSummary'][];
    };
    Tenants: {
      tenants?: components['schemas']['TenantView'][];
      nextCursor?: string;
    };
    HealthInstance: {
      instance?: string;
      version?: string;
      /** Format: date-time */
      seenAt?: string;
      status?: string;
      details?: {
        [key: string]: unknown;
      };
    };
    HealthReport: {
      /** Format: date-time */
      checkedAt?: string;
      services?: components['schemas']['HealthService'][];
    };
    HealthService: {
      service?: string;
      status?: string;
      instances?: components['schemas']['HealthInstance'][];
      details?: {
        [key: string]: unknown;
      };
    };
    Confirmation: {
      confirmationName: string;
    };
    Removed: {
      /** Format: uuid */
      id?: string;
    };
    PartialContentSnapshot: {
      /** Format: uuid */
      id?: string;
      format?: string;
      content?: string;
      /** Format: int32 */
      revision?: number;
      contentType?: string;
      versionRef?: string | null;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    PartialConfiguration: {
      fields?: string[];
      /** Format: int64 */
      revision?: number;
    };
    PartialDevelopment: {
      /** Format: uuid */
      id?: string;
      name?: string;
      contentType?: string;
      /** Format: int32 */
      revision?: number;
      source?: components['schemas']['PartialSource'];
      sourceDigest?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    PartialSource: {
      files?: {
        [key: string]: string;
      };
      manifest?: string;
      configuration?: string;
      fixtures?: string;
      dependencyLock?: string;
      baselineRef?: string;
    };
    PartialSubscriptionPage: {
      items?: components['schemas']['PartialSubscription'][];
      /** Format: uuid */
      nextCursor?: string;
      eventTypes?: string[];
    };
    PartialSubscription: {
      /** Format: uuid */
      id?: string;
      url?: string;
      scopeType?: string;
      /** Format: uuid */
      scopeId?: string;
      events?: string[];
      active?: boolean;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialTeamPage: {
      items?: components['schemas']['PartialTeamView'][];
      nextCursor?: string | null;
    };
    PartialTeamView: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      callerRole?: string;
      /** Format: int64 */
      memberCount?: number;
      /** Format: int64 */
      ownerCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    PartialTeamInvitationPage: {
      items?: components['schemas']['PartialTeamInvitationSummary'][];
      nextCursor?: string | null;
    };
    PartialTeamInvitationSummary: {
      /** Format: uuid */
      id?: string;
      email?: string;
      role?: string;
      /** Format: date-time */
      expiresAt?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialSpacePage: {
      items?: components['schemas']['PartialSpaceSummary'][];
      nextCursor?: string | null;
      /** Format: int64 */
      total?: number | null;
      allowedActions?: (
        | 'delete'
        | 'create'
        | 'read'
        | 'update'
        | 'archive'
        | 'restore'
        | 'convert'
        | 'write_pages'
        | 'manage_permissions'
      )[];
    };
    PartialSpaceSummary: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      /** @enum {string|null} */
      icon?: 'book' | 'code' | 'api' | 'guide' | 'reference' | null;
      /** @enum {string} */
      mode?: 'authored' | 'synced';
      /** @enum {string} */
      status?: 'active' | 'archived';
      /** Format: int64 */
      pageCount?: number;
      /** Format: int64 */
      driftCount?: number;
      /** Format: date-time */
      lastReleaseAt?: string | null;
      /** Format: date-time */
      createdAt?: string;
      /** Format: uuid */
      createdBy?: string | null;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string | null;
      /** Format: uuid */
      collectionId?: string | null;
      allowedActions?: (
        | 'delete'
        | 'create'
        | 'read'
        | 'update'
        | 'archive'
        | 'restore'
        | 'convert'
        | 'write_pages'
        | 'manage_permissions'
      )[];
    };
    PartialTocView: {
      entries?: components['schemas']['PartialTocEntry'][];
      allowedActions?: string[];
    };
    PartialTocEntry: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      parentId?: string;
      /** Format: int32 */
      position?: number;
      label?: string;
      kind?: string;
      /** Format: uuid */
      targetId?: string;
      url?: string;
      /** Format: int32 */
      depth?: number;
      children?: components['schemas']['PartialTocEntry'][];
    };
    PartialPagePage: {
      items?: components['schemas']['PartialPageSummary'][];
      nextCursor?: string | null;
      /** Format: int64 */
      total?: number | null;
      allowedActions?: string[];
    };
    PartialPageSummary: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      format?: string;
      icon?: string | null;
      tags?: string[];
      driftFlag?: boolean;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string;
      /** Format: date-time */
      publishedAt?: string | null;
      allowedActions?: (
        | 'create'
        | 'read'
        | 'rename'
        | 'edit'
        | 'revert'
        | 'reslug'
        | 'transfer'
        | 'publish'
        | 'unpublish'
      )[];
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    PartialSitePage: {
      items?: components['schemas']['PartialSiteSummary'][];
      nextCursor?: string | null;
      /** Format: int64 */
      total?: number | null;
      allowedActions?: (
        | 'create'
        | 'read'
        | 'update'
        | 'mount'
        | 'unmount'
        | 'remount'
        | 'reorder'
        | 'delete'
        | 'manage_permissions'
      )[];
    };
    PartialSiteSummary: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      rule?: string;
      /** Format: uuid */
      home?: string | null;
      /** @enum {string} */
      robotsPolicy?: 'index' | 'noindex';
      domains?: components['schemas']['PartialSiteDomain'][];
      /** Format: date-time */
      createdAt?: string;
      /** Format: uuid */
      createdBy?: string | null;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string | null;
      allowedActions?: (
        | 'create'
        | 'read'
        | 'update'
        | 'mount'
        | 'unmount'
        | 'remount'
        | 'reorder'
        | 'delete'
        | 'manage_permissions'
      )[];
    };
    PartialSiteDomain: {
      host?: string;
      verified?: boolean;
      isPrimary?: boolean;
    };
    PartialRedirectPageResponse: {
      items?: components['schemas']['PartialRedirectResponse'][];
      nextCursor?: string;
    };
    PartialRedirectResponse: {
      path?: string;
      /** Format: uuid */
      targetId?: string;
      targetType?: string;
      origin?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: int64 */
      hitCount?: number;
      currentPath?: string;
      targetLabel?: string;
      reachable?: boolean;
    };
    PartialVerificationList: {
      items?: components['schemas']['PartialVerificationSummary'][];
    };
    PartialVerificationSummary: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: uuid */
      candidateId?: string;
      sourceDigest?: string;
      bundleDigest?: string;
      fixtureDigest?: string;
      environment?: string;
      browserPassed?: boolean;
      serverPassed?: boolean;
      productionEligible?: boolean;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialDevelopmentList: {
      items?: components['schemas']['PartialDevelopmentSummary'][];
    };
    PartialDevelopmentSummary: {
      /** Format: uuid */
      id?: string;
      name?: string;
      contentType?: string;
      /** Format: int32 */
      revision?: number;
      sourceDigest?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    PartialCandidateList: {
      items?: components['schemas']['PartialCandidateSummary'][];
    };
    PartialCandidateSummary: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: int32 */
      sourceRevision?: number;
      sourceDigest?: string;
      bundleDigest?: string;
      entryPoint?: string;
      environment?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialTenantInvitationPage: {
      items?: components['schemas']['PartialTenantInvitationSummary'][];
      nextCursor?: string | null;
    };
    PartialTenantInvitationSummary: {
      /** Format: uuid */
      id?: string;
      email?: string;
      role?: string;
      /** Format: date-time */
      expiresAt?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialVersionList: {
      items?: components['schemas']['PartialVersionSummary'][];
    };
    PartialVersionSummary: {
      versionRef?: string;
      contentType?: string;
      version?: string;
      digest?: string;
      /** Format: date-time */
      createdAt?: string | null;
    };
    PartialCollectionView: {
      collections?: components['schemas']['PartialCollectionNode'][];
      allowedActions?: string[];
    };
    PartialCollectionNode: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      parentId?: string;
      /** Format: int32 */
      position?: number;
      name?: string;
      icon?: string;
      /** Format: int32 */
      depth?: number;
      /** Format: int64 */
      spaceCount?: number;
      children?: components['schemas']['PartialCollectionNode'][];
    };
    PartialTenants: {
      tenants?: components['schemas']['PartialTenantView'][];
      nextCursor?: string;
    };
    PartialTenantView: {
      /** Format: uuid */
      id?: string;
      name?: string;
      status?: string;
      /** Format: int64 */
      ownerCount?: number;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialSpaceDetail: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      /** @enum {string|null} */
      icon?: 'book' | 'code' | 'api' | 'guide' | 'reference' | null;
      description?: string | null;
      /** @enum {string} */
      mode?: 'authored' | 'synced';
      /** @enum {string} */
      status?: 'active' | 'archived';
      /** Format: int64 */
      pageCount?: number;
      /** Format: int64 */
      driftCount?: number;
      /** Format: date-time */
      lastReleaseAt?: string | null;
      /** Format: date-time */
      createdAt?: string;
      /** Format: uuid */
      createdBy?: string | null;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string | null;
      /** Format: uuid */
      collectionId?: string | null;
      allowedActions?: (
        | 'delete'
        | 'create'
        | 'read'
        | 'update'
        | 'archive'
        | 'restore'
        | 'convert'
        | 'write_pages'
        | 'manage_permissions'
      )[];
      collectionPath?: string[];
      mounts?: components['schemas']['PartialSpaceMount'][];
      /** Format: int32 */
      retention?: number;
      autoRelease?: boolean | null;
    };
    PartialSpaceMount: {
      /** Format: uuid */
      siteId?: string;
      slug?: string;
    };
    PartialReleaseDetail: {
      /** Format: uuid */
      id?: string;
      label?: string;
      /** @enum {string} */
      status?: 'draft' | 'flagged' | 'validated' | 'live' | 'archived';
      source?: components['schemas']['PartialReleaseSource'];
      /** Format: int32 */
      pageCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      promotedAt?: string;
      allowedActions?: string[];
      notes?: string;
      report?: components['schemas']['PartialReportView'];
      diffSummary?: components['schemas']['PartialDiffSummary'];
      /** Format: int64 */
      size?: number;
    };
    PartialReleaseSource: {
      kind?: string;
      ref?: string;
      /** Format: uuid */
      actor?: string;
    };
    PartialReportView: {
      errors?: components['schemas']['PartialIssueView'][];
      warnings?: components['schemas']['PartialIssueView'][];
      info?: components['schemas']['PartialIssueView'][];
    };
    PartialIssueView: {
      code?: string;
      path?: string;
      /** Format: uuid */
      pageId?: string;
      detail?: string;
    };
    PartialDiffSummary: {
      /** Format: int32 */
      added?: number;
      /** Format: int32 */
      changed?: number;
      /** Format: int32 */
      removed?: number;
    };
    PartialPageDetail: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      format?: string;
      icon?: string | null;
      tags?: string[];
      driftFlag?: boolean;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string;
      /**
       * Format: date-time
       * @deprecated
       * @description Unknown page-level publication time; use Release.promotedAt and site delivery facts
       */
      publishedAt?: string | null;
      allowedActions?: string[];
      content?: string;
      /** Format: int32 */
      revision?: number;
      seo?: components['schemas']['PartialSeo'];
      properties?: {
        [key: string]: string;
      };
      attachments?: components['schemas']['PartialAttachment'][];
      /** Format: date-time */
      trashedAt?: string | null;
      /** Format: int64 */
      revisionCount?: number;
      /** Format: int64 */
      wordCount?: number;
      /** Format: int64 */
      readingTime?: number;
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    PartialSeo: {
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      ogImage?: string | null;
      noIndex?: boolean;
    };
    PartialAttachment: {
      /** Format: uuid */
      id?: string;
      filename?: string;
      mime?: string;
      /** Format: int64 */
      sizeBytes?: number;
      contentPath?: string;
    };
    PartialSiteDetail: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      rule?: string;
      /** Format: uuid */
      home?: string | null;
      /** @enum {string} */
      robotsPolicy?: 'index' | 'noindex';
      titleTemplate?: string | null;
      branding?: components['schemas']['PartialSiteBranding'];
      locale?: string | null;
      analyticsId?: string | null;
      mounts?: components['schemas']['PartialSiteMount'][];
      domains?: components['schemas']['PartialSiteDomain'][];
      /** Format: date-time */
      createdAt?: string;
      /** Format: uuid */
      createdBy?: string | null;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string | null;
      allowedActions?: (
        | 'create'
        | 'read'
        | 'update'
        | 'mount'
        | 'unmount'
        | 'remount'
        | 'reorder'
        | 'delete'
        | 'manage_permissions'
      )[];
    };
    PartialSiteBranding: {
      logo?: string | null;
      favicon?: string | null;
      primaryColor?: string | null;
    };
    PartialSiteMount: {
      /** Format: uuid */
      spaceId?: string;
      slug?: string;
    };
    PartialDeliveryPage: {
      items?: components['schemas']['PartialDelivery'][];
      /** Format: uuid */
      nextCursor?: string;
    };
    PartialDelivery: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      eventId?: string;
      eventType?: string;
      status?: string;
      /** Format: int32 */
      attempts?: number;
      /** Format: date-time */
      nextRunAt?: string;
      /** Format: int32 */
      responseCode?: number;
      /** Format: date-time */
      createdAt?: string;
      history?: components['schemas']['PartialAttempt'][];
    };
    PartialAttempt: {
      /** Format: uuid */
      id?: string;
      /** Format: date-time */
      startedAt?: string;
      /** Format: int32 */
      responseCode?: number;
      error?: string;
      /** Format: int64 */
      durationMs?: number;
    };
    PartialUsage: {
      /** Format: int64 */
      workingPages?: number;
      /** Format: int64 */
      trashedPages?: number;
      /** Format: int64 */
      publishedPages?: number;
      /** Format: int64 */
      workingTextBytes?: number;
      /** Format: int64 */
      trashedTextBytes?: number;
      /** Format: int64 */
      attachmentCount?: number;
      /** Format: int64 */
      attachmentBytes?: number;
      /** Format: int64 */
      releases?: number;
      /** Format: int64 */
      snapshotPages?: number;
      /** Format: int64 */
      snapshotTextBytes?: number;
      /** Format: int64 */
      promotions?: number;
      /** Format: int64 */
      activeAuthors?: number;
      imports?: {
        [key: string]: number;
      };
      /** Format: date-time */
      computedAt?: string;
    };
    PartialTraffic: {
      /** Format: int64 */
      pv?: number;
      series?: components['schemas']['PartialBucket'][];
      pages?: components['schemas']['PartialRanked'][];
      notFound?: components['schemas']['PartialRanked'][];
      referrers?: components['schemas']['PartialRanked'][];
      health?: components['schemas']['PartialHealth'];
    };
    PartialBucket: {
      /** Format: date-time */
      time?: string;
      /** Format: int64 */
      pv?: number;
      /** Format: int64 */
      uv?: number;
    };
    PartialRanked: {
      label?: string;
      /** Format: int64 */
      count?: number;
    };
    PartialHealth: {
      status?: string;
      /** Format: date-time */
      updatedAt?: string;
      lossDetected?: boolean;
      /** Format: int64 */
      staleSources?: number;
      /** Format: date-time */
      retainedFrom?: string;
    };
    PartialSearch: {
      /** Format: int64 */
      searches?: number;
      /** Format: int64 */
      observable?: number;
      /** Format: int64 */
      clicked?: number;
      /** Format: double */
      clickRate?: number;
      popular?: components['schemas']['PartialRanked'][];
      zeroResults?: components['schemas']['PartialRanked'][];
      health?: components['schemas']['PartialHealth'];
    };
    PartialProbeResponse: {
      status?: string;
    };
    PartialStorageUsage: {
      /** Format: int64 */
      sourceObjects?: number;
      /** Format: int64 */
      sourceBytes?: number;
      /** Format: date-time */
      measuredAt?: string;
      /** Format: int64 */
      databaseBytes?: number;
      /** Format: int64 */
      failedSourceObjects?: number;
    };
    PartialMailJobPage: {
      items?: components['schemas']['PartialMailJob'][];
      nextCursor?: string;
    };
    PartialMailJob: {
      /** Format: uuid */
      id?: string;
      kind?: string;
      recipient?: string;
      /** Format: uuid */
      tenantId?: string;
      status?: string;
      /** Format: int32 */
      attempt?: number;
      /** Format: date-time */
      nextRunAt?: string;
      error?: string;
      /** Format: uuid */
      traceId?: string;
      outcome?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      completedAt?: string;
      canRetry?: boolean;
    };
    PartialJobPage: {
      items?: components['schemas']['PartialJob'][];
      /** Format: uuid */
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
    };
    PartialJob: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      /** Format: uuid */
      spaceId?: string;
      type?: string;
      status?: string;
      phase?: string;
      /** Format: int32 */
      done?: number;
      /** Format: int32 */
      total?: number;
      /** Format: int32 */
      attempt?: number;
      /** Format: date-time */
      nextRunAt?: string;
      outcome?: string;
      traceId?: string;
      allowedActions?: string[];
    };
    PartialCertificate: {
      host?: string;
      status?: string;
      issuer?: string;
      /** Format: date-time */
      notBefore?: string;
      /** Format: date-time */
      notAfter?: string;
      /** Format: date-time */
      checkedAt?: string;
      error?: string;
    };
    PartialAuditPage: {
      items?: components['schemas']['PartialAuditItem'][];
      /** Format: int64 */
      nextCursor?: number;
      /** Format: int64 */
      total?: number;
    };
    PartialAuditItem: {
      /** Format: int64 */
      id?: number;
      /** Format: uuid */
      eventId?: string;
      /** Format: uuid */
      rootId?: string;
      /** Format: date-time */
      time?: string;
      kind?: string;
      actorType?: string;
      /** Format: uuid */
      actorId?: string;
      actorName?: string;
      action?: string;
      targetType?: string;
      /** Format: uuid */
      targetId?: string;
      outcome?: string;
      ip?: string;
      requestId?: string;
      /** Format: uuid */
      credentialId?: string;
    };
    PartialExportStatus: {
      /** Format: uuid */
      id?: string;
      status?: string;
      error?: string;
      /** Format: date-time */
      expiresAt?: string;
    };
    PartialTeamMemberPage: {
      items?: components['schemas']['PartialTeamMemberSummary'][];
      nextCursor?: string | null;
    };
    PartialTeamMemberSummary: {
      /** Format: uuid */
      id?: string;
      name?: string;
      avatar?: string;
      email?: string;
      role?: string;
      /** Format: date-time */
      joinedAt?: string;
    };
    PartialTagPage: {
      items?: components['schemas']['PartialTagCount'][];
      nextCursor?: string;
      allowedActions?: string[];
    };
    PartialTagCount: {
      label?: string;
      /** Format: int64 */
      pageCount?: number;
    };
    PartialTaggedPagePage: {
      items?: components['schemas']['PartialTaggedPage'][];
      nextCursor?: string;
    };
    /** @description PageSummary plus spaceId for cross-space aggregation */
    PartialTaggedPage: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      /** Format: uuid */
      spaceId?: string;
      status?: string;
      format?: string;
      icon?: string;
      tags?: string[];
      driftFlag?: boolean;
      /** Format: date-time */
      updatedAt?: string;
      /** Format: uuid */
      updatedBy?: string;
      /** Format: date-time */
      publishedAt?: string;
      allowedActions?: string[];
    };
    PartialTerminationPlan: {
      resourceType?: string;
      /** Format: uuid */
      resourceId?: string;
      validationLevel?: string;
      /** Format: date-time */
      observedAt?: string;
      counts?: {
        [key: string]: number;
      };
      effects?: string[];
      unknowns?: string[];
    };
    PartialTrashPage: {
      items?: components['schemas']['PartialTrashItem'][];
      nextCursor?: string | null;
      /** Format: int64 */
      total?: number | null;
      allowedActions?: string[];
    };
    PartialTrashItem: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      format?: string;
      /** Format: date-time */
      trashedAt?: string | null;
      allowedActions?: string[];
    };
    PartialReleasePage: {
      items?: components['schemas']['PartialReleaseSummary'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
      allowedActions?: string[];
    };
    PartialReleaseSummary: {
      /** Format: uuid */
      id?: string;
      label?: string;
      /** @enum {string} */
      status?: 'draft' | 'flagged' | 'validated' | 'live' | 'archived';
      source?: components['schemas']['PartialReleaseSource'];
      /** Format: int32 */
      pageCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      promotedAt?: string;
      allowedActions?: string[];
    };
    PartialReleaseDelta: {
      added?: string[];
      changed?: string[];
      removed?: string[];
    };
    PartialSnapshotPreviewPages: {
      items?: components['schemas']['PartialSnapshotPreviewPage'][];
    };
    PartialSnapshotPreviewPage: {
      /** Format: uuid */
      pageId?: string;
      slug?: string;
      title?: string;
    };
    PartialSnapshotPreview: {
      html?: string;
      title?: string;
      slug?: string;
      format?: string;
      content?: string;
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
      contentTypeDefinition?: components['schemas']['PartialContentTypeSnapshot'];
    };
    PartialContentTypeSnapshot: {
      versionRef?: string;
      digest?: string;
      definition?: components['schemas']['PartialContentTypeDefinition'];
    };
    PartialContentTypeDefinition: {
      id?: string;
      version?: string;
      label?: string;
      format?: string;
      mediaType?: string;
      language?: string;
      renderHost?: string;
      defaultInterpretation?: {
        [key: string]: unknown;
      };
      validation?: components['schemas']['Validation'] | null;
      schemaResources?: {
        [key: string]: string;
      };
      editors?: components['schemas']['PartialContribution'][];
      renderers?: components['schemas']['PartialContribution'][];
    };
    PartialContribution: {
      pluginId?: string;
      pluginVersion?: string;
      contributionId?: string;
      config?: {
        [key: string]: unknown;
      };
    };
    PartialGrantPage: {
      items?: components['schemas']['PartialGrantView'][];
      nextCursor?: string | null;
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PartialGrantView: {
      resource?: components['schemas']['PartialResourceView'];
      principal?: components['schemas']['PartialPrincipalView'];
      /** @enum {string} */
      role?: 'admin' | 'maintainer' | 'author' | 'reader' | 'none';
      operations?: ('read' | 'write' | 'publish' | 'admin')[];
      editable?: boolean;
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PartialResourceView: {
      type?: string;
      /** Format: uuid */
      id?: string;
      source?: string;
    };
    PartialPrincipalView: {
      key?: string;
      type?: string;
      /** Format: uuid */
      id?: string | null;
      name?: string;
      status?: string;
      email?: string | null;
      avatar?: string | null;
      /** Format: int64 */
      memberCount?: number | null;
    };
    PartialPrincipalPage: {
      items?: components['schemas']['PartialPrincipalView'][];
      nextCursor?: string | null;
    };
    PartialPermissionPage: {
      items?: components['schemas']['PartialPagePermissionSummary'][];
      nextCursor?: string | null;
    };
    PartialPagePermissionSummary: {
      /** Format: uuid */
      id?: string;
      title?: string;
      slug?: string;
      restrictionActive?: boolean;
      /** Format: int32 */
      restrictionCount?: number;
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PartialRevisionPage: {
      items?: components['schemas']['PartialRevisionEntry'][];
      nextCursor?: string;
    };
    PartialRevisionEntry: {
      /** Format: int32 */
      n?: number;
      actor?: components['schemas']['PartialActorView'];
      /** Format: date-time */
      createdAt?: string;
      note?: string | null;
      /** Format: int64 */
      sizeBytes?: number;
      /** Format: int64 */
      sizeDelta?: number;
    };
    PartialActorView: {
      type?: string;
      /** Format: uuid */
      id?: string;
      displayName?: string;
      status?: string;
    };
    PartialRevisionDiff: {
      /** Format: int32 */
      from?: number;
      /** Format: int32 */
      to?: number;
      hunks?: components['schemas']['PartialDiffHunkResponse'][];
    };
    PartialDiffHunkResponse: {
      /** Format: int32 */
      oldStart?: number;
      /** Format: int32 */
      oldLines?: number;
      /** Format: int32 */
      newStart?: number;
      /** Format: int32 */
      newLines?: number;
      lines?: components['schemas']['PartialDiffLineResponse'][];
    };
    PartialDiffLineResponse: {
      type?: string;
      content?: string;
    };
    PartialRevisionDetail: {
      /** Format: int32 */
      n?: number;
      actor?: components['schemas']['PartialActorView'];
      /** Format: date-time */
      createdAt?: string;
      note?: string | null;
      /** Format: int64 */
      sizeBytes?: number;
      /** Format: int64 */
      sizeDelta?: number;
      content?: string;
      contentType?: string;
      versionRef?: string;
      interpretation?: {
        [key: string]: unknown;
      };
    };
    PartialPagePermissionView: {
      /** Format: uuid */
      pageId?: string;
      restriction?: components['schemas']['PartialRestrictionView'];
      allowedActions?: (
        | 'grant'
        | 'override'
        | 'set_none'
        | 'change_role'
        | 'revoke'
        | 'explain'
        | 'restrict'
        | 'replace_restriction'
        | 'narrow_restriction'
        | 'unrestrict'
      )[];
    };
    PartialRestrictionView: {
      active?: boolean;
      principals?: components['schemas']['PartialPrincipalView'][];
      /** Format: int64 */
      revision?: number;
    };
    PartialEffectivePermissionView: {
      principal?: components['schemas']['PartialPrincipalView'];
      allowed?: boolean;
      /** @enum {string} */
      reason?:
        | 'direct_grant'
        | 'team_grant'
        | 'explicit_none'
        | 'no_grant'
        | 'restriction_miss';
      effectiveOperations?: ('read' | 'write' | 'publish' | 'admin')[];
      matchedLayer?: components['schemas']['PartialResourceView'];
      matchedGrants?: components['schemas']['PartialEffectiveGrantView'][];
      trace?: components['schemas']['PartialDecisionTraceView'][];
    };
    PartialEffectiveGrantView: {
      resource?: components['schemas']['PartialResourceView'];
      principalKey?: string;
      /** @enum {string} */
      role?: 'admin' | 'maintainer' | 'author' | 'reader' | 'none';
    };
    PartialDecisionTraceView: {
      resource?: components['schemas']['PartialResourceView'];
      subjectGrants?: components['schemas']['PartialEffectiveGrantView'][];
      restrictionActive?: boolean;
      /** Format: int64 */
      restrictionRevision?: number;
      restrictionMatches?: string[];
      restrictionSatisfied?: boolean;
      decisive?: boolean;
    };
    /** @description 实时鉴权代理地址；expiresAt为空；不进 PageDetail */
    PartialAttachmentLink: {
      url?: string;
      /** Format: date-time */
      expiresAt?: string | null;
      filename?: string;
      mime?: string;
      /** Format: int64 */
      sizeBytes?: number;
    };
    PartialImportJob: {
      /** Format: uuid */
      id?: string;
      /** @enum {string} */
      status?:
        'queued' | 'running' | 'retrying' | 'held' | 'failed' | 'completed';
      /** @enum {string} */
      phase?:
        | 'queued'
        | 'inspecting'
        | 'adapting'
        | 'storing'
        | 'loading'
        | 'validating'
        | 'comparing'
        | 'promoting'
        | 'mirroring'
        | 'completing'
        | 'running'
        | 'retrying'
        | 'held'
        | 'failed'
        | 'completed';
      progress?: components['schemas']['PartialImportJobProgress'];
      /** Format: int32 */
      attempt?: number;
      /** Format: date-time */
      nextRunAt?: string | null;
      traceId?: string;
      /** @enum {string|null} */
      outcome?:
        | 'promoted'
        | 'skipped'
        | 'held'
        | 'flagged'
        | 'invalid_bundle'
        | 'dependency_failed'
        | 'unexpected_error'
        | 'resource_unavailable'
        | 'resource_deleted'
        | null;
      /** Format: uuid */
      releaseId?: string | null;
      /** @description Public https address the zip was fetched from; null for uploads */
      sourceUrl?: string | null;
      /** @description Import format detected by sniffing (bundle-v1, hwcloud-docs, okf-v0.1, file-tree); null until the zip has been inspected or when no adapter matched */
      adapterId?: string | null;
      report?: components['schemas']['PartialImportJobReport'];
      terminal?: boolean;
      successful?: boolean;
      /**
       * Format: int32
       * @description Suggested read-only polling interval; null when terminal
       */
      nextPollAfterSeconds?: number | null;
    };
    PartialImportJobProgress: {
      /** Format: int32 */
      done?: number | null;
      /** Format: int32 */
      total?: number | null;
    };
    PartialImportJobReport: {
      errors?: components['schemas']['PartialImportJobIssue'][];
      info?: components['schemas']['PartialImportJobIssue'][];
    };
    PartialImportJobIssue: {
      code?: string;
      path?: string | null;
      detail?: string | null;
    };
    PartialBundleExportPage: {
      items?: components['schemas']['PartialBundleExportJob'][];
      nextCursor?: string;
    };
    PartialBundleExportJob: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      releaseId?: string;
      status?: string;
      /** Format: int32 */
      attempts?: number;
      error?: string;
      traceId?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      expiresAt?: string;
      /** Format: int64 */
      bytes?: number;
    };
    PartialDriftBoard: {
      /** Format: int32 */
      driftCount?: number;
      items?: components['schemas']['PartialDriftItem'][];
    };
    PartialDriftItem: {
      /** Format: uuid */
      pageId?: string;
      slug?: string;
      title?: string;
      externalId?: string;
    };
    PartialAttachmentPageResponse: {
      items?: components['schemas']['PartialSpaceAttachmentResponse'][];
      nextCursor?: string | null;
    };
    PartialSpaceAttachmentResponse: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      pageId?: string;
      pageTitle?: string;
      filename?: string;
      mime?: string;
      /** Format: int64 */
      sizeBytes?: number;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialDomainDetail: {
      host?: string;
      verified?: boolean;
      isPrimary?: boolean;
      dnsToken?: string;
      txtName?: string;
      txtValue?: string;
    };
    PartialStatus: {
      enabled?: boolean;
      /** @enum {string} */
      status?:
        | 'disabled'
        | 'queued'
        | 'running'
        | 'retrying'
        | 'failed'
        | 'completed'
        | 'access_pending';
      /** Format: int64 */
      targetEpoch?: number;
      /** Format: int64 */
      onlineEpoch?: number | null;
      primaryHost?: string | null;
      spaces?: components['schemas']['PartialOnlineSpace'][];
      error?: string | null;
      canRetry?: boolean;
      searchStatus?: string | null;
      desired?: components['schemas']['Desired'] | null;
      current?: components['schemas']['Current'] | null;
      terminal?: boolean;
      successful?: boolean;
      /** Format: int32 */
      nextPollAfterSeconds?: number;
    };
    PartialOnlineSpace: {
      /** Format: uuid */
      spaceId?: string;
      slug?: string;
      /** Format: uuid */
      releaseId?: string | null;
      readerHref?: string | null;
    };
    PartialTenantReleasePage: {
      items?: components['schemas']['PartialTenantReleaseSummary'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
      spaces?: components['schemas']['PartialReleaseSpaceChoice'][];
    };
    PartialTenantReleaseSummary: {
      /** Format: uuid */
      id?: string;
      label?: string;
      /** @enum {string} */
      status?: 'draft' | 'flagged' | 'validated' | 'live' | 'archived';
      source?: components['schemas']['PartialReleaseSource'];
      /** Format: int32 */
      pageCount?: number;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      promotedAt?: string;
      allowedActions?: string[];
      /** Format: uuid */
      spaceId?: string;
      spaceName?: string;
      spaceMode?: string;
      spaceStatus?: string;
    };
    PartialReleaseSpaceChoice: {
      /** Format: uuid */
      id?: string;
      name?: string;
      mode?: string;
      status?: string;
    };
    PartialVerification: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: uuid */
      candidateId?: string;
      sourceDigest?: string;
      bundleDigest?: string;
      fixtureDigest?: string;
      environment?: string;
      browserEvidence?: components['schemas']['PartialEvidence'];
      serverValidation?: components['schemas']['PartialEvidence'];
      productionEligible?: boolean;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialEvidence: {
      passed?: boolean;
      checks?: components['schemas']['PartialCheck'][];
    };
    PartialCheck: {
      name?: string;
      passed?: boolean;
      message?: string;
    };
    PartialCandidate: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      developmentId?: string;
      /** Format: int32 */
      sourceRevision?: number;
      sourceDigest?: string;
      bundleDigest?: string;
      entryPoint?: string;
      bundle?: string;
      environment?: string;
      source?: components['schemas']['PartialSource'];
      /** Format: date-time */
      createdAt?: string;
    };
    PartialCapabilities: {
      audit?: boolean;
      webhooks?: boolean;
      tenantStats?: boolean;
      spaces?: components['schemas']['PartialChoice'][];
      sites?: components['schemas']['PartialChoice'][];
    };
    PartialChoice: {
      /** Format: uuid */
      id?: string;
      name?: string;
    };
    PartialTenantMemberPage: {
      items?: components['schemas']['PartialTenantMemberSummary'][];
      nextCursor?: string | null;
    };
    PartialTenantMemberSummary: {
      /** Format: uuid */
      id?: string;
      name?: string;
      role?: string;
      /** Format: date-time */
      joinedAt?: string;
    };
    PartialTenantDomainPage: {
      items?: components['schemas']['PartialTenantDomainSummary'][];
      nextCursor?: string;
      /** Format: int64 */
      total?: number;
      sites?: components['schemas']['PartialDomainSiteChoice'][];
    };
    PartialTenantDomainSummary: {
      host?: string;
      verified?: boolean;
      isPrimary?: boolean;
      /** Format: date-time */
      createdAt?: string;
      /** Format: uuid */
      siteId?: string;
      siteName?: string;
      allowedActions?: string[];
    };
    PartialDomainSiteChoice: {
      /** Format: uuid */
      id?: string;
      name?: string;
      allowedActions?: string[];
    };
    PartialDeletionPage: {
      items?: components['schemas']['PartialDeletion'][];
      /** Format: uuid */
      nextCursor?: string;
    };
    PartialDeletion: {
      /** Format: uuid */
      id?: string;
      resourceType?: string;
      /** Format: uuid */
      resourceId?: string;
      status?: string;
      error?: string;
      /** Format: date-time */
      createdAt?: string;
    };
    PartialTypeList: {
      items?: components['schemas']['PartialState'][];
      canManage?: boolean;
    };
    PartialState: {
      contentType?: string;
      enabled?: boolean;
      /** Format: int32 */
      revision?: number;
      activeVersionRef?: string;
      label?: string;
      format?: string;
      mediaType?: string;
      builtin?: boolean;
    };
    PartialVersion: {
      versionRef?: string;
      digest?: string;
      definition?: components['schemas']['PartialContentTypeDefinition'];
      /** Format: date-time */
      createdAt?: string | null;
    };
    PartialCatalog: {
      items?: components['schemas']['PartialDescriptor'][];
      productionLoading?: string;
      canDevelop?: boolean;
    };
    PartialDescriptor: {
      id?: string;
      name?: string;
      version?: string;
      contentTypes?: string[];
      formats?: string[];
      capabilities?: string[];
      trusted?: boolean;
    };
    PartialInvitePreview: {
      kind?: string;
      tenant?: components['schemas']['PartialInviteGroup'];
      team?: components['schemas']['PartialInviteGroup'];
      email?: string;
      role?: string;
      /** Format: date-time */
      expiresAt?: string;
    };
    PartialInviteGroup: {
      /** Format: uuid */
      id?: string;
      name?: string;
    };
    PartialUserPage: {
      users?: components['schemas']['PartialUserSummary'][];
      nextCursor?: string;
    };
    PartialUserSummary: {
      /** Format: uuid */
      id?: string;
      email?: string;
      name?: string;
      status?: string;
      platformOperator?: boolean;
      /** Format: date-time */
      updatedAt?: string;
    };
    PartialUserDetail: {
      /** Format: uuid */
      id?: string;
      email?: string;
      name?: string;
      avatar?: string;
      locale?: string;
      verified?: boolean;
      status?: string;
      platformOperator?: boolean;
      memberships?: components['schemas']['PartialMembershipSummary'][];
    };
    PartialMembershipSummary: {
      type?: string;
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      tenantId?: string;
      name?: string;
      role?: string;
      soleOwner?: boolean;
    };
    PartialHealthReport: {
      /** Format: date-time */
      checkedAt?: string;
      services?: components['schemas']['PartialHealthService'][];
    };
    PartialHealthService: {
      service?: string;
      status?: string;
      instances?: components['schemas']['PartialHealthInstance'][];
      details?: {
        [key: string]: unknown;
      };
    };
    PartialHealthInstance: {
      instance?: string;
      version?: string;
      /** Format: date-time */
      seenAt?: string;
      status?: string;
      details?: {
        [key: string]: unknown;
      };
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  updateWebhook: {
    parameters: {
      query: {
        tenantId: string;
      };
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['WebhookConfiguration'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Subscription'];
        };
      };
    };
  };
  setRetention: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RetentionRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  putSpaceGrant: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        principalKey: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['GrantRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['GrantView'];
        };
      };
    };
  };
  deleteSpaceGrant: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        principalKey: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  tagPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        label: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  untagPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        label: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  setPageProperty: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        field: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SetPagePropertyRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  removePageProperty: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        field: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  putPageRestriction: {
    parameters: {
      query?: never;
      header: {
        'If-Match': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RestrictionRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['PagePermissionView'];
        };
      };
    };
  };
  deletePageRestriction: {
    parameters: {
      query?: never;
      header: {
        'If-Match': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['PagePermissionView'];
        };
      };
    };
  };
  setPageIcon: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SetPageIconRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  viewPageContent: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ContentSnapshot']
            | components['schemas']['PartialContentSnapshot'];
        };
      };
    };
  };
  editPage: {
    parameters: {
      query?: never;
      header: {
        /** @description Content ETag rev-N from GET /content. Legacy page-rev-N-SHA256 tags are accepted only as a deprecated content-baseline bridge. */
        'If-Match': string;
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['EditPageRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  reorderMountsBySpaceId: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SpaceOrderRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  searchConfiguration: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Configuration']
            | components['schemas']['PartialConfiguration'];
        };
      };
    };
  };
  configureSearch: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Fields'];
      };
    };
    responses: {
      /** @description Accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Configuration'];
        };
      };
    };
  };
  putSiteGrant: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
        principalKey: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['GrantRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['GrantView'];
        };
      };
    };
  };
  deleteSiteGrant: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
        principalKey: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  reorderMounts: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OrderRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  mountSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        slug: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MountRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  unmountSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  viewPluginDevelopment: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Development']
            | components['schemas']['PartialDevelopment'];
        };
      };
    };
  };
  savePluginDevelopment: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Save'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Development'];
        };
      };
    };
  };
  deletePluginDevelopment: {
    parameters: {
      query: {
        baseRevision: number;
      };
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Removed'];
        };
      };
    };
  };
  placeSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        collectionId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['PlaceRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  unplaceSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        collectionId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  getCurrentUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Current profile */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Profile'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  replaceCurrentUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReplaceProfileRequest'];
      };
    };
    responses: {
      /** @description Replaced profile */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Profile'];
        };
      };
      /** @description A required replacement field is missing */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Profile'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Blank name or non-HTTPS avatar (profile_invalid) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  updateCurrentUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateProfileRequest'];
      };
    };
    responses: {
      /** @description Updated profile */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Profile'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Blank name or non-HTTPS avatar (profile_invalid) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listWebhooks: {
    parameters: {
      query: {
        tenantId: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['SubscriptionPage']
            | components['schemas']['PartialSubscriptionPage'];
        };
      };
    };
  };
  createWebhook: {
    parameters: {
      query: {
        tenantId: string;
      };
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['WebhookConfiguration'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['SecretResult'];
        };
      };
    };
  };
  rotateWebhook: {
    parameters: {
      query: {
        tenantId: string;
      };
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['SecretResult'];
        };
      };
    };
  };
  redeliverWebhook: {
    parameters: {
      query: {
        tenantId: string;
      };
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
        deliveryId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  purgeTrash: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TenantRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['PurgeReport'];
        };
      };
    };
  };
  retryStorage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['StorageRetry'];
        };
      };
    };
  };
  reindexSearch: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Target'];
      };
    };
    responses: {
      /** @description Accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Configuration'];
        };
      };
    };
  };
  retryMailJob: {
    parameters: {
      query?: {
        tenantId?: string;
      };
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Original mail job state after retry request */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MailJob'];
        };
      };
    };
  };
  retryJob: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        jobId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RetryRequest'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  ingestAnalytics: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TelemetryEvent'][];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Accepted'];
        };
      };
    };
  };
  register: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RegisterRequest'];
      };
    };
    responses: {
      /** @description Account created; verification mail issued */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['RegisterResponse'];
        };
      };
      /** @description Email already registered (email_taken) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Password too weak (password_too_weak); registration is rolled back */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  refreshSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description New access token issued; refresh cookie rotated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['TokenResponse'];
        };
      };
      /** @description Missing, expired or replayed refresh (invalid_refresh); cookie cleared */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Origin not allowed (cross_site_request_rejected) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Too many attempts (rate_limited) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  resetPassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ResetRequest'];
      };
    };
    responses: {
      /** @description Password reset; all sessions ended */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Token invalid, expired or used (reset_token_invalid) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description New password too weak (password_too_weak) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  forgotPassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ForgotRequest'];
      };
    };
    responses: {
      /** @description Request accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Invalid email (validation_failed) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Too many requests (rate_limited) */
      429: {
        headers: {
          /** @description Seconds until another reset request may be attempted */
          'Retry-After'?: number;
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Session revoked and cookie cleared */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Origin not allowed (cross_site_request_rejected) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginRequest'];
      };
    };
    responses: {
      /** @description Access token issued; refresh cookie set */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['TokenResponse'];
        };
      };
      /** @description Uniform rejection (invalid_credentials) for unknown email, wrong password, locked, unverified, deactivated or erased accounts */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Origin not allowed (cross_site_request_rejected) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Too many attempts (rate_limited) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  verifyEmail: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['VerifyEmailRequest'];
      };
    };
    responses: {
      /** @description Email verified */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Token invalid, expired or already used (verify_token_invalid) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  resendVerification: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ResendRequest'];
      };
    };
    responses: {
      /** @description Request accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Rate limited (rate_limited) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  exportAudit: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ExportRequest'];
      };
    };
    responses: {
      /** @description Accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ExportStatus'];
        };
      };
    };
  };
  list: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['TokenPage'];
        };
      };
    };
  };
  issue: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['IssueTokenRequest'];
      };
    };
    responses: {
      /** @description Token issued; secret appears only in this response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IssuedToken'];
        };
      };
    };
  };
  list_1: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TeamPage']
            | components['schemas']['PartialTeamPage'];
        };
      };
    };
  };
  create: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TeamNameRequest'];
      };
    };
    responses: {
      /** @description Team created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TeamView'];
        };
      };
    };
  };
  invitations: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TeamInvitationPage']
            | components['schemas']['PartialTeamInvitationPage'];
        };
      };
    };
  };
  invite: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['InviteRequest'];
      };
    };
    responses: {
      /** @description Invitation created; one-time secret included */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TeamIssuedInvitation'];
        };
      };
    };
  };
  renameTag: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        label: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RenameRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TagRename'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listSpaces: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        status?: string;
        mode?: string;
        collectionId?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['SpacePage']
            | components['schemas']['PartialSpacePage'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  createSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSpaceRequest'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  restoreSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  requestBundleExport: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BundleExportRequest'];
      };
    };
    responses: {
      /** @description Accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BundleExportJob'];
        };
      };
    };
  };
  convertSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ConvertSpaceRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  archiveSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  viewToc: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TocView']
            | components['schemas']['PartialTocView'];
        };
      };
    };
  };
  addTocEntry: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AddEntryRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TocView'];
        };
      };
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TocView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  moveTocEntry: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        entryId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MoveRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TocView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  importRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/zip': Blob;
        'application/octet-stream': Blob;
        'multipart/form-data': components['schemas']['ImportZipFilePart'];
        'application/json': components['schemas']['ImportFromUploadRequest'];
      };
    };
    responses: {
      /** @description Accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ImportAccepted'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  startImportUpload: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ImportUpload'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  buildRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BuildReleaseResult'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  rollbackRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReleaseDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  promoteRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReleaseDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  discardRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReleaseDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  approveRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ApproveReleaseResult'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  listPages: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        status?: string;
        format?: string;
        tag?: string;
        q?: string;
        /** @description Select 1..100 distinct Page ids without pagination; cannot combine with limit, cursor or other filters */
        ids?: string[];
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PagePage']
            | components['schemas']['PartialPagePage'];
        };
      };
    };
  };
  createPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePageRequest'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
    };
  };
  unpublishPages: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PageIdsRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['BatchPublishResult'];
        };
      };
    };
  };
  publishPages: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PageIdsRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['BatchPublishResult'];
        };
      };
    };
  };
  previewPage: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PreviewPageRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['PagePreview'];
        };
      };
    };
  };
  batchGetPages: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BatchReadRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['BatchPageResponse'];
        };
      };
    };
  };
  unpublishPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PublishResult'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  trashPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  transferPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TransferPageRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  revertPage: {
    parameters: {
      query?: never;
      header: {
        /** @description Content ETag rev-N from GET /content. Legacy page-rev-N-SHA256 tags are accepted only as a deprecated content-baseline bridge. */
        'If-Match': string;
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RevertPageRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  restorePage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  reslugPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReslugPageRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  publishPage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PublishResult'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  attachPageFile: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'multipart/form-data': {
          /** Format: binary */
          file: Blob;
        };
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Service Unavailable */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  retryBundleExport: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        jobId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BundleExportJob'];
        };
      };
    };
  };
  listSites: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['SitePage']
            | components['schemas']['PartialSitePage'];
        };
      };
    };
  };
  createSite: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSiteRequest'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  remountSpaceById: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RemountRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listRedirects: {
    parameters: {
      query?: {
        origin?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['RedirectPageResponse']
            | components['schemas']['PartialRedirectPageResponse'];
        };
      };
    };
  };
  createRedirect: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRedirectRequest'];
      };
    };
    responses: {
      /** @description Current redirect rule */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RedirectView'];
        };
      };
    };
  };
  deleteRedirect: {
    parameters: {
      query: {
        path: string;
      };
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  remountSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        slug: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RemountRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  bindDomain: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BindRequest'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DomainDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  verifyDomain: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        host: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DomainDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  setPrimaryDomain: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        host: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DomainDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  retrySiteDelivery: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listPluginVerifications: {
    parameters: {
      query?: {
        developmentId?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['VerificationList']
            | components['schemas']['PartialVerificationList'];
        };
      };
    };
  };
  verifyPluginCandidate: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Verify'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Verification'];
        };
      };
    };
  };
  listPluginDevelopments: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['DevelopmentList']
            | components['schemas']['PartialDevelopmentList'];
        };
      };
    };
  };
  createPluginDevelopment: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Create'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Development'];
        };
      };
    };
  };
  listPluginCandidates: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['CandidateList']
            | components['schemas']['PartialCandidateList'];
        };
      };
    };
  };
  compilePluginCandidate: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Compile'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Candidate'];
        };
      };
    };
  };
  listTenantInvitations: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of pending invitations */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TenantInvitationPage']
            | components['schemas']['PartialTenantInvitationPage'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  inviteTenantMember: {
    parameters: {
      query?: never;
      header: {
        /** @description Stable key for this user action (1-255 characters) */
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['InviteRequest'];
      };
    };
    responses: {
      /** @description Invitation issued */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TenantIssuedInvitation'];
        };
      };
      /** @description Missing or invalid Idempotency-Key (invalid_idempotency_key) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Already a member (already_member), key reused for another request (idempotency_key_reused), or a request is still processing (idempotency_request_in_progress) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unknown role (member_role_invalid) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  retryDeletion: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        resourceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listContentTypeVersions: {
    parameters: {
      query: {
        contentType: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['VersionList']
            | components['schemas']['PartialVersionList'];
        };
      };
    };
  };
  registerContentTypeVersion: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Register'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Version'];
        };
      };
    };
  };
  deactivateContentType: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Deactivate'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['State'];
        };
      };
    };
  };
  activateContentType: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Activate'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['State'];
        };
      };
    };
  };
  viewCollections: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['CollectionView']
            | components['schemas']['PartialCollectionView'];
        };
      };
    };
  };
  createCollection: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRequest'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CollectionView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  moveCollection: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        collectionId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MoveRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CollectionView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  eraseCurrentUser: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['EraseRequest'];
      };
    };
    responses: {
      /** @description User erased; refresh cookie cleared */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Confirmation rejected (erase_confirmation_invalid) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Ownership must be transferred first (ownership_transfer_required) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  changePassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ChangeRequest'];
      };
    };
    responses: {
      /** @description Password changed; all sessions ended */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Old password invalid (invalid_old_password) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description New password too weak (password_too_weak) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Password locked (password_locked) */
      429: {
        headers: {
          /** @description Seconds until the current password may be attempted again */
          'Retry-After'?: number;
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listManagementTokens: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Own credential metadata without secrets */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ManagementTokenPage'];
        };
      };
      /** @description Credential invalid or expired */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Credential type, scope or current permission denied */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Required dependency unavailable */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  issueManagementToken: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['IssueRequest'];
      };
    };
    responses: {
      /** @description Secret returned only in this logical issuance response */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IssuedManagementToken'];
        };
      };
      /** @description Input or idempotency key invalid */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Credential invalid or expired */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Credential type, scope or current permission denied */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Idempotency key reused for another request */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Token scope or expiry rejected */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Required dependency unavailable */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  acceptInvitation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        token: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Joined the tenant */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['InvitationAcceptance'];
        };
      };
      /** @description Invalid, expired or already used (invite_invalid) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Invited address differs (invite_email_mismatch) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  reactivateAdminUser: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  eraseAdminUser: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ConfirmRequest'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  deactivateAdminUser: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ConfirmRequest'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listTenants: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of tenants */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Tenants']
            | components['schemas']['PartialTenants'];
        };
      };
      /** @description Malformed cursor (invalid_cursor) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  provisionTenant: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProvisionTenantRequest'];
      };
    };
    responses: {
      /** @description Tenant provisioned */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Provisioned'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Blank or over-long name (tenant_name_invalid) */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  suspendTenant: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unknown tenant (tenant_not_found) */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  resumeTenant: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unknown tenant (tenant_not_found) */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  view: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TeamView']
            | components['schemas']['PartialTeamView'];
        };
      };
    };
  };
  delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  rename: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TeamNameRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['TeamView'];
        };
      };
    };
  };
  removeMember: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  setRole: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RoleRequest'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  viewSpace: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['SpaceDetail']
            | components['schemas']['PartialSpaceDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  deleteSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Confirmation'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Deletion'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  updateSpace: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/merge-patch+json': components['schemas']['UpdateSpaceRequest'];
        'application/json': components['schemas']['UpdateSpaceRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpaceDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  removeTocEntry: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        entryId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TocView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  relabelTocEntry: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        entryId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RelabelRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TocView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  viewRelease: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ReleaseDetail']
            | components['schemas']['PartialReleaseDetail'];
        };
      };
    };
  };
  patchRelease: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/merge-patch+json': components['schemas']['PatchReleaseRequest'];
        'application/json': components['schemas']['PatchReleaseRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReleaseDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  viewPage: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PageDetail']
            | components['schemas']['PartialPageDetail'];
        };
      };
    };
  };
  renamePage: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/merge-patch+json': components['schemas']['RenamePageRequest'];
        'application/json': components['schemas']['RenamePageRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  setPageSeo: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/merge-patch+json': components['schemas']['PageSeoPatchRequest'];
        'application/json': components['schemas']['PageSeoPatchRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  viewSite: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['SiteDetail']
            | components['schemas']['PartialSiteDetail'];
        };
      };
    };
  };
  deleteSite: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Confirmation'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Deletion'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  updateSite: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/merge-patch+json': components['schemas']['UpdateSiteRequest'];
        'application/json': components['schemas']['UpdateSiteRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  removeTenantMember: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Would leave the tenant without an owner (last_owner) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  setTenantMemberRole: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MemberRoleRequest'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a member of this tenant (member_not_found) */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Would leave the tenant without an owner (last_owner) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  removeCollection: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        collectionId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CollectionView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  patchCollection: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        collectionId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/merge-patch+json': components['schemas']['PatchRequest'];
        'application/json': components['schemas']['PatchRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CollectionView'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listWebhookDeliveries: {
    parameters: {
      query: {
        tenantId: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['DeliveryPage']
            | components['schemas']['PartialDeliveryPage'];
        };
      };
    };
  };
  tenantUsage: {
    parameters: {
      query?: {
        from?: string;
        to?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Usage']
            | components['schemas']['PartialUsage'];
        };
      };
    };
  };
  spaceUsage: {
    parameters: {
      query: {
        tenantId: string;
        from?: string;
        to?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Usage']
            | components['schemas']['PartialUsage'];
        };
      };
    };
  };
  siteTraffic: {
    parameters: {
      query: {
        tenantId: string;
        from?: string;
        to?: string;
        granularity?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Traffic']
            | components['schemas']['PartialTraffic'];
        };
      };
    };
  };
  siteSearchStats: {
    parameters: {
      query: {
        tenantId: string;
        from?: string;
        to?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Search']
            | components['schemas']['PartialSearch'];
        };
      };
    };
  };
  readiness: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ProbeResponse']
            | components['schemas']['PartialProbeResponse'];
        };
      };
    };
  };
  storageUsage: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['StorageUsage']
            | components['schemas']['PartialStorageUsage'];
        };
      };
    };
  };
  listMailJobs: {
    parameters: {
      query?: {
        tenantId?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['MailJobPage']
            | components['schemas']['PartialMailJobPage'];
        };
      };
    };
  };
  listJobs: {
    parameters: {
      query?: {
        tenantId?: string;
        spaceId?: string;
        type?: string;
        status?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['JobPage']
            | components['schemas']['PartialJobPage'];
        };
      };
    };
  };
  domainCertificate: {
    parameters: {
      query: {
        tenantId: string;
        siteId: string;
        platform?: boolean;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        host: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Certificate']
            | components['schemas']['PartialCertificate'];
        };
      };
    };
  };
  allowDomain: {
    parameters: {
      query?: {
        domain?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  health: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ProbeResponse']
            | components['schemas']['PartialProbeResponse'];
        };
      };
    };
  };
  listAudit: {
    parameters: {
      query?: {
        tenantId?: string;
        actor?: string;
        action?: string;
        target?: string;
        outcome?: string;
        from?: string;
        to?: string;
        cursor?: number;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['AuditPage']
            | components['schemas']['PartialAuditPage'];
        };
      };
    };
  };
  viewAuditExport: {
    parameters: {
      query?: {
        tenantId?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ExportStatus']
            | components['schemas']['PartialExportStatus'];
        };
      };
    };
  };
  downloadAuditExport: {
    parameters: {
      query?: {
        tenantId?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'text/csv': Blob;
        };
      };
    };
  };
  members: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TeamMemberPage']
            | components['schemas']['PartialTeamMemberPage'];
        };
      };
    };
  };
  listTags: {
    parameters: {
      query?: {
        q?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TagPage']
            | components['schemas']['PartialTagPage'];
        };
      };
    };
  };
  listTaggedPages: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        label: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TaggedPagePage']
            | components['schemas']['PartialTaggedPagePage'];
        };
      };
    };
  };
  planSpaceTermination: {
    parameters: {
      query: {
        confirmationName: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TerminationPlan']
            | components['schemas']['PartialTerminationPlan'];
        };
      };
    };
  };
  listTrash: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TrashPage']
            | components['schemas']['PartialTrashPage'];
        };
      };
    };
  };
  listReleases: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ReleasePage']
            | components['schemas']['PartialReleasePage'];
        };
      };
    };
  };
  diffReleases: {
    parameters: {
      query: {
        from: string;
        to: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['ReleaseDelta']
            | components['schemas']['PartialReleaseDelta'];
        };
      };
    };
  };
  listReleasePreviewPages: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['SnapshotPreviewPages']
            | components['schemas']['PartialSnapshotPreviewPages'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  previewRelease: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['SnapshotPreview']
            | components['schemas']['PartialSnapshotPreview'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  previewReleaseByPageId: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        releaseId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['SnapshotPreview']
            | components['schemas']['PartialSnapshotPreview'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  listSpacePermissions: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['GrantPage']
            | components['schemas']['PartialGrantPage'];
        };
      };
    };
  };
  searchPermissionUsers: {
    parameters: {
      query: {
        q: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PrincipalPage']
            | components['schemas']['PartialPrincipalPage'];
        };
      };
    };
  };
  searchPermissionTeams: {
    parameters: {
      query: {
        q: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PrincipalPage']
            | components['schemas']['PartialPrincipalPage'];
        };
      };
    };
  };
  listPermissionPages: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PermissionPage']
            | components['schemas']['PartialPermissionPage'];
        };
      };
    };
  };
  listPageRevisions: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['RevisionPage']
            | components['schemas']['PartialRevisionPage'];
        };
      };
    };
  };
  diffPageRevisions: {
    parameters: {
      query: {
        from: number;
        to: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['RevisionDiff']
            | components['schemas']['PartialRevisionDiff'];
        };
      };
    };
  };
  viewPageRevision: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        revision: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['RevisionDetail']
            | components['schemas']['PartialRevisionDetail'];
        };
      };
    };
  };
  viewPagePermission: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PagePermissionView']
            | components['schemas']['PartialPagePermissionView'];
        };
      };
    };
  };
  explainPageRead: {
    parameters: {
      query: {
        principal: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['EffectivePermissionView']
            | components['schemas']['PartialEffectivePermissionView'];
        };
      };
    };
  };
  viewPageAttachment: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        ref: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['AttachmentLink']
            | components['schemas']['PartialAttachmentLink'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Service Unavailable */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  detachPageFile: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        ref: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageDetail'];
        };
      };
      /** @description Bad Request */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Precondition Required */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  downloadPageAttachment: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        pageId: string;
        ref: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/octet-stream': Blob;
        };
      };
    };
  };
  listSpaceMounts: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['SpaceMount'][]
            | components['schemas']['PartialSpaceMount'][];
        };
      };
    };
  };
  viewImportJob: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        jobId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['ImportJob']
            | components['schemas']['PartialImportJob'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  listBundleExports: {
    parameters: {
      query?: {
        releaseId?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['BundleExportPage']
            | components['schemas']['PartialBundleExportPage'];
        };
      };
    };
  };
  viewBundleExport: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        jobId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['BundleExportJob']
            | components['schemas']['PartialBundleExportJob'];
        };
      };
    };
  };
  downloadBundleExport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
        jobId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/zip': Blob;
        };
      };
    };
  };
  viewDrift: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['DriftBoard']
            | components['schemas']['PartialDriftBoard'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': unknown;
        };
      };
    };
  };
  listSpaceAttachments: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        q?: string;
        type?: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['AttachmentPageResponse']
            | components['schemas']['PartialAttachmentPageResponse'];
        };
      };
    };
  };
  planSiteTermination: {
    parameters: {
      query: {
        confirmationName: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TerminationPlan']
            | components['schemas']['PartialTerminationPlan'];
        };
      };
    };
  };
  listSitePermissions: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['GrantPage']
            | components['schemas']['PartialGrantPage'];
        };
      };
    };
  };
  explainSiteAdmin: {
    parameters: {
      query: {
        principal: string;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['EffectivePermissionView']
            | components['schemas']['PartialEffectivePermissionView'];
        };
      };
    };
  };
  searchSitePermissionUsers: {
    parameters: {
      query: {
        q: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PrincipalPage']
            | components['schemas']['PartialPrincipalPage'];
        };
      };
    };
  };
  searchSitePermissionTeams: {
    parameters: {
      query: {
        q: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['PrincipalPage']
            | components['schemas']['PartialPrincipalPage'];
        };
      };
    };
  };
  viewDomain: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
        host: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['DomainDetail']
            | components['schemas']['PartialDomainDetail'];
        };
      };
    };
  };
  unbindDomain: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        host: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  siteDeliveryStatus: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        siteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Status']
            | components['schemas']['PartialStatus'];
        };
      };
    };
  };
  listTenantReleases: {
    parameters: {
      query?: {
        spaceId?: string;
        mode?: string;
        status?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of releases with their owning spaces */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TenantReleasePage']
            | components['schemas']['PartialTenantReleasePage'];
        };
      };
      /** @description Malformed cursor (invalid_cursor) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  viewPluginVerification: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Verification']
            | components['schemas']['PartialVerification'];
        };
      };
    };
  };
  viewPluginCandidate: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        id: string;
        candidateId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Candidate']
            | components['schemas']['PartialCandidate'];
        };
      };
    };
  };
  operationsCapabilities: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Capabilities']
            | components['schemas']['PartialCapabilities'];
        };
      };
    };
  };
  listTenantMembers: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of members */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TenantMemberPage']
            | components['schemas']['PartialTenantMemberPage'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listTenantDomains: {
    parameters: {
      query?: {
        siteId?: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of domains with their owning sites */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TenantDomainPage']
            | components['schemas']['PartialTenantDomainPage'];
        };
      };
      /** @description Malformed cursor (invalid_cursor) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  listDeletions: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['DeletionPage']
            | components['schemas']['PartialDeletionPage'];
        };
      };
    };
  };
  listContentTypes: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['TypeList']
            | components['schemas']['PartialTypeList'];
        };
      };
    };
  };
  viewContentTypeVersion: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
        versionRef: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Version']
            | components['schemas']['PartialVersion'];
        };
      };
    };
  };
  contentPluginCatalog: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        tenantId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['Catalog']
            | components['schemas']['PartialCatalog'];
        };
      };
    };
  };
  listSessions: {
    parameters: {
      query?: {
        cursor?: string;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of device sessions */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['Sessions'];
        };
      };
      /** @description Malformed cursor (invalid_cursor) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  previewInvitation: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        token: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Invitation summary */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['InvitePreview']
            | components['schemas']['PartialInvitePreview'];
        };
      };
      /** @description Invalid, expired or already used (invite_invalid) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description IP or invitation fingerprint rate limit (rate_limited) */
      429: {
        headers: {
          'Retry-After'?: number;
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  authenticationContext: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authenticated actor and credential limits */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ManagementAuthenticationContext'];
        };
      };
      /** @description Credential invalid or expired */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Credential type, scope or current permission denied */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Required dependency unavailable */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  searchAdminUsers: {
    parameters: {
      query: {
        q: string;
        cursor?: string;
        limit?: number;
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description One page of matching users */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['UserPage']
            | components['schemas']['PartialUserPage'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  getAdminUser: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Global user detail */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['UserDetail']
            | components['schemas']['PartialUserDetail'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  platformHealth: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Per-service status with instances and details */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | components['schemas']['HealthReport']
            | components['schemas']['PartialHealthReport'];
        };
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Caller is not a platform operator (platform_operator_required) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  keys: {
    parameters: {
      query?: {
        /** @description Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole. */
        fields?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*':
            | {
                [key: string]: unknown;
              }
            | {
                [key: string]: unknown;
              };
        };
      };
    };
  };
  revoke: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        tokenId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  revoke_1: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        teamId: string;
        inviteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  unmountSpaceById: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        tenantId: string;
        siteId: string;
        spaceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SiteDetail'];
        };
      };
      /** @description Unauthorized */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Forbidden */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not Found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Conflict */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Unprocessable Content */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  revokeTenantInvitation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tenantId: string;
        inviteId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Not a tenant admin (permission_denied) or tenant frozen (tenant_suspended) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  endSession: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing, expired or revoked session (authentication_required) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
  revokeManagementToken: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        tokenId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Credential revoked or absent */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Credential invalid or expired */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Credential type, scope or current permission denied */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
      /** @description Required dependency unavailable */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/problem+json': components['schemas']['ApiProblem'];
        };
      };
    };
  };
}
