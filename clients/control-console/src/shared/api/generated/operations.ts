// Generated from contracts/openapi.json. Do not edit.
export const operations = {
  updateWebhook: {
    method: 'put',
    path: '/webhooks/{id}',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  setRetention: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/retention',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  putSpaceGrant: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/grants/{principalKey}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'principalKey',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
    ],
    body: true,
    binary: true,
  },
  deleteSpaceGrant: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/grants/{principalKey}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'principalKey',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
    ],
    body: false,
    binary: false,
  },
  tagPage: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/tags/{label}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'label', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  untagPage: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/tags/{label}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'label', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  setPageProperty: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/properties/{field}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'field',
        in: 'path',
        required: true,
        schema: { type: 'string', maxLength: 64, minLength: 1 },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  removePageProperty: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/properties/{field}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'field',
        in: 'path',
        required: true,
        schema: { type: 'string', maxLength: 64, minLength: 1 },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  putPageRestriction: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions/restriction',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'If-Match',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
    ],
    body: true,
    binary: true,
  },
  deletePageRestriction: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions/restriction',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'If-Match',
        in: 'header',
        required: true,
        schema: { type: 'string' },
      },
    ],
    body: false,
    binary: true,
  },
  setPageIcon: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/icon',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  viewPageContent: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/content',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  editPage: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/content',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'If-Match',
        in: 'header',
        description:
          'Content ETag rev-N from GET /content. Legacy page-rev-N-SHA256 tags are accepted only as a deprecated content-baseline bridge.',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  reorderMountsBySpaceId: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts:order',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  searchConfiguration: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/search',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  configureSearch: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/search',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  putSiteGrant: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/grants/{principalKey}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'principalKey',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
    ],
    body: true,
    binary: true,
  },
  deleteSiteGrant: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/grants/{principalKey}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'principalKey',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
    ],
    body: false,
    binary: false,
  },
  reorderMounts: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts:order',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  mountSpace: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  unmountSpace: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  viewPluginDevelopment: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/plugin-developments/{id}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  savePluginDevelopment: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/plugin-developments/{id}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  deletePluginDevelopment: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/plugin-developments/{id}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'baseRevision',
        in: 'query',
        required: true,
        schema: { type: 'integer', format: 'int32' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: true,
  },
  placeSpace: {
    method: 'put',
    path: '/api/v1/tenants/{tenantId}/collections/{collectionId}/spaces/{spaceId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'collectionId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  unplaceSpace: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/collections/{collectionId}/spaces/{spaceId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'collectionId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  getCurrentUser: {
    method: 'get',
    path: '/api/v1/me',
    parameters: [],
    body: false,
    binary: true,
  },
  replaceCurrentUser: {
    method: 'put',
    path: '/api/v1/me',
    parameters: [],
    body: true,
    binary: true,
  },
  updateCurrentUser: {
    method: 'patch',
    path: '/api/v1/me',
    parameters: [],
    body: true,
    binary: true,
  },
  listWebhooks: {
    method: 'get',
    path: '/webhooks',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  createWebhook: {
    method: 'post',
    path: '/webhooks',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  rotateWebhook: {
    method: 'post',
    path: '/webhooks/{id}:rotate',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: true,
  },
  redeliverWebhook: {
    method: 'post',
    path: '/webhooks/{id}/deliveries/{deliveryId}:redeliver',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'deliveryId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  purgeTrash: {
    method: 'post',
    path: '/ops/trash:purge',
    parameters: [
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  retryStorage: {
    method: 'post',
    path: '/ops/storage:retry',
    parameters: [
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: true,
  },
  reindexSearch: {
    method: 'post',
    path: '/ops/search:reindex',
    parameters: [
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  retryMailJob: {
    method: 'post',
    path: '/ops/mail-jobs/{id}:retry',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'tenantId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  retryJob: {
    method: 'post',
    path: '/ops/jobs/{jobId}:retry',
    parameters: [
      {
        name: 'jobId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  ingestAnalytics: {
    method: 'post',
    path: '/internal/analytics',
    parameters: [],
    body: true,
    binary: true,
  },
  register: {
    method: 'post',
    path: '/auth/register',
    parameters: [],
    body: true,
    binary: true,
  },
  refreshSession: {
    method: 'post',
    path: '/auth/refresh',
    parameters: [],
    body: false,
    binary: true,
  },
  resetPassword: {
    method: 'post',
    path: '/auth/password:reset',
    parameters: [],
    body: true,
    binary: false,
  },
  forgotPassword: {
    method: 'post',
    path: '/auth/password:forgot',
    parameters: [],
    body: true,
    binary: false,
  },
  logout: {
    method: 'post',
    path: '/auth/logout',
    parameters: [],
    body: false,
    binary: false,
  },
  login: {
    method: 'post',
    path: '/auth/login',
    parameters: [],
    body: true,
    binary: true,
  },
  verifyEmail: {
    method: 'post',
    path: '/auth/email:verify',
    parameters: [],
    body: true,
    binary: false,
  },
  resendVerification: {
    method: 'post',
    path: '/auth/email:resend',
    parameters: [],
    body: true,
    binary: false,
  },
  exportAudit: {
    method: 'post',
    path: '/audit:export',
    parameters: [
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  list: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/tokens',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
    ],
    body: false,
    binary: true,
  },
  issue: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/tokens',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  list_1: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/teams',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  create: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/teams',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  invitations: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}/invitations',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  invite: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}/invitations',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  renameTag: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/tags/{label}:rename',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'label', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  listSpaces: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: { type: 'string', pattern: 'active|archived' },
      },
      {
        name: 'mode',
        in: 'query',
        required: false,
        schema: { type: 'string', pattern: 'authored|synced' },
      },
      {
        name: 'collectionId',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          pattern:
            'ungrouped|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  createSpace: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  restoreSpace: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}:restore',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  requestBundleExport: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}:export',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  convertSpace: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}:convert',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  archiveSpace: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}:archive',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  viewToc: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  addTocEntry: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  moveTocEntry: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}:move',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'entryId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  importRelease: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:import',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  startImportUpload: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:import-uploads',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  buildRelease: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:build',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  rollbackRelease: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:rollback',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  promoteRelease: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:promote',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  discardRelease: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:discard',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  approveRelease: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}:approve',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  listPages: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: { type: 'string', pattern: 'draft|published' },
      },
      {
        name: 'format',
        in: 'query',
        required: false,
        schema: { type: 'string', pattern: 'markdown|html|txt|json|xml' },
      },
      { name: 'tag', in: 'query', required: false, schema: { type: 'string' } },
      {
        name: 'q',
        in: 'query',
        required: false,
        schema: { type: 'string', maxLength: 200, minLength: 0 },
      },
      {
        name: 'ids',
        in: 'query',
        description:
          'Select 1..100 distinct Page ids without pagination; cannot combine with limit, cursor or other filters',
        required: false,
        schema: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          maxItems: 100,
          minItems: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  createPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  unpublishPages: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:unpublish',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  publishPages: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:publish',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  previewPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:preview',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: true,
    binary: true,
  },
  batchGetPages: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages:batchGet',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: true,
    binary: true,
  },
  unpublishPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:unpublish',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  trashPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:trash',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  transferPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:transfer',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  revertPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:revert',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'If-Match',
        in: 'header',
        description:
          'Content ETag rev-N from GET /content. Legacy page-rev-N-SHA256 tags are accepted only as a deprecated content-baseline bridge.',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  restorePage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:restore',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  reslugPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:reslug',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  publishPage: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}:publish',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  attachPageFile: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  retryBundleExport: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}:retry',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'jobId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  listSites: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  createSite: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  remountSpaceById: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts/{spaceId}:remount',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  listRedirects: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/redirects',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'origin',
        in: 'query',
        required: false,
        schema: { type: 'string', pattern: 'auto|manual' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  createRedirect: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/redirects',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  deleteRedirect: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/redirects',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'path',
        in: 'query',
        required: true,
        schema: { type: 'string', minLength: 1 },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  remountSpace: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/mounts/{slug}:remount',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  bindDomain: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/domains',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  verifyDomain: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}:verify',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'host', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  setPrimaryDomain: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}:setPrimary',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'host', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  retrySiteDelivery: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/delivery/retry',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  listPluginVerifications: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/plugin-verifications',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'developmentId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  verifyPluginCandidate: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/plugin-verifications',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  listPluginDevelopments: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/plugin-developments',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  createPluginDevelopment: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/plugin-developments',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  listPluginCandidates: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  compilePluginCandidate: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  listTenantInvitations: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/invitations',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  inviteTenantMember: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/invitations',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        description: 'Stable key for this user action (1-255 characters)',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  retryDeletion: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/deletions/{resourceId}:retry',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'resourceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  listContentTypeVersions: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/content-types/versions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'contentType',
        in: 'query',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  registerContentTypeVersion: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/content-types/versions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  deactivateContentType: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/content-types/deactivate',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  activateContentType: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/content-types/activate',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  viewCollections: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/collections',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  createCollection: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/collections',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  moveCollection: {
    method: 'post',
    path: '/api/v1/tenants/{tenantId}/collections/{collectionId}:move',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'collectionId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  eraseCurrentUser: {
    method: 'post',
    path: '/api/v1/me:erase',
    parameters: [
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  changePassword: {
    method: 'post',
    path: '/api/v1/me/password:change',
    parameters: [],
    body: true,
    binary: false,
  },
  listManagementTokens: {
    method: 'get',
    path: '/api/v1/me/access-tokens',
    parameters: [
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
    ],
    body: false,
    binary: false,
  },
  issueManagementToken: {
    method: 'post',
    path: '/api/v1/me/access-tokens',
    parameters: [
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  acceptInvitation: {
    method: 'post',
    path: '/api/v1/invitations/{token}:accept',
    parameters: [
      { name: 'token', in: 'path', required: true, schema: { type: 'string' } },
    ],
    body: false,
    binary: true,
  },
  reactivateAdminUser: {
    method: 'post',
    path: '/admin/users/{id}:reactivate',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  eraseAdminUser: {
    method: 'post',
    path: '/admin/users/{id}:erase',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  deactivateAdminUser: {
    method: 'post',
    path: '/admin/users/{id}:deactivate',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  listTenants: {
    method: 'get',
    path: '/admin/tenants',
    parameters: [
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  provisionTenant: {
    method: 'post',
    path: '/admin/tenants',
    parameters: [],
    body: true,
    binary: true,
  },
  suspendTenant: {
    method: 'post',
    path: '/admin/tenants/{id}:suspend',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  resumeTenant: {
    method: 'post',
    path: '/admin/tenants/{id}:resume',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  view: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  delete: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  rename: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: true,
    binary: true,
  },
  removeMember: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}/members/{userId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  setRole: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}/members/{userId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: true,
    binary: false,
  },
  viewSpace: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  deleteSpace: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  updateSpace: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  removeTocEntry: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'entryId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  relabelTocEntry: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/toc/entries/{entryId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'entryId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  viewRelease: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  patchRelease: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  viewPage: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  renamePage: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  setPageSeo: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/seo',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  viewSite: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  deleteSite: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: true,
  },
  updateSite: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  removeTenantMember: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/members/{userId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  setTenantMemberRole: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/members/{userId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: true,
    binary: false,
  },
  removeCollection: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/collections/{collectionId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'collectionId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  patchCollection: {
    method: 'patch',
    path: '/api/v1/tenants/{tenantId}/collections/{collectionId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'collectionId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: true,
    binary: false,
  },
  listWebhookDeliveries: {
    method: 'get',
    path: '/webhooks/{id}/deliveries',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  tenantUsage: {
    method: 'get',
    path: '/stats/tenants/{id}',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  spaceUsage: {
    method: 'get',
    path: '/stats/spaces/{id}',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  siteTraffic: {
    method: 'get',
    path: '/stats/sites/{id}/traffic',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'granularity',
        in: 'query',
        required: false,
        schema: { type: 'string', default: 'day' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  siteSearchStats: {
    method: 'get',
    path: '/stats/sites/{id}/search',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  readiness: {
    method: 'get',
    path: '/readyz',
    parameters: [
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  storageUsage: {
    method: 'get',
    path: '/ops/storage',
    parameters: [
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listMailJobs: {
    method: 'get',
    path: '/ops/mail-jobs',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listJobs: {
    method: 'get',
    path: '/ops/jobs',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'type',
        in: 'query',
        required: false,
        schema: { type: 'string', default: 'import', pattern: 'import' },
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  domainCertificate: {
    method: 'get',
    path: '/ops/domains/{host}/certificate',
    parameters: [
      { name: 'host', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'tenantId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'platform',
        in: 'query',
        required: false,
        schema: { type: 'boolean', default: false },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  allowDomain: {
    method: 'get',
    path: '/ops/domains/allowed',
    parameters: [
      {
        name: 'domain',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
    ],
    body: false,
    binary: false,
  },
  health: {
    method: 'get',
    path: '/healthz',
    parameters: [
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listAudit: {
    method: 'get',
    path: '/audit',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'actor',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'action',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'target',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'outcome',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'from',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'to',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'date-time' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'integer', format: 'int64' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewAuditExport: {
    method: 'get',
    path: '/audit/exports/{id}',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  downloadAuditExport: {
    method: 'get',
    path: '/audit/exports/{id}/content',
    parameters: [
      {
        name: 'tenantId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  members: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}/members',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listTags: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/tags',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'q', in: 'query', required: false, schema: { type: 'string' } },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listTaggedPages: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/tags/{label}/pages',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'label', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  planSpaceTermination: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}:deletion-plan',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'confirmationName',
        in: 'query',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listTrash: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/trash',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listReleases: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  diffReleases: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases:diff',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'from',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'to',
        in: 'query',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listReleasePreviewPages: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  previewRelease: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview/{slug}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  previewReleaseByPageId: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/releases/{releaseId}/preview/by-id/{pageId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  listSpacePermissions: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  searchPermissionUsers: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/principals/users',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'q',
        in: 'query',
        required: true,
        schema: { type: 'string', maxLength: 2147483647, minLength: 2 },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  searchPermissionTeams: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/principals/teams',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'q',
        in: 'query',
        required: true,
        schema: { type: 'string', maxLength: 2147483647, minLength: 2 },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listPermissionPages: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/permissions/pages',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listPageRevisions: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  diffPageRevisions: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions:diff',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'from',
        in: 'query',
        required: true,
        schema: { type: 'integer', format: 'int32', minimum: 1 },
      },
      {
        name: 'to',
        in: 'query',
        required: true,
        schema: { type: 'integer', format: 'int32', minimum: 1 },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewPageRevision: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/revisions/{revision}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'revision',
        in: 'path',
        required: true,
        schema: { type: 'integer', format: 'int32', minimum: 1 },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewPagePermission: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  explainPageRead: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/permissions:effective',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'principal',
        in: 'query',
        required: true,
        schema: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewPageAttachment: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'ref',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  detachPageFile: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'ref',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  downloadPageAttachment: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/pages/{pageId}/attachments/{ref}/content',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'pageId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'ref',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  listSpaceMounts: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/mounts',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewImportJob: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/import-jobs/{jobId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'jobId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  listBundleExports: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'releaseId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewBundleExport: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'jobId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  downloadBundleExport: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/exports/{jobId}/download',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'jobId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  viewDrift: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/drift',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: false,
  },
  listSpaceAttachments: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/spaces/{spaceId}/attachments',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string', maxLength: 2048, minLength: 0 },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 30,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'q',
        in: 'query',
        required: false,
        schema: { type: 'string', default: '', maxLength: 200, minLength: 0 },
      },
      {
        name: 'type',
        in: 'query',
        required: false,
        schema: { type: 'string', default: 'all', pattern: 'all|image|pdf' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  planSiteTermination: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}:deletion-plan',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'confirmationName',
        in: 'query',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listSitePermissions: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  explainSiteAdmin: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions:effective',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'principal',
        in: 'query',
        required: true,
        schema: {
          type: 'string',
          pattern:
            '(?:user|team|token):[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|anonymous',
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  searchSitePermissionUsers: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/principals/users',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'q',
        in: 'query',
        required: true,
        schema: { type: 'string', maxLength: 2147483647, minLength: 2 },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  searchSitePermissionTeams: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/permissions/principals/teams',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'q',
        in: 'query',
        required: true,
        schema: { type: 'string', maxLength: 2147483647, minLength: 2 },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewDomain: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'host', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  unbindDomain: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/domains/{host}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      { name: 'host', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  siteDeliveryStatus: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/delivery',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listTenantReleases: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/releases',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'mode',
        in: 'query',
        required: false,
        schema: { type: 'string', pattern: 'authored|synced' },
      },
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          pattern: 'draft|flagged|validated|live|archived',
        },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewPluginVerification: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/plugin-verifications/{id}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewPluginCandidate: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/plugin-developments/{id}/candidates/{candidateId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'candidateId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  operationsCapabilities: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/operations',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listTenantMembers: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/members',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listTenantDomains: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/domains',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listDeletions: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/deletions',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listContentTypes: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/content-types',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  viewContentTypeVersion: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/content-types/versions/{versionRef}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'versionRef',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  contentPluginCatalog: {
    method: 'get',
    path: '/api/v1/tenants/{tenantId}/content-plugins',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  listSessions: {
    method: 'get',
    path: '/api/v1/me/sessions',
    parameters: [
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
    ],
    body: false,
    binary: true,
  },
  previewInvitation: {
    method: 'get',
    path: '/api/v1/invitations/{token}',
    parameters: [
      { name: 'token', in: 'path', required: true, schema: { type: 'string' } },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  authenticationContext: {
    method: 'get',
    path: '/api/v1/auth/context',
    parameters: [],
    body: false,
    binary: false,
  },
  searchAdminUsers: {
    method: 'get',
    path: '/admin/users',
    parameters: [
      {
        name: 'q',
        in: 'query',
        required: true,
        schema: { type: 'string', maxLength: 2147483647, minLength: 3 },
      },
      {
        name: 'cursor',
        in: 'query',
        required: false,
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  getAdminUser: {
    method: 'get',
    path: '/admin/users/{id}',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  platformHealth: {
    method: 'get',
    path: '/admin/health',
    parameters: [
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  keys: {
    method: 'get',
    path: '/.well-known/jwks.json',
    parameters: [
      {
        name: 'fields',
        in: 'query',
        description:
          "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.",
        schema: { type: 'string', maxLength: 4096, minLength: 1 },
      },
    ],
    body: false,
    binary: true,
  },
  revoke: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/tokens/{tokenId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'tokenId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  revoke_1: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/teams/{teamId}/invitations/{inviteId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'teamId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'inviteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  unmountSpaceById: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/sites/{siteId}/space-mounts/{spaceId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'spaceId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
    ],
    body: false,
    binary: false,
  },
  revokeTenantInvitation: {
    method: 'delete',
    path: '/api/v1/tenants/{tenantId}/invitations/{inviteId}',
    parameters: [
      {
        name: 'tenantId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      {
        name: 'inviteId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  endSession: {
    method: 'delete',
    path: '/api/v1/me/sessions/{id}',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
  revokeManagementToken: {
    method: 'delete',
    path: '/api/v1/me/access-tokens/{tokenId}',
    parameters: [
      {
        name: 'tokenId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    body: false,
    binary: false,
  },
} as const;
