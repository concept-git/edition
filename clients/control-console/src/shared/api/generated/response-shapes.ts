// Generated from contracts/openapi.json. Do not edit.
import type { ResponseShape } from '../normalize';
export const schemas: Record<string, ResponseShape> = {
  ApiProblem: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      title: { type: 'string' },
      status: { type: 'integer' },
      code: { $ref: '#/components/schemas/ProblemCode' },
      detail: { type: 'string' },
      traceId: { type: 'string' },
      violations: {
        type: 'array',
        items: { $ref: '#/components/schemas/Violation' },
      },
      relatedIds: { type: 'array', items: { type: 'string' } },
      relatedGroups: {
        type: 'array',
        items: { $ref: '#/components/schemas/RelatedGroup' },
      },
      conflict: { $ref: '#/components/schemas/Conflict' },
    },
    required: ['code', 'detail', 'status', 'title', 'traceId', 'type'],
  },
  Conflict: {
    type: 'object',
    properties: {
      currentRevision: { type: 'integer' },
      currentEtag: { type: 'string' },
      theirs: { type: 'string' },
      currentContentType: { type: ['string', 'null'] },
      currentVersionRef: { type: ['string', 'null'] },
      currentInterpretation: { type: ['object', 'null'] },
    },
    required: ['currentEtag', 'currentRevision', 'theirs'],
  },
  ProblemCode: { type: 'string' },
  RelatedGroup: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
    },
    required: ['id', 'name', 'tenantId', 'type'],
  },
  Violation: {
    type: 'object',
    properties: { field: { type: 'string' }, code: { type: 'string' } },
    required: ['code', 'field'],
  },
  WebhookConfiguration: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      scopeType: { type: 'string' },
      scopeId: { type: 'string' },
      events: { type: 'array', items: { type: 'string' } },
      active: { type: 'boolean' },
    },
    required: ['events', 'scopeType', 'url'],
  },
  Subscription: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      url: { type: 'string' },
      scopeType: { type: 'string' },
      scopeId: { type: 'string' },
      events: { type: 'array', items: { type: 'string' } },
      active: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  },
  RetentionRequest: {
    type: 'object',
    properties: { keep: { type: 'integer' } },
    required: ['keep'],
  },
  SpaceDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      icon: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      mode: { type: 'string' },
      status: { type: 'string' },
      pageCount: { type: 'integer' },
      driftCount: { type: 'integer' },
      lastReleaseAt: { type: ['string', 'null'] },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      collectionId: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
      collectionPath: { type: 'array', items: { type: 'string' } },
      mounts: {
        type: 'array',
        items: { $ref: '#/components/schemas/SpaceMount' },
      },
      retention: { type: 'integer' },
      autoRelease: { type: ['boolean', 'null'] },
    },
    required: [
      'allowedActions',
      'autoRelease',
      'collectionId',
      'collectionPath',
      'createdAt',
      'createdBy',
      'description',
      'driftCount',
      'icon',
      'id',
      'lastReleaseAt',
      'mode',
      'mounts',
      'name',
      'pageCount',
      'retention',
      'status',
      'tenantId',
      'updatedAt',
      'updatedBy',
    ],
  },
  SpaceMount: {
    type: 'object',
    properties: { siteId: { type: 'string' }, slug: { type: 'string' } },
    required: ['siteId', 'slug'],
  },
  GrantRequest: {
    type: 'object',
    properties: { role: { type: 'string' } },
    required: ['role'],
  },
  GrantView: {
    type: 'object',
    properties: {
      resource: { $ref: '#/components/schemas/ResourceView' },
      principal: { $ref: '#/components/schemas/PrincipalView' },
      role: { type: 'string' },
      operations: { type: 'array', items: { type: 'string' } },
      editable: { type: 'boolean' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PrincipalView: {
    type: 'object',
    properties: {
      key: { type: 'string' },
      type: { type: 'string' },
      id: { type: ['string', 'null'] },
      name: { type: 'string' },
      status: { type: 'string' },
      email: { type: ['string', 'null'] },
      avatar: { type: ['string', 'null'] },
      memberCount: { type: ['integer', 'null'] },
    },
  },
  ResourceView: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      source: { type: 'string' },
    },
  },
  Attachment: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      filename: { type: 'string' },
      mime: { type: 'string' },
      sizeBytes: { type: 'integer' },
      contentPath: { type: 'string' },
    },
  },
  PageDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      icon: { type: ['string', 'null'] },
      tags: { type: 'array', items: { type: 'string' } },
      driftFlag: { type: 'boolean' },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string' },
      publishedAt: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
      content: { type: 'string' },
      revision: { type: 'integer' },
      seo: { $ref: '#/components/schemas/Seo' },
      properties: { type: 'object' },
      attachments: {
        type: 'array',
        items: { $ref: '#/components/schemas/Attachment' },
      },
      trashedAt: { type: ['string', 'null'] },
      revisionCount: { type: 'integer' },
      wordCount: { type: 'integer' },
      readingTime: { type: 'integer' },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
    },
  },
  Seo: {
    type: 'object',
    properties: {
      title: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      keywords: { type: ['string', 'null'] },
      ogImage: { type: ['string', 'null'] },
      noIndex: { type: 'boolean' },
    },
  },
  SetPagePropertyRequest: {
    type: 'object',
    properties: { value: { type: 'string' } },
    required: ['value'],
  },
  RestrictionRequest: {
    type: 'object',
    properties: { principals: { type: 'array', items: { type: 'string' } } },
    required: ['principals'],
  },
  PagePermissionView: {
    type: 'object',
    properties: {
      pageId: { type: 'string' },
      restriction: { $ref: '#/components/schemas/RestrictionView' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  RestrictionView: {
    type: 'object',
    properties: {
      active: { type: 'boolean' },
      principals: {
        type: 'array',
        items: { $ref: '#/components/schemas/PrincipalView' },
      },
      revision: { type: 'integer' },
    },
  },
  SetPageIconRequest: {
    type: 'object',
    properties: { icon: { type: ['string', 'null'] } },
  },
  EditPageRequest: {
    type: 'object',
    properties: {
      content: { type: 'string' },
      contentType: { type: 'string' },
      versionRef: { type: ['string', 'null'] },
      interpretation: { type: 'object' },
      intent: { type: ['string', 'null'] },
    },
    required: ['content'],
  },
  SpaceOrderRequest: {
    type: 'object',
    properties: { spaceIds: { type: 'array', items: { type: 'string' } } },
    required: ['spaceIds'],
  },
  SiteBranding: {
    type: 'object',
    properties: {
      logo: { type: ['string', 'null'] },
      favicon: { type: ['string', 'null'] },
      primaryColor: { type: ['string', 'null'] },
    },
    required: ['favicon', 'logo', 'primaryColor'],
  },
  SiteDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      rule: { type: 'string' },
      home: { type: ['string', 'null'] },
      robotsPolicy: { type: 'string' },
      titleTemplate: { type: ['string', 'null'] },
      branding: { $ref: '#/components/schemas/SiteBranding' },
      locale: { type: ['string', 'null'] },
      analyticsId: { type: ['string', 'null'] },
      mounts: {
        type: 'array',
        items: { $ref: '#/components/schemas/SiteMount' },
      },
      domains: {
        type: 'array',
        items: { $ref: '#/components/schemas/SiteDomain' },
      },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'allowedActions',
      'analyticsId',
      'branding',
      'createdAt',
      'createdBy',
      'domains',
      'home',
      'id',
      'locale',
      'mounts',
      'name',
      'robotsPolicy',
      'rule',
      'tenantId',
      'titleTemplate',
      'updatedAt',
      'updatedBy',
    ],
  },
  SiteDomain: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      verified: { type: 'boolean' },
      isPrimary: { type: 'boolean' },
    },
    required: ['host', 'isPrimary', 'verified'],
  },
  SiteMount: {
    type: 'object',
    properties: { spaceId: { type: 'string' }, slug: { type: 'string' } },
    required: ['slug', 'spaceId'],
  },
  Fields: {
    type: 'object',
    properties: { fields: { type: 'array', items: { type: 'string' } } },
    required: ['fields'],
  },
  Configuration: {
    type: 'object',
    properties: {
      fields: { type: 'array', items: { type: 'string' } },
      revision: { type: 'integer' },
    },
  },
  OrderRequest: {
    type: 'object',
    properties: { slugs: { type: 'array', items: { type: 'string' } } },
    required: ['slugs'],
  },
  MountRequest: {
    type: 'object',
    properties: { spaceId: { type: 'string' } },
    required: ['spaceId'],
  },
  Save: {
    type: 'object',
    properties: {
      baseRevision: { type: 'integer' },
      name: { type: 'string' },
      contentType: { type: 'string' },
      source: { $ref: '#/components/schemas/Source' },
    },
    required: ['contentType', 'name', 'source'],
  },
  Source: {
    type: 'object',
    properties: {
      files: { type: 'object' },
      manifest: { type: 'string' },
      configuration: { type: 'string' },
      fixtures: { type: 'string' },
      dependencyLock: { type: 'string' },
      baselineRef: { type: 'string' },
    },
  },
  Development: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      contentType: { type: 'string' },
      revision: { type: 'integer' },
      source: { $ref: '#/components/schemas/Source' },
      sourceDigest: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  },
  PlaceRequest: {
    type: 'object',
    properties: { position: { type: 'integer' } },
  },
  ReplaceProfileRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      locale: { type: ['string', 'null'] },
      avatar: { type: ['string', 'null'] },
    },
    required: ['avatar', 'locale', 'name'],
  },
  Profile: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      avatar: { type: 'string' },
      locale: { type: 'string' },
      verified: { type: 'boolean' },
      status: { type: 'string' },
      platformOperator: { type: 'boolean' },
      tenants: {
        type: 'array',
        items: { $ref: '#/components/schemas/TenantMembership' },
      },
    },
  },
  TenantMembership: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string' },
      status: { type: 'string' },
    },
  },
  SecretResult: {
    type: 'object',
    properties: {
      subscription: { $ref: '#/components/schemas/Subscription' },
      secret: { type: 'string' },
    },
  },
  TenantRequest: {
    type: 'object',
    properties: { tenantId: { type: 'string' } },
    required: ['tenantId'],
  },
  PurgeReport: {
    type: 'object',
    properties: {
      scanned: { type: 'integer' },
      purged: { type: 'integer' },
      protectedCount: { type: 'integer' },
    },
  },
  StorageRetry: {
    type: 'object',
    properties: { retriedObjects: { type: 'integer' } },
  },
  Target: {
    type: 'object',
    properties: { tenantId: { type: 'string' }, siteId: { type: 'string' } },
    required: ['siteId', 'tenantId'],
  },
  MailJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      kind: { type: 'string' },
      recipient: { type: 'string' },
      tenantId: { type: 'string' },
      status: { type: 'string' },
      attempt: { type: 'integer' },
      nextRunAt: { type: 'string' },
      error: { type: 'string' },
      traceId: { type: 'string' },
      outcome: { type: 'string' },
      createdAt: { type: 'string' },
      completedAt: { type: 'string' },
      canRetry: { type: 'boolean' },
    },
  },
  RetryRequest: {
    type: 'object',
    properties: { tenantId: { type: 'string' }, platform: { type: 'boolean' } },
    required: ['tenantId'],
  },
  TelemetryEvent: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      sourceId: { type: 'string' },
      time: { type: 'string' },
      tenantId: { type: 'string' },
      siteId: { type: 'string' },
      pageId: { type: 'string' },
      type: { type: 'string' },
      path: { type: 'string' },
      query: { type: 'string' },
      searchId: { type: 'string' },
      visitor: { type: 'string' },
      referrer: { type: 'string' },
      zero: { type: 'boolean' },
      observable: { type: 'boolean' },
      dropped: { type: 'integer' },
    },
  },
  Accepted: { type: 'object', properties: { accepted: { type: 'integer' } } },
  RegisterRequest: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      name: { type: 'string' },
      password: { type: 'string' },
    },
    required: ['email', 'name', 'password'],
  },
  RegisterResponse: {
    type: 'object',
    properties: { userId: { type: 'string' } },
    required: ['userId'],
  },
  TokenResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      tokenType: { type: 'string' },
      expiresIn: { type: 'integer' },
    },
  },
  ResetRequest: {
    type: 'object',
    properties: { token: { type: 'string' }, newPassword: { type: 'string' } },
    required: ['newPassword', 'token'],
  },
  ForgotRequest: {
    type: 'object',
    properties: { email: { type: 'string' } },
    required: ['email'],
  },
  LoginRequest: {
    type: 'object',
    properties: { email: { type: 'string' }, password: { type: 'string' } },
    required: ['email', 'password'],
  },
  VerifyEmailRequest: {
    type: 'object',
    properties: { user: { type: 'string' }, token: { type: 'string' } },
    required: ['token', 'user'],
  },
  ResendRequest: {
    type: 'object',
    properties: { email: { type: 'string' } },
    required: ['email'],
  },
  AuditFilter: {
    type: 'object',
    properties: {
      actor: { type: 'string' },
      action: { type: 'string' },
      target: { type: 'string' },
      outcome: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      cursor: { type: 'integer' },
    },
  },
  ExportRequest: {
    type: 'object',
    properties: {
      tenantId: { type: 'string' },
      filter: { $ref: '#/components/schemas/AuditFilter' },
    },
    required: ['filter'],
  },
  ExportStatus: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
      error: { type: 'string' },
      expiresAt: { type: 'string' },
    },
  },
  IssueTokenRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      spaceId: { type: 'string' },
      role: { type: 'string' },
      scopes: { type: 'array', items: { type: 'string' } },
      expiry: { type: 'string' },
    },
    required: ['expiry', 'name', 'role', 'scopes', 'spaceId'],
  },
  IssuedToken: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      ownerId: { type: 'string' },
      tenantId: { type: 'string' },
      spaceId: { type: 'string' },
      role: { type: 'string' },
      scopes: { type: 'array', items: { type: 'string' } },
      expiry: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'string' },
      secret: { type: 'string' },
    },
  },
  TeamNameRequest: {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  },
  TeamView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      callerRole: { type: 'string' },
      memberCount: { type: 'integer' },
      ownerCount: { type: 'integer' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  },
  InviteRequest: {
    type: 'object',
    properties: { email: { type: 'string' }, role: { type: 'string' } },
    required: ['email', 'role'],
  },
  TeamInvitationSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      expiresAt: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  TeamIssuedInvitation: {
    type: 'object',
    properties: {
      invite: { $ref: '#/components/schemas/TeamInvitationSummary' },
      token: { type: 'string' },
    },
  },
  RenameRequest: {
    type: 'object',
    properties: { to: { type: 'string' } },
    required: ['to'],
  },
  TagRename: {
    type: 'object',
    properties: { from: { type: 'string' }, to: { type: 'string' } },
  },
  CreateSpaceRequest: {
    type: 'object',
    properties: { name: { type: 'string' }, mode: { type: 'string' } },
    required: ['mode', 'name'],
  },
  BundleExportRequest: {
    type: 'object',
    properties: { releaseId: { type: 'string' } },
    required: ['releaseId'],
  },
  BundleExportJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      releaseId: { type: 'string' },
      status: { type: 'string' },
      attempts: { type: 'integer' },
      error: { type: 'string' },
      traceId: { type: 'string' },
      createdAt: { type: 'string' },
      expiresAt: { type: 'string' },
      bytes: { type: 'integer' },
    },
  },
  ConvertSpaceRequest: {
    type: 'object',
    properties: { mode: { type: 'string' } },
    required: ['mode'],
  },
  AddEntryRequest: {
    type: 'object',
    properties: {
      parentId: { type: 'string' },
      label: { type: 'string' },
      kind: { type: 'string' },
      targetId: { type: 'string' },
      url: { type: 'string' },
      position: { type: 'integer' },
    },
    required: ['kind', 'label'],
  },
  TocEntry: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      parentId: { type: 'string' },
      position: { type: 'integer' },
      label: { type: 'string' },
      kind: { type: 'string' },
      targetId: { type: 'string' },
      url: { type: 'string' },
      depth: { type: 'integer' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/TocEntry' },
      },
    },
  },
  TocView: {
    type: 'object',
    properties: {
      entries: {
        type: 'array',
        items: { $ref: '#/components/schemas/TocEntry' },
      },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  MoveRequest: {
    type: 'object',
    properties: { parentId: { type: 'string' }, position: { type: 'integer' } },
    required: ['position'],
  },
  ImportZipFilePart: {
    type: 'object',
    properties: { file: { type: 'string' } },
  },
  DiffSummary: {
    type: 'object',
    properties: {
      added: { type: 'integer' },
      changed: { type: 'integer' },
      removed: { type: 'integer' },
    },
  },
  ImportAccepted: {
    type: 'object',
    properties: {
      job: { $ref: '#/components/schemas/ImportJob' },
      release: { $ref: '#/components/schemas/ReleaseDetail' },
    },
  },
  ImportJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
      phase: { type: 'string' },
      progress: { $ref: '#/components/schemas/ImportJobProgress' },
      attempt: { type: 'integer' },
      nextRunAt: { type: ['string', 'null'] },
      traceId: { type: 'string' },
      outcome: { type: ['string', 'null'] },
      releaseId: { type: ['string', 'null'] },
      sourceUrl: { type: ['string', 'null'] },
      adapterId: { type: ['string', 'null'] },
      report: { $ref: '#/components/schemas/ImportJobReport' },
      terminal: { type: 'boolean' },
      successful: { type: 'boolean' },
      nextPollAfterSeconds: { type: ['integer', 'null'] },
    },
    required: ['nextPollAfterSeconds', 'successful', 'terminal'],
  },
  ImportJobIssue: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      path: { type: ['string', 'null'] },
      detail: { type: ['string', 'null'] },
    },
  },
  ImportJobProgress: {
    type: 'object',
    properties: {
      done: { type: ['integer', 'null'] },
      total: { type: ['integer', 'null'] },
    },
  },
  ImportJobReport: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: { $ref: '#/components/schemas/ImportJobIssue' },
      },
      info: {
        type: 'array',
        items: { $ref: '#/components/schemas/ImportJobIssue' },
      },
    },
  },
  IssueView: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      path: { type: 'string' },
      pageId: { type: 'string' },
      detail: { type: 'string' },
    },
  },
  ReleaseDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      status: { type: 'string' },
      source: { $ref: '#/components/schemas/ReleaseSource' },
      pageCount: { type: 'integer' },
      createdAt: { type: 'string' },
      promotedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string' },
      report: { $ref: '#/components/schemas/ReportView' },
      diffSummary: { $ref: '#/components/schemas/DiffSummary' },
      size: { type: 'integer' },
    },
  },
  ReleaseSource: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      ref: { type: 'string' },
      actor: { type: 'string' },
    },
  },
  ReportView: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: { $ref: '#/components/schemas/IssueView' },
      },
      warnings: {
        type: 'array',
        items: { $ref: '#/components/schemas/IssueView' },
      },
      info: {
        type: 'array',
        items: { $ref: '#/components/schemas/IssueView' },
      },
    },
  },
  ImportFromUploadRequest: {
    type: 'object',
    properties: {
      uploadKey: { type: ['string', 'null'] },
      url: { type: ['string', 'null'] },
    },
  },
  ImportUpload: {
    type: 'object',
    properties: {
      putUrl: { type: 'string' },
      expiresAt: { type: 'string' },
      uploadKey: { type: 'string' },
    },
  },
  BuildReleaseResult: {
    type: 'object',
    properties: {
      outcome: { type: 'string' },
      release: { $ref: '#/components/schemas/ReleaseDetail' },
    },
  },
  ApproveReleaseResult: {
    type: 'object',
    properties: {
      outcome: { type: 'string' },
      release: { $ref: '#/components/schemas/ReleaseDetail' },
    },
  },
  CreatePageRequest: {
    type: 'object',
    properties: {
      format: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      contentType: { type: 'string' },
      versionRef: { type: ['string', 'null'] },
      interpretation: { type: 'object' },
    },
    required: ['format', 'slug', 'title'],
  },
  PageIdsRequest: {
    type: 'object',
    properties: { ids: { type: 'array', items: { type: 'string' } } },
    required: ['ids'],
  },
  BatchPublishResult: {
    type: 'object',
    properties: {
      pages: {
        type: 'array',
        items: { $ref: '#/components/schemas/PageSummary' },
      },
      outcome: { type: 'string' },
      release: { $ref: '#/components/schemas/ReleaseDetail' },
    },
  },
  PageSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      icon: { type: ['string', 'null'] },
      tags: { type: 'array', items: { type: 'string' } },
      driftFlag: { type: 'boolean' },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string' },
      publishedAt: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
    },
  },
  PreviewPageRequest: {
    type: 'object',
    properties: { format: { type: 'string' }, content: { type: 'string' } },
    required: ['content', 'format'],
  },
  PagePreview: { type: 'object', properties: { html: { type: 'string' } } },
  BatchReadRequest: {
    type: 'object',
    properties: {
      ids: { type: 'array', items: { type: 'string' } },
      view: { type: 'string' },
    },
    required: ['ids', 'view'],
  },
  BatchPageItem: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
      page: {
        anyOf: [{ $ref: '#/components/schemas/PageSummary' }, { type: 'null' }],
      },
      content: {
        anyOf: [
          { $ref: '#/components/schemas/ContentSnapshot' },
          { type: 'null' },
        ],
      },
      etag: { type: ['string', 'null'] },
    },
    required: ['id', 'status'],
  },
  BatchPageResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/BatchPageItem' },
      },
    },
  },
  ContentSnapshot: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      format: { type: 'string' },
      content: { type: 'string' },
      revision: { type: 'integer' },
      contentType: { type: 'string' },
      versionRef: { type: ['string', 'null'] },
      interpretation: { type: 'object' },
    },
    required: [
      'content',
      'contentType',
      'format',
      'id',
      'interpretation',
      'revision',
      'versionRef',
    ],
  },
  PublishResult: {
    type: 'object',
    properties: {
      page: { $ref: '#/components/schemas/PageDetail' },
      outcome: { type: 'string' },
      release: { $ref: '#/components/schemas/ReleaseDetail' },
    },
  },
  TransferPageRequest: {
    type: 'object',
    properties: { toSpace: { type: 'string' }, slug: { type: 'string' } },
    required: ['slug', 'toSpace'],
  },
  RevertPageRequest: { type: 'object', properties: { n: { type: 'integer' } } },
  ReslugPageRequest: {
    type: 'object',
    properties: { slug: { type: 'string' } },
    required: ['slug'],
  },
  CreateSiteRequest: {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  },
  RemountRequest: {
    type: 'object',
    properties: { newSlug: { type: 'string' } },
    required: ['newSlug'],
  },
  CreateRedirectRequest: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      targetType: { type: 'string' },
      targetId: { type: 'string' },
    },
    required: ['path', 'targetId', 'targetType'],
  },
  RedirectView: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      targetId: { type: 'string' },
      targetType: { type: 'string' },
      origin: { type: 'string' },
      createdAt: { type: 'string' },
      hitCount: { type: 'integer' },
      currentPath: { type: 'string' },
      targetLabel: { type: 'string' },
      reachable: { type: 'boolean' },
    },
  },
  BindRequest: {
    type: 'object',
    properties: { host: { type: 'string' } },
    required: ['host'],
  },
  DomainDetail: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      verified: { type: 'boolean' },
      isPrimary: { type: 'boolean' },
      dnsToken: { type: 'string' },
      txtName: { type: 'string' },
      txtValue: { type: 'string' },
    },
    required: [
      'dnsToken',
      'host',
      'isPrimary',
      'txtName',
      'txtValue',
      'verified',
    ],
  },
  Check: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      passed: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  Evidence: {
    type: 'object',
    properties: {
      passed: { type: 'boolean' },
      checks: { type: 'array', items: { $ref: '#/components/schemas/Check' } },
    },
  },
  Verify: {
    type: 'object',
    properties: {
      developmentId: { type: 'string' },
      candidateId: { type: 'string' },
      fixtureDigest: { type: 'string' },
      environment: { type: 'string' },
      browserEvidence: { $ref: '#/components/schemas/Evidence' },
    },
    required: [
      'browserEvidence',
      'candidateId',
      'developmentId',
      'environment',
      'fixtureDigest',
    ],
  },
  Verification: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      candidateId: { type: 'string' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      fixtureDigest: { type: 'string' },
      environment: { type: 'string' },
      browserEvidence: { $ref: '#/components/schemas/Evidence' },
      serverValidation: { $ref: '#/components/schemas/Evidence' },
      productionEligible: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  },
  Create: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      contentType: { type: 'string' },
      source: { $ref: '#/components/schemas/Source' },
    },
    required: ['contentType', 'name', 'source'],
  },
  Compile: {
    type: 'object',
    properties: {
      baseRevision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      entryPoint: { type: 'string' },
      bundle: { type: 'string' },
      environment: { type: 'string' },
    },
    required: ['bundle', 'entryPoint', 'environment', 'sourceDigest'],
  },
  Candidate: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      sourceRevision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      entryPoint: { type: 'string' },
      bundle: { type: 'string' },
      environment: { type: 'string' },
      source: { $ref: '#/components/schemas/Source' },
      createdAt: { type: 'string' },
    },
  },
  TenantInvitationSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      expiresAt: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  TenantIssuedInvitation: {
    type: 'object',
    properties: {
      invite: { $ref: '#/components/schemas/TenantInvitationSummary' },
      token: { type: 'string' },
    },
  },
  ContentTypeDefinition: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      version: { type: 'string' },
      label: { type: 'string' },
      format: { type: 'string' },
      mediaType: { type: 'string' },
      language: { type: 'string' },
      renderHost: { type: 'string' },
      defaultInterpretation: { type: 'object' },
      validation: {
        oneOf: [{ $ref: '#/components/schemas/Validation' }, { type: 'null' }],
      },
      schemaResources: { type: 'object' },
      editors: {
        type: 'array',
        items: { $ref: '#/components/schemas/Contribution' },
      },
      renderers: {
        type: 'array',
        items: { $ref: '#/components/schemas/Contribution' },
      },
    },
  },
  Contribution: {
    type: 'object',
    properties: {
      pluginId: { type: 'string' },
      pluginVersion: { type: 'string' },
      contributionId: { type: 'string' },
      config: { type: 'object' },
    },
  },
  Register: {
    type: 'object',
    properties: {
      contentType: { type: 'string' },
      baseRevision: { type: 'integer' },
      definition: { $ref: '#/components/schemas/ContentTypeDefinition' },
    },
    required: ['contentType', 'definition'],
  },
  Validation: {
    type: 'object',
    properties: {
      encoding: { type: 'string' },
      schemaRef: { type: ['string', 'null'] },
      instanceSchemaPointer: { type: ['string', 'null'] },
    },
  },
  Version: {
    type: 'object',
    properties: {
      versionRef: { type: 'string' },
      digest: { type: 'string' },
      definition: { $ref: '#/components/schemas/ContentTypeDefinition' },
      createdAt: { type: ['string', 'null'] },
    },
  },
  Deactivate: {
    type: 'object',
    properties: {
      contentType: { type: 'string' },
      baseRevision: { type: 'integer' },
    },
    required: ['contentType'],
  },
  State: {
    type: 'object',
    properties: {
      contentType: { type: 'string' },
      enabled: { type: 'boolean' },
      revision: { type: 'integer' },
      activeVersionRef: { type: 'string' },
      label: { type: 'string' },
      format: { type: 'string' },
      mediaType: { type: 'string' },
      builtin: { type: 'boolean' },
    },
  },
  Activate: {
    type: 'object',
    properties: {
      contentType: { type: 'string' },
      baseRevision: { type: 'integer' },
      versionRef: { type: 'string' },
    },
    required: ['contentType', 'versionRef'],
  },
  CreateRequest: {
    type: 'object',
    properties: {
      parentId: { type: 'string' },
      name: { type: 'string' },
      icon: { type: 'string' },
      position: { type: 'integer' },
    },
    required: ['name'],
  },
  CollectionNode: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      parentId: { type: 'string' },
      position: { type: 'integer' },
      name: { type: 'string' },
      icon: { type: 'string' },
      depth: { type: 'integer' },
      spaceCount: { type: 'integer' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/CollectionNode' },
      },
    },
  },
  CollectionView: {
    type: 'object',
    properties: {
      collections: {
        type: 'array',
        items: { $ref: '#/components/schemas/CollectionNode' },
      },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  EraseRequest: {
    type: 'object',
    properties: {
      confirmationEmail: { type: 'string' },
      currentPassword: { type: 'string' },
    },
    required: ['confirmationEmail', 'currentPassword'],
  },
  ChangeRequest: {
    type: 'object',
    properties: {
      oldPassword: { type: 'string' },
      newPassword: { type: 'string' },
    },
    required: ['newPassword', 'oldPassword'],
  },
  IssueRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      scopes: { type: 'array', items: { type: 'string' } },
      tenantId: { type: ['string', 'null'] },
      expiry: { type: 'string' },
    },
    required: ['expiry', 'name', 'scopes'],
  },
  IssuedManagementToken: {
    type: 'object',
    properties: {
      token: { $ref: '#/components/schemas/ManagementTokenView' },
      secret: { type: 'string' },
    },
  },
  ManagementTokenView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      scopes: { type: 'array', items: { type: 'string' } },
      tenantId: { type: ['string', 'null'] },
      expiry: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'string' },
      lastUsedAt: { type: ['string', 'null'] },
      revokedAt: { type: ['string', 'null'] },
    },
  },
  InvitationAcceptance: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      tenant: { $ref: '#/components/schemas/InviteGroup' },
      team: { $ref: '#/components/schemas/InviteGroup' },
      role: { type: 'string' },
    },
  },
  InviteGroup: {
    type: 'object',
    properties: { id: { type: 'string' }, name: { type: 'string' } },
  },
  ConfirmRequest: {
    type: 'object',
    properties: {
      confirmationEmail: { type: 'string' },
      currentPassword: { type: 'string' },
    },
    required: ['confirmationEmail', 'currentPassword'],
  },
  ProvisionTenantRequest: {
    type: 'object',
    properties: { name: { type: 'string' }, ownerEmail: { type: 'string' } },
    required: ['name', 'ownerEmail'],
  },
  Provisioned: {
    type: 'object',
    properties: {
      tenant: { $ref: '#/components/schemas/TenantView' },
      ownerInviteToken: { type: 'string' },
    },
  },
  TenantView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
      ownerCount: { type: 'integer' },
      createdAt: { type: 'string' },
    },
  },
  RoleRequest: {
    type: 'object',
    properties: { role: { type: 'string' } },
    required: ['role'],
  },
  UpdateSpaceRequest: {
    type: 'object',
    properties: {
      name: { type: ['string', 'null'] },
      icon: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      autoRelease: { type: ['boolean', 'null'] },
    },
  },
  RelabelRequest: {
    type: 'object',
    properties: { label: { type: 'string' } },
    required: ['label'],
  },
  PatchReleaseRequest: {
    type: 'object',
    properties: {
      label: { type: ['string', 'null'] },
      notes: { type: ['string', 'null'] },
    },
  },
  RenamePageRequest: {
    type: 'object',
    properties: { title: { type: 'string' } },
    required: ['title'],
  },
  PageSeoPatchRequest: {
    type: 'object',
    properties: {
      title: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      keywords: { type: ['string', 'null'] },
      ogImage: { type: ['string', 'null'] },
      noIndex: { type: ['boolean', 'null'] },
    },
  },
  UpdateSiteBranding: {
    type: 'object',
    properties: {
      logo: { type: ['string', 'null'] },
      favicon: { type: ['string', 'null'] },
      primaryColor: { type: ['string', 'null'] },
    },
  },
  UpdateSiteRequest: {
    type: 'object',
    properties: {
      name: { type: ['string', 'null'] },
      titleTemplate: { type: ['string', 'null'] },
      branding: {
        anyOf: [
          { $ref: '#/components/schemas/UpdateSiteBranding' },
          { type: 'null' },
        ],
      },
      locale: { type: ['string', 'null'] },
      analyticsId: { type: ['string', 'null'] },
      robotsPolicy: { type: ['string', 'null'] },
      home: { type: ['string', 'null'] },
      rule: { type: ['string', 'null'] },
    },
  },
  MemberRoleRequest: {
    type: 'object',
    properties: { role: { type: 'string' } },
    required: ['role'],
  },
  PatchRequest: {
    type: 'object',
    properties: {
      name: { type: ['string', 'null'] },
      icon: { type: ['string', 'null'] },
    },
  },
  UpdateProfileRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      locale: { type: 'string' },
      avatar: { type: 'string' },
    },
    required: ['name'],
  },
  SubscriptionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/Subscription' },
      },
      nextCursor: { type: 'string' },
      eventTypes: { type: 'array', items: { type: 'string' } },
    },
  },
  Attempt: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      startedAt: { type: 'string' },
      responseCode: { type: 'integer' },
      error: { type: 'string' },
      durationMs: { type: 'integer' },
    },
  },
  Delivery: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      eventId: { type: 'string' },
      eventType: { type: 'string' },
      status: { type: 'string' },
      attempts: { type: 'integer' },
      nextRunAt: { type: 'string' },
      responseCode: { type: 'integer' },
      createdAt: { type: 'string' },
      history: {
        type: 'array',
        items: { $ref: '#/components/schemas/Attempt' },
      },
    },
  },
  DeliveryPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/Delivery' },
      },
      nextCursor: { type: 'string' },
    },
  },
  Usage: {
    type: 'object',
    properties: {
      workingPages: { type: 'integer' },
      trashedPages: { type: 'integer' },
      publishedPages: { type: 'integer' },
      workingTextBytes: { type: 'integer' },
      trashedTextBytes: { type: 'integer' },
      attachmentCount: { type: 'integer' },
      attachmentBytes: { type: 'integer' },
      releases: { type: 'integer' },
      snapshotPages: { type: 'integer' },
      snapshotTextBytes: { type: 'integer' },
      promotions: { type: 'integer' },
      activeAuthors: { type: 'integer' },
      imports: { type: 'object' },
      computedAt: { type: 'string' },
    },
  },
  Bucket: {
    type: 'object',
    properties: {
      time: { type: 'string' },
      pv: { type: 'integer' },
      uv: { type: 'integer' },
    },
  },
  Health: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      updatedAt: { type: 'string' },
      lossDetected: { type: 'boolean' },
      staleSources: { type: 'integer' },
      retainedFrom: { type: 'string' },
    },
  },
  Ranked: {
    type: 'object',
    properties: { label: { type: 'string' }, count: { type: 'integer' } },
  },
  Traffic: {
    type: 'object',
    properties: {
      pv: { type: 'integer' },
      series: { type: 'array', items: { $ref: '#/components/schemas/Bucket' } },
      pages: { type: 'array', items: { $ref: '#/components/schemas/Ranked' } },
      notFound: {
        type: 'array',
        items: { $ref: '#/components/schemas/Ranked' },
      },
      referrers: {
        type: 'array',
        items: { $ref: '#/components/schemas/Ranked' },
      },
      health: { $ref: '#/components/schemas/Health' },
    },
  },
  Search: {
    type: 'object',
    properties: {
      searches: { type: 'integer' },
      observable: { type: 'integer' },
      clicked: { type: 'integer' },
      clickRate: { type: 'number' },
      popular: {
        type: 'array',
        items: { $ref: '#/components/schemas/Ranked' },
      },
      zeroResults: {
        type: 'array',
        items: { $ref: '#/components/schemas/Ranked' },
      },
      health: { $ref: '#/components/schemas/Health' },
    },
  },
  ProbeResponse: { type: 'object', properties: { status: { type: 'string' } } },
  StorageUsage: {
    type: 'object',
    properties: {
      sourceObjects: { type: 'integer' },
      sourceBytes: { type: 'integer' },
      measuredAt: { type: 'string' },
      databaseBytes: { type: 'integer' },
      failedSourceObjects: { type: 'integer' },
    },
  },
  MailJobPage: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/MailJob' } },
      nextCursor: { type: 'string' },
    },
  },
  Job: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      spaceId: { type: 'string' },
      type: { type: 'string' },
      status: { type: 'string' },
      phase: { type: 'string' },
      done: { type: 'integer' },
      total: { type: 'integer' },
      attempt: { type: 'integer' },
      nextRunAt: { type: 'string' },
      outcome: { type: 'string' },
      traceId: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  JobPage: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/Job' } },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
    },
  },
  Certificate: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      status: { type: 'string' },
      issuer: { type: 'string' },
      notBefore: { type: 'string' },
      notAfter: { type: 'string' },
      checkedAt: { type: 'string' },
      error: { type: 'string' },
    },
  },
  AuditItem: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      eventId: { type: 'string' },
      rootId: { type: 'string' },
      time: { type: 'string' },
      kind: { type: 'string' },
      actorType: { type: 'string' },
      actorId: { type: 'string' },
      actorName: { type: 'string' },
      action: { type: 'string' },
      targetType: { type: 'string' },
      targetId: { type: 'string' },
      outcome: { type: 'string' },
      ip: { type: 'string' },
      requestId: { type: 'string' },
      credentialId: { type: 'string' },
    },
  },
  AuditPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/AuditItem' },
      },
      nextCursor: { type: 'integer' },
      total: { type: 'integer' },
    },
  },
  TokenPage: {
    type: 'object',
    properties: {
      tokens: {
        type: 'array',
        items: { $ref: '#/components/schemas/TokenView' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
    },
  },
  TokenView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      ownerId: { type: 'string' },
      tenantId: { type: 'string' },
      spaceId: { type: 'string' },
      role: { type: 'string' },
      scopes: { type: 'array', items: { type: 'string' } },
      expiry: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  TeamPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TeamView' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  TeamMemberPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TeamMemberSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  TeamMemberSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      avatar: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      joinedAt: { type: 'string' },
    },
  },
  TeamInvitationPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TeamInvitationSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  TagCount: {
    type: 'object',
    properties: { label: { type: 'string' }, pageCount: { type: 'integer' } },
  },
  TagPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TagCount' },
      },
      nextCursor: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  TaggedPage: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      spaceId: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      icon: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      driftFlag: { type: 'boolean' },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string' },
      publishedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  TaggedPagePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TaggedPage' },
      },
      nextCursor: { type: 'string' },
    },
  },
  SpacePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/SpaceSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: ['allowedActions', 'items', 'nextCursor', 'total'],
  },
  SpaceSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      icon: { type: ['string', 'null'] },
      mode: { type: 'string' },
      status: { type: 'string' },
      pageCount: { type: 'integer' },
      driftCount: { type: 'integer' },
      lastReleaseAt: { type: ['string', 'null'] },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      collectionId: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'allowedActions',
      'collectionId',
      'createdAt',
      'createdBy',
      'driftCount',
      'icon',
      'id',
      'lastReleaseAt',
      'mode',
      'name',
      'pageCount',
      'status',
      'tenantId',
      'updatedAt',
      'updatedBy',
    ],
  },
  TerminationPlan: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      resourceId: { type: 'string' },
      validationLevel: { type: 'string' },
      observedAt: { type: 'string' },
      counts: { type: 'object' },
      effects: { type: 'array', items: { type: 'string' } },
      unknowns: { type: 'array', items: { type: 'string' } },
    },
  },
  TrashItem: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      trashedAt: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  TrashPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TrashItem' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  ReleasePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/ReleaseSummary' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  ReleaseSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      status: { type: 'string' },
      source: { $ref: '#/components/schemas/ReleaseSource' },
      pageCount: { type: 'integer' },
      createdAt: { type: 'string' },
      promotedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  ReleaseDelta: {
    type: 'object',
    properties: {
      added: { type: 'array', items: { type: 'string' } },
      changed: { type: 'array', items: { type: 'string' } },
      removed: { type: 'array', items: { type: 'string' } },
    },
  },
  SnapshotPreviewPage: {
    type: 'object',
    properties: {
      pageId: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
    },
  },
  SnapshotPreviewPages: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/SnapshotPreviewPage' },
      },
    },
  },
  ContentTypeSnapshot: {
    type: 'object',
    properties: {
      versionRef: { type: 'string' },
      digest: { type: 'string' },
      definition: { $ref: '#/components/schemas/ContentTypeDefinition' },
    },
  },
  SnapshotPreview: {
    type: 'object',
    properties: {
      html: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      format: { type: 'string' },
      content: { type: 'string' },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
      contentTypeDefinition: {
        $ref: '#/components/schemas/ContentTypeSnapshot',
      },
    },
  },
  GrantPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/GrantView' },
      },
      nextCursor: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PrincipalPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PrincipalView' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PagePermissionSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      restrictionActive: { type: 'boolean' },
      restrictionCount: { type: 'integer' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PermissionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PagePermissionSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PagePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PageSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  ActorView: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      displayName: { type: 'string' },
      status: { type: 'string' },
    },
  },
  RevisionEntry: {
    type: 'object',
    properties: {
      n: { type: 'integer' },
      actor: { $ref: '#/components/schemas/ActorView' },
      createdAt: { type: 'string' },
      note: { type: ['string', 'null'] },
      sizeBytes: { type: 'integer' },
      sizeDelta: { type: 'integer' },
    },
  },
  RevisionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/RevisionEntry' },
      },
      nextCursor: { type: 'string' },
    },
  },
  DiffHunkResponse: {
    type: 'object',
    properties: {
      oldStart: { type: 'integer' },
      oldLines: { type: 'integer' },
      newStart: { type: 'integer' },
      newLines: { type: 'integer' },
      lines: {
        type: 'array',
        items: { $ref: '#/components/schemas/DiffLineResponse' },
      },
    },
  },
  DiffLineResponse: {
    type: 'object',
    properties: { type: { type: 'string' }, content: { type: 'string' } },
  },
  RevisionDiff: {
    type: 'object',
    properties: {
      from: { type: 'integer' },
      to: { type: 'integer' },
      hunks: {
        type: 'array',
        items: { $ref: '#/components/schemas/DiffHunkResponse' },
      },
    },
  },
  RevisionDetail: {
    type: 'object',
    properties: {
      n: { type: 'integer' },
      actor: { $ref: '#/components/schemas/ActorView' },
      createdAt: { type: 'string' },
      note: { type: ['string', 'null'] },
      sizeBytes: { type: 'integer' },
      sizeDelta: { type: 'integer' },
      content: { type: 'string' },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
    },
  },
  DecisionTraceView: {
    type: 'object',
    properties: {
      resource: { $ref: '#/components/schemas/ResourceView' },
      subjectGrants: {
        type: 'array',
        items: { $ref: '#/components/schemas/EffectiveGrantView' },
      },
      restrictionActive: { type: 'boolean' },
      restrictionRevision: { type: 'integer' },
      restrictionMatches: { type: 'array', items: { type: 'string' } },
      restrictionSatisfied: { type: 'boolean' },
      decisive: { type: 'boolean' },
    },
  },
  EffectiveGrantView: {
    type: 'object',
    properties: {
      resource: { $ref: '#/components/schemas/ResourceView' },
      principalKey: { type: 'string' },
      role: { type: 'string' },
    },
  },
  EffectivePermissionView: {
    type: 'object',
    properties: {
      principal: { $ref: '#/components/schemas/PrincipalView' },
      allowed: { type: 'boolean' },
      reason: { type: 'string' },
      effectiveOperations: { type: 'array', items: { type: 'string' } },
      matchedLayer: { $ref: '#/components/schemas/ResourceView' },
      matchedGrants: {
        type: 'array',
        items: { $ref: '#/components/schemas/EffectiveGrantView' },
      },
      trace: {
        type: 'array',
        items: { $ref: '#/components/schemas/DecisionTraceView' },
      },
    },
  },
  AttachmentLink: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      expiresAt: { type: ['string', 'null'] },
      filename: { type: 'string' },
      mime: { type: 'string' },
      sizeBytes: { type: 'integer' },
    },
  },
  BundleExportPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/BundleExportJob' },
      },
      nextCursor: { type: 'string' },
    },
  },
  DriftBoard: {
    type: 'object',
    properties: {
      driftCount: { type: 'integer' },
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/DriftItem' },
      },
    },
  },
  DriftItem: {
    type: 'object',
    properties: {
      pageId: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
      externalId: { type: 'string' },
    },
  },
  AttachmentPageResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/SpaceAttachmentResponse' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  SpaceAttachmentResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      pageId: { type: 'string' },
      pageTitle: { type: 'string' },
      filename: { type: 'string' },
      mime: { type: 'string' },
      sizeBytes: { type: 'integer' },
      createdAt: { type: 'string' },
    },
  },
  SitePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/SiteSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: ['allowedActions', 'items', 'nextCursor', 'total'],
  },
  SiteSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      rule: { type: 'string' },
      home: { type: ['string', 'null'] },
      robotsPolicy: { type: 'string' },
      domains: {
        type: 'array',
        items: { $ref: '#/components/schemas/SiteDomain' },
      },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'allowedActions',
      'createdAt',
      'createdBy',
      'domains',
      'home',
      'id',
      'name',
      'robotsPolicy',
      'rule',
      'tenantId',
      'updatedAt',
      'updatedBy',
    ],
  },
  RedirectPageResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/RedirectResponse' },
      },
      nextCursor: { type: 'string' },
    },
  },
  RedirectResponse: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      targetId: { type: 'string' },
      targetType: { type: 'string' },
      origin: { type: 'string' },
      createdAt: { type: 'string' },
      hitCount: { type: 'integer' },
      currentPath: { type: 'string' },
      targetLabel: { type: 'string' },
      reachable: { type: 'boolean' },
    },
  },
  Current: {
    type: 'object',
    properties: {
      epoch: { type: 'integer' },
      primaryHost: { type: ['string', 'null'] },
      readerHref: { type: ['string', 'null'] },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/OnlineSpace' },
      },
      readable: { type: 'boolean' },
      searchStatus: { type: ['string', 'null'] },
    },
  },
  Desired: {
    type: 'object',
    properties: {
      epoch: { type: 'integer' },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/OnlineSpace' },
      },
    },
  },
  OnlineSpace: {
    type: 'object',
    properties: {
      spaceId: { type: 'string' },
      slug: { type: 'string' },
      releaseId: { type: ['string', 'null'] },
      readerHref: { type: ['string', 'null'] },
    },
  },
  Status: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      status: { type: 'string' },
      targetEpoch: { type: 'integer' },
      onlineEpoch: { type: ['integer', 'null'] },
      primaryHost: { type: ['string', 'null'] },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/OnlineSpace' },
      },
      error: { type: ['string', 'null'] },
      canRetry: { type: 'boolean' },
      searchStatus: { type: ['string', 'null'] },
      desired: {
        anyOf: [{ $ref: '#/components/schemas/Desired' }, { type: 'null' }],
      },
      current: {
        anyOf: [{ $ref: '#/components/schemas/Current' }, { type: 'null' }],
      },
      terminal: { type: 'boolean' },
      successful: { type: 'boolean' },
      nextPollAfterSeconds: { type: 'integer' },
    },
    required: ['enabled', 'status', 'successful', 'targetEpoch', 'terminal'],
  },
  ReleaseSpaceChoice: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      mode: { type: 'string' },
      status: { type: 'string' },
    },
  },
  TenantReleasePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TenantReleaseSummary' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/ReleaseSpaceChoice' },
      },
    },
  },
  TenantReleaseSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      status: { type: 'string' },
      source: { $ref: '#/components/schemas/ReleaseSource' },
      pageCount: { type: 'integer' },
      createdAt: { type: 'string' },
      promotedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
      spaceId: { type: 'string' },
      spaceName: { type: 'string' },
      spaceMode: { type: 'string' },
      spaceStatus: { type: 'string' },
    },
  },
  VerificationList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/VerificationSummary' },
      },
    },
  },
  VerificationSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      candidateId: { type: 'string' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      fixtureDigest: { type: 'string' },
      environment: { type: 'string' },
      browserPassed: { type: 'boolean' },
      serverPassed: { type: 'boolean' },
      productionEligible: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  },
  DevelopmentList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/DevelopmentSummary' },
      },
    },
  },
  DevelopmentSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      contentType: { type: 'string' },
      revision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  },
  CandidateList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/CandidateSummary' },
      },
    },
  },
  CandidateSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      sourceRevision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      entryPoint: { type: 'string' },
      environment: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  Capabilities: {
    type: 'object',
    properties: {
      audit: { type: 'boolean' },
      webhooks: { type: 'boolean' },
      tenantStats: { type: 'boolean' },
      spaces: { type: 'array', items: { $ref: '#/components/schemas/Choice' } },
      sites: { type: 'array', items: { $ref: '#/components/schemas/Choice' } },
    },
  },
  Choice: {
    type: 'object',
    properties: { id: { type: 'string' }, name: { type: 'string' } },
  },
  TenantMemberPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TenantMemberSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  TenantMemberSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string' },
      joinedAt: { type: 'string' },
    },
  },
  TenantInvitationPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TenantInvitationSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  DomainSiteChoice: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: ['allowedActions', 'id', 'name'],
  },
  TenantDomainPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/TenantDomainSummary' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
      sites: {
        type: 'array',
        items: { $ref: '#/components/schemas/DomainSiteChoice' },
      },
    },
    required: ['items', 'sites'],
  },
  TenantDomainSummary: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      verified: { type: 'boolean' },
      isPrimary: { type: 'boolean' },
      createdAt: { type: 'string' },
      siteId: { type: 'string' },
      siteName: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'allowedActions',
      'createdAt',
      'host',
      'isPrimary',
      'siteId',
      'siteName',
      'verified',
    ],
  },
  Deletion: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      resourceType: { type: 'string' },
      resourceId: { type: 'string' },
      status: { type: 'string' },
      error: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  DeletionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/Deletion' },
      },
      nextCursor: { type: 'string' },
    },
  },
  TypeList: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/State' } },
      canManage: { type: 'boolean' },
    },
  },
  VersionList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/VersionSummary' },
      },
    },
  },
  VersionSummary: {
    type: 'object',
    properties: {
      versionRef: { type: 'string' },
      contentType: { type: 'string' },
      version: { type: 'string' },
      digest: { type: 'string' },
      createdAt: { type: ['string', 'null'] },
    },
  },
  Catalog: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/Descriptor' },
      },
      productionLoading: { type: 'string' },
      canDevelop: { type: 'boolean' },
    },
  },
  Descriptor: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      version: { type: 'string' },
      contentTypes: { type: 'array', items: { type: 'string' } },
      formats: { type: 'array', items: { type: 'string' } },
      capabilities: { type: 'array', items: { type: 'string' } },
      trusted: { type: 'boolean' },
    },
  },
  Device: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      browser: { type: 'string' },
      os: { type: 'string' },
    },
  },
  SessionView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      device: { $ref: '#/components/schemas/Device' },
      ipApproximate: { type: 'string' },
      createdAt: { type: 'string' },
      lastSeenAt: { type: 'string' },
      expiresAt: { type: 'string' },
      current: { type: 'boolean' },
    },
  },
  Sessions: {
    type: 'object',
    properties: {
      sessions: {
        type: 'array',
        items: { $ref: '#/components/schemas/SessionView' },
      },
      nextCursor: { type: 'string' },
    },
  },
  ManagementTokenPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/ManagementTokenView' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  InvitePreview: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      tenant: { $ref: '#/components/schemas/InviteGroup' },
      team: { $ref: '#/components/schemas/InviteGroup' },
      email: { type: 'string' },
      role: { type: 'string' },
      expiresAt: { type: 'string' },
    },
  },
  ManagementAuthenticationContext: {
    type: 'object',
    properties: {
      credentialType: { type: 'string' },
      actorId: { type: 'string' },
      credentialId: { type: ['string', 'null'] },
      scopes: { type: 'array', items: { type: 'string' } },
      tenantId: { type: ['string', 'null'] },
      expiry: { type: ['string', 'null'] },
    },
  },
  UserPage: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: { $ref: '#/components/schemas/UserSummary' },
      },
      nextCursor: { type: 'string' },
    },
  },
  UserSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
      platformOperator: { type: 'boolean' },
      updatedAt: { type: 'string' },
    },
  },
  MembershipSummary: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string' },
      soleOwner: { type: 'boolean' },
    },
  },
  UserDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      avatar: { type: 'string' },
      locale: { type: 'string' },
      verified: { type: 'boolean' },
      status: { type: 'string' },
      platformOperator: { type: 'boolean' },
      memberships: {
        type: 'array',
        items: { $ref: '#/components/schemas/MembershipSummary' },
      },
    },
  },
  Tenants: {
    type: 'object',
    properties: {
      tenants: {
        type: 'array',
        items: { $ref: '#/components/schemas/TenantView' },
      },
      nextCursor: { type: 'string' },
    },
  },
  HealthInstance: {
    type: 'object',
    properties: {
      instance: { type: 'string' },
      version: { type: 'string' },
      seenAt: { type: 'string' },
      status: { type: 'string' },
      details: { type: 'object' },
    },
  },
  HealthReport: {
    type: 'object',
    properties: {
      checkedAt: { type: 'string' },
      services: {
        type: 'array',
        items: { $ref: '#/components/schemas/HealthService' },
      },
    },
  },
  HealthService: {
    type: 'object',
    properties: {
      service: { type: 'string' },
      status: { type: 'string' },
      instances: {
        type: 'array',
        items: { $ref: '#/components/schemas/HealthInstance' },
      },
      details: { type: 'object' },
    },
  },
  Confirmation: {
    type: 'object',
    properties: { confirmationName: { type: 'string' } },
    required: ['confirmationName'],
  },
  Removed: { type: 'object', properties: { id: { type: 'string' } } },
  PartialContentSnapshot: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      format: { type: 'string' },
      content: { type: 'string' },
      revision: { type: 'integer' },
      contentType: { type: 'string' },
      versionRef: { type: ['string', 'null'] },
      interpretation: { type: 'object' },
    },
  },
  PartialConfiguration: {
    type: 'object',
    properties: {
      fields: { type: 'array', items: { type: 'string' } },
      revision: { type: 'integer' },
    },
  },
  PartialDevelopment: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      contentType: { type: 'string' },
      revision: { type: 'integer' },
      source: { $ref: '#/components/schemas/PartialSource' },
      sourceDigest: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  },
  PartialSource: {
    type: 'object',
    properties: {
      files: { type: 'object' },
      manifest: { type: 'string' },
      configuration: { type: 'string' },
      fixtures: { type: 'string' },
      dependencyLock: { type: 'string' },
      baselineRef: { type: 'string' },
    },
  },
  PartialSubscriptionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSubscription' },
      },
      nextCursor: { type: 'string' },
      eventTypes: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialSubscription: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      url: { type: 'string' },
      scopeType: { type: 'string' },
      scopeId: { type: 'string' },
      events: { type: 'array', items: { type: 'string' } },
      active: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  },
  PartialTeamPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTeamView' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialTeamView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      callerRole: { type: 'string' },
      memberCount: { type: 'integer' },
      ownerCount: { type: 'integer' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  },
  PartialTeamInvitationPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTeamInvitationSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialTeamInvitationSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      expiresAt: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  PartialSpacePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSpaceSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialSpaceSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      icon: { type: ['string', 'null'] },
      mode: { type: 'string' },
      status: { type: 'string' },
      pageCount: { type: 'integer' },
      driftCount: { type: 'integer' },
      lastReleaseAt: { type: ['string', 'null'] },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      collectionId: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialTocView: {
    type: 'object',
    properties: {
      entries: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTocEntry' },
      },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialTocEntry: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      parentId: { type: 'string' },
      position: { type: 'integer' },
      label: { type: 'string' },
      kind: { type: 'string' },
      targetId: { type: 'string' },
      url: { type: 'string' },
      depth: { type: 'integer' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTocEntry' },
      },
    },
  },
  PartialPagePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialPageSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialPageSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      icon: { type: ['string', 'null'] },
      tags: { type: 'array', items: { type: 'string' } },
      driftFlag: { type: 'boolean' },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string' },
      publishedAt: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
    },
  },
  PartialSitePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSiteSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialSiteSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      rule: { type: 'string' },
      home: { type: ['string', 'null'] },
      robotsPolicy: { type: 'string' },
      domains: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSiteDomain' },
      },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialSiteDomain: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      verified: { type: 'boolean' },
      isPrimary: { type: 'boolean' },
    },
  },
  PartialRedirectPageResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRedirectResponse' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialRedirectResponse: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      targetId: { type: 'string' },
      targetType: { type: 'string' },
      origin: { type: 'string' },
      createdAt: { type: 'string' },
      hitCount: { type: 'integer' },
      currentPath: { type: 'string' },
      targetLabel: { type: 'string' },
      reachable: { type: 'boolean' },
    },
  },
  PartialVerificationList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialVerificationSummary' },
      },
    },
  },
  PartialVerificationSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      candidateId: { type: 'string' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      fixtureDigest: { type: 'string' },
      environment: { type: 'string' },
      browserPassed: { type: 'boolean' },
      serverPassed: { type: 'boolean' },
      productionEligible: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  },
  PartialDevelopmentList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDevelopmentSummary' },
      },
    },
  },
  PartialDevelopmentSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      contentType: { type: 'string' },
      revision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  },
  PartialCandidateList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialCandidateSummary' },
      },
    },
  },
  PartialCandidateSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      sourceRevision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      entryPoint: { type: 'string' },
      environment: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  PartialTenantInvitationPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTenantInvitationSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialTenantInvitationSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      expiresAt: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  PartialVersionList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialVersionSummary' },
      },
    },
  },
  PartialVersionSummary: {
    type: 'object',
    properties: {
      versionRef: { type: 'string' },
      contentType: { type: 'string' },
      version: { type: 'string' },
      digest: { type: 'string' },
      createdAt: { type: ['string', 'null'] },
    },
  },
  PartialCollectionView: {
    type: 'object',
    properties: {
      collections: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialCollectionNode' },
      },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialCollectionNode: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      parentId: { type: 'string' },
      position: { type: 'integer' },
      name: { type: 'string' },
      icon: { type: 'string' },
      depth: { type: 'integer' },
      spaceCount: { type: 'integer' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialCollectionNode' },
      },
    },
  },
  PartialTenants: {
    type: 'object',
    properties: {
      tenants: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTenantView' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialTenantView: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
      ownerCount: { type: 'integer' },
      createdAt: { type: 'string' },
    },
  },
  PartialSpaceDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      icon: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      mode: { type: 'string' },
      status: { type: 'string' },
      pageCount: { type: 'integer' },
      driftCount: { type: 'integer' },
      lastReleaseAt: { type: ['string', 'null'] },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      collectionId: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
      collectionPath: { type: 'array', items: { type: 'string' } },
      mounts: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSpaceMount' },
      },
      retention: { type: 'integer' },
      autoRelease: { type: ['boolean', 'null'] },
    },
  },
  PartialSpaceMount: {
    type: 'object',
    properties: { siteId: { type: 'string' }, slug: { type: 'string' } },
  },
  PartialReleaseDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      status: { type: 'string' },
      source: { $ref: '#/components/schemas/PartialReleaseSource' },
      pageCount: { type: 'integer' },
      createdAt: { type: 'string' },
      promotedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string' },
      report: { $ref: '#/components/schemas/PartialReportView' },
      diffSummary: { $ref: '#/components/schemas/PartialDiffSummary' },
      size: { type: 'integer' },
    },
  },
  PartialReleaseSource: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      ref: { type: 'string' },
      actor: { type: 'string' },
    },
  },
  PartialReportView: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialIssueView' },
      },
      warnings: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialIssueView' },
      },
      info: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialIssueView' },
      },
    },
  },
  PartialIssueView: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      path: { type: 'string' },
      pageId: { type: 'string' },
      detail: { type: 'string' },
    },
  },
  PartialDiffSummary: {
    type: 'object',
    properties: {
      added: { type: 'integer' },
      changed: { type: 'integer' },
      removed: { type: 'integer' },
    },
  },
  PartialPageDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      icon: { type: ['string', 'null'] },
      tags: { type: 'array', items: { type: 'string' } },
      driftFlag: { type: 'boolean' },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string' },
      publishedAt: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
      content: { type: 'string' },
      revision: { type: 'integer' },
      seo: { $ref: '#/components/schemas/PartialSeo' },
      properties: { type: 'object' },
      attachments: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialAttachment' },
      },
      trashedAt: { type: ['string', 'null'] },
      revisionCount: { type: 'integer' },
      wordCount: { type: 'integer' },
      readingTime: { type: 'integer' },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
    },
  },
  PartialSeo: {
    type: 'object',
    properties: {
      title: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      keywords: { type: ['string', 'null'] },
      ogImage: { type: ['string', 'null'] },
      noIndex: { type: 'boolean' },
    },
  },
  PartialAttachment: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      filename: { type: 'string' },
      mime: { type: 'string' },
      sizeBytes: { type: 'integer' },
      contentPath: { type: 'string' },
    },
  },
  PartialSiteDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      rule: { type: 'string' },
      home: { type: ['string', 'null'] },
      robotsPolicy: { type: 'string' },
      titleTemplate: { type: ['string', 'null'] },
      branding: { $ref: '#/components/schemas/PartialSiteBranding' },
      locale: { type: ['string', 'null'] },
      analyticsId: { type: ['string', 'null'] },
      mounts: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSiteMount' },
      },
      domains: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSiteDomain' },
      },
      createdAt: { type: 'string' },
      createdBy: { type: ['string', 'null'] },
      updatedAt: { type: 'string' },
      updatedBy: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialSiteBranding: {
    type: 'object',
    properties: {
      logo: { type: ['string', 'null'] },
      favicon: { type: ['string', 'null'] },
      primaryColor: { type: ['string', 'null'] },
    },
  },
  PartialSiteMount: {
    type: 'object',
    properties: { spaceId: { type: 'string' }, slug: { type: 'string' } },
  },
  PartialDeliveryPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDelivery' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialDelivery: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      eventId: { type: 'string' },
      eventType: { type: 'string' },
      status: { type: 'string' },
      attempts: { type: 'integer' },
      nextRunAt: { type: 'string' },
      responseCode: { type: 'integer' },
      createdAt: { type: 'string' },
      history: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialAttempt' },
      },
    },
  },
  PartialAttempt: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      startedAt: { type: 'string' },
      responseCode: { type: 'integer' },
      error: { type: 'string' },
      durationMs: { type: 'integer' },
    },
  },
  PartialUsage: {
    type: 'object',
    properties: {
      workingPages: { type: 'integer' },
      trashedPages: { type: 'integer' },
      publishedPages: { type: 'integer' },
      workingTextBytes: { type: 'integer' },
      trashedTextBytes: { type: 'integer' },
      attachmentCount: { type: 'integer' },
      attachmentBytes: { type: 'integer' },
      releases: { type: 'integer' },
      snapshotPages: { type: 'integer' },
      snapshotTextBytes: { type: 'integer' },
      promotions: { type: 'integer' },
      activeAuthors: { type: 'integer' },
      imports: { type: 'object' },
      computedAt: { type: 'string' },
    },
  },
  PartialTraffic: {
    type: 'object',
    properties: {
      pv: { type: 'integer' },
      series: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialBucket' },
      },
      pages: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRanked' },
      },
      notFound: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRanked' },
      },
      referrers: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRanked' },
      },
      health: { $ref: '#/components/schemas/PartialHealth' },
    },
  },
  PartialBucket: {
    type: 'object',
    properties: {
      time: { type: 'string' },
      pv: { type: 'integer' },
      uv: { type: 'integer' },
    },
  },
  PartialRanked: {
    type: 'object',
    properties: { label: { type: 'string' }, count: { type: 'integer' } },
  },
  PartialHealth: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      updatedAt: { type: 'string' },
      lossDetected: { type: 'boolean' },
      staleSources: { type: 'integer' },
      retainedFrom: { type: 'string' },
    },
  },
  PartialSearch: {
    type: 'object',
    properties: {
      searches: { type: 'integer' },
      observable: { type: 'integer' },
      clicked: { type: 'integer' },
      clickRate: { type: 'number' },
      popular: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRanked' },
      },
      zeroResults: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRanked' },
      },
      health: { $ref: '#/components/schemas/PartialHealth' },
    },
  },
  PartialProbeResponse: {
    type: 'object',
    properties: { status: { type: 'string' } },
  },
  PartialStorageUsage: {
    type: 'object',
    properties: {
      sourceObjects: { type: 'integer' },
      sourceBytes: { type: 'integer' },
      measuredAt: { type: 'string' },
      databaseBytes: { type: 'integer' },
      failedSourceObjects: { type: 'integer' },
    },
  },
  PartialMailJobPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialMailJob' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialMailJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      kind: { type: 'string' },
      recipient: { type: 'string' },
      tenantId: { type: 'string' },
      status: { type: 'string' },
      attempt: { type: 'integer' },
      nextRunAt: { type: 'string' },
      error: { type: 'string' },
      traceId: { type: 'string' },
      outcome: { type: 'string' },
      createdAt: { type: 'string' },
      completedAt: { type: 'string' },
      canRetry: { type: 'boolean' },
    },
  },
  PartialJobPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialJob' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
    },
  },
  PartialJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      tenantId: { type: 'string' },
      spaceId: { type: 'string' },
      type: { type: 'string' },
      status: { type: 'string' },
      phase: { type: 'string' },
      done: { type: 'integer' },
      total: { type: 'integer' },
      attempt: { type: 'integer' },
      nextRunAt: { type: 'string' },
      outcome: { type: 'string' },
      traceId: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialCertificate: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      status: { type: 'string' },
      issuer: { type: 'string' },
      notBefore: { type: 'string' },
      notAfter: { type: 'string' },
      checkedAt: { type: 'string' },
      error: { type: 'string' },
    },
  },
  PartialAuditPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialAuditItem' },
      },
      nextCursor: { type: 'integer' },
      total: { type: 'integer' },
    },
  },
  PartialAuditItem: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      eventId: { type: 'string' },
      rootId: { type: 'string' },
      time: { type: 'string' },
      kind: { type: 'string' },
      actorType: { type: 'string' },
      actorId: { type: 'string' },
      actorName: { type: 'string' },
      action: { type: 'string' },
      targetType: { type: 'string' },
      targetId: { type: 'string' },
      outcome: { type: 'string' },
      ip: { type: 'string' },
      requestId: { type: 'string' },
      credentialId: { type: 'string' },
    },
  },
  PartialExportStatus: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
      error: { type: 'string' },
      expiresAt: { type: 'string' },
    },
  },
  PartialTeamMemberPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTeamMemberSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialTeamMemberSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      avatar: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
      joinedAt: { type: 'string' },
    },
  },
  PartialTagPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTagCount' },
      },
      nextCursor: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialTagCount: {
    type: 'object',
    properties: { label: { type: 'string' }, pageCount: { type: 'integer' } },
  },
  PartialTaggedPagePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTaggedPage' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialTaggedPage: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      spaceId: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      icon: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      driftFlag: { type: 'boolean' },
      updatedAt: { type: 'string' },
      updatedBy: { type: 'string' },
      publishedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialTerminationPlan: {
    type: 'object',
    properties: {
      resourceType: { type: 'string' },
      resourceId: { type: 'string' },
      validationLevel: { type: 'string' },
      observedAt: { type: 'string' },
      counts: { type: 'object' },
      effects: { type: 'array', items: { type: 'string' } },
      unknowns: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialTrashPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTrashItem' },
      },
      nextCursor: { type: ['string', 'null'] },
      total: { type: ['integer', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialTrashItem: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      status: { type: 'string' },
      format: { type: 'string' },
      trashedAt: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialReleasePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialReleaseSummary' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialReleaseSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      status: { type: 'string' },
      source: { $ref: '#/components/schemas/PartialReleaseSource' },
      pageCount: { type: 'integer' },
      createdAt: { type: 'string' },
      promotedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialReleaseDelta: {
    type: 'object',
    properties: {
      added: { type: 'array', items: { type: 'string' } },
      changed: { type: 'array', items: { type: 'string' } },
      removed: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialSnapshotPreviewPages: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSnapshotPreviewPage' },
      },
    },
  },
  PartialSnapshotPreviewPage: {
    type: 'object',
    properties: {
      pageId: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
    },
  },
  PartialSnapshotPreview: {
    type: 'object',
    properties: {
      html: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      format: { type: 'string' },
      content: { type: 'string' },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
      contentTypeDefinition: {
        $ref: '#/components/schemas/PartialContentTypeSnapshot',
      },
    },
  },
  PartialContentTypeSnapshot: {
    type: 'object',
    properties: {
      versionRef: { type: 'string' },
      digest: { type: 'string' },
      definition: { $ref: '#/components/schemas/PartialContentTypeDefinition' },
    },
  },
  PartialContentTypeDefinition: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      version: { type: 'string' },
      label: { type: 'string' },
      format: { type: 'string' },
      mediaType: { type: 'string' },
      language: { type: 'string' },
      renderHost: { type: 'string' },
      defaultInterpretation: { type: 'object' },
      validation: {
        oneOf: [{ $ref: '#/components/schemas/Validation' }, { type: 'null' }],
      },
      schemaResources: { type: 'object' },
      editors: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialContribution' },
      },
      renderers: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialContribution' },
      },
    },
  },
  PartialContribution: {
    type: 'object',
    properties: {
      pluginId: { type: 'string' },
      pluginVersion: { type: 'string' },
      contributionId: { type: 'string' },
      config: { type: 'object' },
    },
  },
  PartialGrantPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialGrantView' },
      },
      nextCursor: { type: ['string', 'null'] },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialGrantView: {
    type: 'object',
    properties: {
      resource: { $ref: '#/components/schemas/PartialResourceView' },
      principal: { $ref: '#/components/schemas/PartialPrincipalView' },
      role: { type: 'string' },
      operations: { type: 'array', items: { type: 'string' } },
      editable: { type: 'boolean' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialResourceView: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      source: { type: 'string' },
    },
  },
  PartialPrincipalView: {
    type: 'object',
    properties: {
      key: { type: 'string' },
      type: { type: 'string' },
      id: { type: ['string', 'null'] },
      name: { type: 'string' },
      status: { type: 'string' },
      email: { type: ['string', 'null'] },
      avatar: { type: ['string', 'null'] },
      memberCount: { type: ['integer', 'null'] },
    },
  },
  PartialPrincipalPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialPrincipalView' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialPermissionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialPagePermissionSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialPagePermissionSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      slug: { type: 'string' },
      restrictionActive: { type: 'boolean' },
      restrictionCount: { type: 'integer' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialRevisionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialRevisionEntry' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialRevisionEntry: {
    type: 'object',
    properties: {
      n: { type: 'integer' },
      actor: { $ref: '#/components/schemas/PartialActorView' },
      createdAt: { type: 'string' },
      note: { type: ['string', 'null'] },
      sizeBytes: { type: 'integer' },
      sizeDelta: { type: 'integer' },
    },
  },
  PartialActorView: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      displayName: { type: 'string' },
      status: { type: 'string' },
    },
  },
  PartialRevisionDiff: {
    type: 'object',
    properties: {
      from: { type: 'integer' },
      to: { type: 'integer' },
      hunks: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDiffHunkResponse' },
      },
    },
  },
  PartialDiffHunkResponse: {
    type: 'object',
    properties: {
      oldStart: { type: 'integer' },
      oldLines: { type: 'integer' },
      newStart: { type: 'integer' },
      newLines: { type: 'integer' },
      lines: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDiffLineResponse' },
      },
    },
  },
  PartialDiffLineResponse: {
    type: 'object',
    properties: { type: { type: 'string' }, content: { type: 'string' } },
  },
  PartialRevisionDetail: {
    type: 'object',
    properties: {
      n: { type: 'integer' },
      actor: { $ref: '#/components/schemas/PartialActorView' },
      createdAt: { type: 'string' },
      note: { type: ['string', 'null'] },
      sizeBytes: { type: 'integer' },
      sizeDelta: { type: 'integer' },
      content: { type: 'string' },
      contentType: { type: 'string' },
      versionRef: { type: 'string' },
      interpretation: { type: 'object' },
    },
  },
  PartialPagePermissionView: {
    type: 'object',
    properties: {
      pageId: { type: 'string' },
      restriction: { $ref: '#/components/schemas/PartialRestrictionView' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialRestrictionView: {
    type: 'object',
    properties: {
      active: { type: 'boolean' },
      principals: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialPrincipalView' },
      },
      revision: { type: 'integer' },
    },
  },
  PartialEffectivePermissionView: {
    type: 'object',
    properties: {
      principal: { $ref: '#/components/schemas/PartialPrincipalView' },
      allowed: { type: 'boolean' },
      reason: { type: 'string' },
      effectiveOperations: { type: 'array', items: { type: 'string' } },
      matchedLayer: { $ref: '#/components/schemas/PartialResourceView' },
      matchedGrants: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialEffectiveGrantView' },
      },
      trace: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDecisionTraceView' },
      },
    },
  },
  PartialEffectiveGrantView: {
    type: 'object',
    properties: {
      resource: { $ref: '#/components/schemas/PartialResourceView' },
      principalKey: { type: 'string' },
      role: { type: 'string' },
    },
  },
  PartialDecisionTraceView: {
    type: 'object',
    properties: {
      resource: { $ref: '#/components/schemas/PartialResourceView' },
      subjectGrants: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialEffectiveGrantView' },
      },
      restrictionActive: { type: 'boolean' },
      restrictionRevision: { type: 'integer' },
      restrictionMatches: { type: 'array', items: { type: 'string' } },
      restrictionSatisfied: { type: 'boolean' },
      decisive: { type: 'boolean' },
    },
  },
  PartialAttachmentLink: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      expiresAt: { type: ['string', 'null'] },
      filename: { type: 'string' },
      mime: { type: 'string' },
      sizeBytes: { type: 'integer' },
    },
  },
  PartialImportJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
      phase: { type: 'string' },
      progress: { $ref: '#/components/schemas/PartialImportJobProgress' },
      attempt: { type: 'integer' },
      nextRunAt: { type: ['string', 'null'] },
      traceId: { type: 'string' },
      outcome: { type: ['string', 'null'] },
      releaseId: { type: ['string', 'null'] },
      sourceUrl: { type: ['string', 'null'] },
      adapterId: { type: ['string', 'null'] },
      report: { $ref: '#/components/schemas/PartialImportJobReport' },
      terminal: { type: 'boolean' },
      successful: { type: 'boolean' },
      nextPollAfterSeconds: { type: ['integer', 'null'] },
    },
  },
  PartialImportJobProgress: {
    type: 'object',
    properties: {
      done: { type: ['integer', 'null'] },
      total: { type: ['integer', 'null'] },
    },
  },
  PartialImportJobReport: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialImportJobIssue' },
      },
      info: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialImportJobIssue' },
      },
    },
  },
  PartialImportJobIssue: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      path: { type: ['string', 'null'] },
      detail: { type: ['string', 'null'] },
    },
  },
  PartialBundleExportPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialBundleExportJob' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialBundleExportJob: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      releaseId: { type: 'string' },
      status: { type: 'string' },
      attempts: { type: 'integer' },
      error: { type: 'string' },
      traceId: { type: 'string' },
      createdAt: { type: 'string' },
      expiresAt: { type: 'string' },
      bytes: { type: 'integer' },
    },
  },
  PartialDriftBoard: {
    type: 'object',
    properties: {
      driftCount: { type: 'integer' },
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDriftItem' },
      },
    },
  },
  PartialDriftItem: {
    type: 'object',
    properties: {
      pageId: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
      externalId: { type: 'string' },
    },
  },
  PartialAttachmentPageResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSpaceAttachmentResponse' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialSpaceAttachmentResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      pageId: { type: 'string' },
      pageTitle: { type: 'string' },
      filename: { type: 'string' },
      mime: { type: 'string' },
      sizeBytes: { type: 'integer' },
      createdAt: { type: 'string' },
    },
  },
  PartialDomainDetail: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      verified: { type: 'boolean' },
      isPrimary: { type: 'boolean' },
      dnsToken: { type: 'string' },
      txtName: { type: 'string' },
      txtValue: { type: 'string' },
    },
  },
  PartialStatus: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      status: { type: 'string' },
      targetEpoch: { type: 'integer' },
      onlineEpoch: { type: ['integer', 'null'] },
      primaryHost: { type: ['string', 'null'] },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialOnlineSpace' },
      },
      error: { type: ['string', 'null'] },
      canRetry: { type: 'boolean' },
      searchStatus: { type: ['string', 'null'] },
      desired: {
        anyOf: [{ $ref: '#/components/schemas/Desired' }, { type: 'null' }],
      },
      current: {
        anyOf: [{ $ref: '#/components/schemas/Current' }, { type: 'null' }],
      },
      terminal: { type: 'boolean' },
      successful: { type: 'boolean' },
      nextPollAfterSeconds: { type: 'integer' },
    },
  },
  PartialOnlineSpace: {
    type: 'object',
    properties: {
      spaceId: { type: 'string' },
      slug: { type: 'string' },
      releaseId: { type: ['string', 'null'] },
      readerHref: { type: ['string', 'null'] },
    },
  },
  PartialTenantReleasePage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTenantReleaseSummary' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialReleaseSpaceChoice' },
      },
    },
  },
  PartialTenantReleaseSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      status: { type: 'string' },
      source: { $ref: '#/components/schemas/PartialReleaseSource' },
      pageCount: { type: 'integer' },
      createdAt: { type: 'string' },
      promotedAt: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
      spaceId: { type: 'string' },
      spaceName: { type: 'string' },
      spaceMode: { type: 'string' },
      spaceStatus: { type: 'string' },
    },
  },
  PartialReleaseSpaceChoice: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      mode: { type: 'string' },
      status: { type: 'string' },
    },
  },
  PartialVerification: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      candidateId: { type: 'string' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      fixtureDigest: { type: 'string' },
      environment: { type: 'string' },
      browserEvidence: { $ref: '#/components/schemas/PartialEvidence' },
      serverValidation: { $ref: '#/components/schemas/PartialEvidence' },
      productionEligible: { type: 'boolean' },
      createdAt: { type: 'string' },
    },
  },
  PartialEvidence: {
    type: 'object',
    properties: {
      passed: { type: 'boolean' },
      checks: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialCheck' },
      },
    },
  },
  PartialCheck: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      passed: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  PartialCandidate: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      developmentId: { type: 'string' },
      sourceRevision: { type: 'integer' },
      sourceDigest: { type: 'string' },
      bundleDigest: { type: 'string' },
      entryPoint: { type: 'string' },
      bundle: { type: 'string' },
      environment: { type: 'string' },
      source: { $ref: '#/components/schemas/PartialSource' },
      createdAt: { type: 'string' },
    },
  },
  PartialCapabilities: {
    type: 'object',
    properties: {
      audit: { type: 'boolean' },
      webhooks: { type: 'boolean' },
      tenantStats: { type: 'boolean' },
      spaces: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialChoice' },
      },
      sites: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialChoice' },
      },
    },
  },
  PartialChoice: {
    type: 'object',
    properties: { id: { type: 'string' }, name: { type: 'string' } },
  },
  PartialTenantMemberPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTenantMemberSummary' },
      },
      nextCursor: { type: ['string', 'null'] },
    },
  },
  PartialTenantMemberSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string' },
      joinedAt: { type: 'string' },
    },
  },
  PartialTenantDomainPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialTenantDomainSummary' },
      },
      nextCursor: { type: 'string' },
      total: { type: 'integer' },
      sites: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDomainSiteChoice' },
      },
    },
  },
  PartialTenantDomainSummary: {
    type: 'object',
    properties: {
      host: { type: 'string' },
      verified: { type: 'boolean' },
      isPrimary: { type: 'boolean' },
      createdAt: { type: 'string' },
      siteId: { type: 'string' },
      siteName: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialDomainSiteChoice: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      allowedActions: { type: 'array', items: { type: 'string' } },
    },
  },
  PartialDeletionPage: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDeletion' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialDeletion: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      resourceType: { type: 'string' },
      resourceId: { type: 'string' },
      status: { type: 'string' },
      error: { type: 'string' },
      createdAt: { type: 'string' },
    },
  },
  PartialTypeList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialState' },
      },
      canManage: { type: 'boolean' },
    },
  },
  PartialState: {
    type: 'object',
    properties: {
      contentType: { type: 'string' },
      enabled: { type: 'boolean' },
      revision: { type: 'integer' },
      activeVersionRef: { type: 'string' },
      label: { type: 'string' },
      format: { type: 'string' },
      mediaType: { type: 'string' },
      builtin: { type: 'boolean' },
    },
  },
  PartialVersion: {
    type: 'object',
    properties: {
      versionRef: { type: 'string' },
      digest: { type: 'string' },
      definition: { $ref: '#/components/schemas/PartialContentTypeDefinition' },
      createdAt: { type: ['string', 'null'] },
    },
  },
  PartialCatalog: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialDescriptor' },
      },
      productionLoading: { type: 'string' },
      canDevelop: { type: 'boolean' },
    },
  },
  PartialDescriptor: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      version: { type: 'string' },
      contentTypes: { type: 'array', items: { type: 'string' } },
      formats: { type: 'array', items: { type: 'string' } },
      capabilities: { type: 'array', items: { type: 'string' } },
      trusted: { type: 'boolean' },
    },
  },
  PartialInvitePreview: {
    type: 'object',
    properties: {
      kind: { type: 'string' },
      tenant: { $ref: '#/components/schemas/PartialInviteGroup' },
      team: { $ref: '#/components/schemas/PartialInviteGroup' },
      email: { type: 'string' },
      role: { type: 'string' },
      expiresAt: { type: 'string' },
    },
  },
  PartialInviteGroup: {
    type: 'object',
    properties: { id: { type: 'string' }, name: { type: 'string' } },
  },
  PartialUserPage: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialUserSummary' },
      },
      nextCursor: { type: 'string' },
    },
  },
  PartialUserSummary: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
      platformOperator: { type: 'boolean' },
      updatedAt: { type: 'string' },
    },
  },
  PartialUserDetail: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      avatar: { type: 'string' },
      locale: { type: 'string' },
      verified: { type: 'boolean' },
      status: { type: 'string' },
      platformOperator: { type: 'boolean' },
      memberships: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialMembershipSummary' },
      },
    },
  },
  PartialMembershipSummary: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      tenantId: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string' },
      soleOwner: { type: 'boolean' },
    },
  },
  PartialHealthReport: {
    type: 'object',
    properties: {
      checkedAt: { type: 'string' },
      services: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialHealthService' },
      },
    },
  },
  PartialHealthService: {
    type: 'object',
    properties: {
      service: { type: 'string' },
      status: { type: 'string' },
      instances: {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialHealthInstance' },
      },
      details: { type: 'object' },
    },
  },
  PartialHealthInstance: {
    type: 'object',
    properties: {
      instance: { type: 'string' },
      version: { type: 'string' },
      seenAt: { type: 'string' },
      status: { type: 'string' },
      details: { type: 'object' },
    },
  },
};
export const responses: Record<string, ResponseShape> = {
  updateWebhook: { $ref: '#/components/schemas/Subscription' },
  setRetention: { $ref: '#/components/schemas/SpaceDetail' },
  putSpaceGrant: { $ref: '#/components/schemas/GrantView' },
  tagPage: { $ref: '#/components/schemas/PageDetail' },
  untagPage: { $ref: '#/components/schemas/PageDetail' },
  setPageProperty: { $ref: '#/components/schemas/PageDetail' },
  removePageProperty: { $ref: '#/components/schemas/PageDetail' },
  putPageRestriction: { $ref: '#/components/schemas/PagePermissionView' },
  deletePageRestriction: { $ref: '#/components/schemas/PagePermissionView' },
  setPageIcon: { $ref: '#/components/schemas/PageDetail' },
  viewPageContent: {
    anyOf: [
      { $ref: '#/components/schemas/ContentSnapshot' },
      { $ref: '#/components/schemas/PartialContentSnapshot' },
    ],
  },
  editPage: { $ref: '#/components/schemas/PageDetail' },
  reorderMountsBySpaceId: { $ref: '#/components/schemas/SiteDetail' },
  searchConfiguration: {
    anyOf: [
      { $ref: '#/components/schemas/Configuration' },
      { $ref: '#/components/schemas/PartialConfiguration' },
    ],
  },
  configureSearch: { $ref: '#/components/schemas/Configuration' },
  putSiteGrant: { $ref: '#/components/schemas/GrantView' },
  reorderMounts: { $ref: '#/components/schemas/SiteDetail' },
  mountSpace: { $ref: '#/components/schemas/SiteDetail' },
  unmountSpace: { $ref: '#/components/schemas/SiteDetail' },
  viewPluginDevelopment: {
    anyOf: [
      { $ref: '#/components/schemas/Development' },
      { $ref: '#/components/schemas/PartialDevelopment' },
    ],
  },
  savePluginDevelopment: { $ref: '#/components/schemas/Development' },
  deletePluginDevelopment: { $ref: '#/components/schemas/Removed' },
  placeSpace: { $ref: '#/components/schemas/SpaceDetail' },
  unplaceSpace: { $ref: '#/components/schemas/SpaceDetail' },
  getCurrentUser: { $ref: '#/components/schemas/Profile' },
  replaceCurrentUser: { $ref: '#/components/schemas/Profile' },
  updateCurrentUser: { $ref: '#/components/schemas/Profile' },
  listWebhooks: {
    anyOf: [
      { $ref: '#/components/schemas/SubscriptionPage' },
      { $ref: '#/components/schemas/PartialSubscriptionPage' },
    ],
  },
  createWebhook: { $ref: '#/components/schemas/SecretResult' },
  rotateWebhook: { $ref: '#/components/schemas/SecretResult' },
  purgeTrash: { $ref: '#/components/schemas/PurgeReport' },
  retryStorage: { $ref: '#/components/schemas/StorageRetry' },
  reindexSearch: { $ref: '#/components/schemas/Configuration' },
  retryMailJob: { $ref: '#/components/schemas/MailJob' },
  ingestAnalytics: { $ref: '#/components/schemas/Accepted' },
  register: { $ref: '#/components/schemas/RegisterResponse' },
  refreshSession: { $ref: '#/components/schemas/TokenResponse' },
  login: { $ref: '#/components/schemas/TokenResponse' },
  exportAudit: { $ref: '#/components/schemas/ExportStatus' },
  list: { $ref: '#/components/schemas/TokenPage' },
  issue: { $ref: '#/components/schemas/IssuedToken' },
  list_1: {
    anyOf: [
      { $ref: '#/components/schemas/TeamPage' },
      { $ref: '#/components/schemas/PartialTeamPage' },
    ],
  },
  create: { $ref: '#/components/schemas/TeamView' },
  invitations: {
    anyOf: [
      { $ref: '#/components/schemas/TeamInvitationPage' },
      { $ref: '#/components/schemas/PartialTeamInvitationPage' },
    ],
  },
  invite: { $ref: '#/components/schemas/TeamIssuedInvitation' },
  renameTag: { $ref: '#/components/schemas/TagRename' },
  listSpaces: {
    anyOf: [
      { $ref: '#/components/schemas/SpacePage' },
      { $ref: '#/components/schemas/PartialSpacePage' },
    ],
  },
  createSpace: { $ref: '#/components/schemas/SpaceDetail' },
  restoreSpace: { $ref: '#/components/schemas/SpaceDetail' },
  requestBundleExport: { $ref: '#/components/schemas/BundleExportJob' },
  convertSpace: { $ref: '#/components/schemas/SpaceDetail' },
  archiveSpace: { $ref: '#/components/schemas/SpaceDetail' },
  viewToc: {
    anyOf: [
      { $ref: '#/components/schemas/TocView' },
      { $ref: '#/components/schemas/PartialTocView' },
    ],
  },
  addTocEntry: { $ref: '#/components/schemas/TocView' },
  moveTocEntry: { $ref: '#/components/schemas/TocView' },
  importRelease: { $ref: '#/components/schemas/ImportAccepted' },
  startImportUpload: { $ref: '#/components/schemas/ImportUpload' },
  buildRelease: { $ref: '#/components/schemas/BuildReleaseResult' },
  rollbackRelease: { $ref: '#/components/schemas/ReleaseDetail' },
  promoteRelease: { $ref: '#/components/schemas/ReleaseDetail' },
  discardRelease: { $ref: '#/components/schemas/ReleaseDetail' },
  approveRelease: { $ref: '#/components/schemas/ApproveReleaseResult' },
  listPages: {
    anyOf: [
      { $ref: '#/components/schemas/PagePage' },
      { $ref: '#/components/schemas/PartialPagePage' },
    ],
  },
  createPage: { $ref: '#/components/schemas/PageDetail' },
  unpublishPages: { $ref: '#/components/schemas/BatchPublishResult' },
  publishPages: { $ref: '#/components/schemas/BatchPublishResult' },
  previewPage: { $ref: '#/components/schemas/PagePreview' },
  batchGetPages: { $ref: '#/components/schemas/BatchPageResponse' },
  unpublishPage: { $ref: '#/components/schemas/PublishResult' },
  trashPage: { $ref: '#/components/schemas/PageDetail' },
  transferPage: { $ref: '#/components/schemas/PageDetail' },
  revertPage: { $ref: '#/components/schemas/PageDetail' },
  restorePage: { $ref: '#/components/schemas/PageDetail' },
  reslugPage: { $ref: '#/components/schemas/PageDetail' },
  publishPage: { $ref: '#/components/schemas/PublishResult' },
  attachPageFile: { $ref: '#/components/schemas/PageDetail' },
  retryBundleExport: { $ref: '#/components/schemas/BundleExportJob' },
  listSites: {
    anyOf: [
      { $ref: '#/components/schemas/SitePage' },
      { $ref: '#/components/schemas/PartialSitePage' },
    ],
  },
  createSite: { $ref: '#/components/schemas/SiteDetail' },
  remountSpaceById: { $ref: '#/components/schemas/SiteDetail' },
  listRedirects: {
    anyOf: [
      { $ref: '#/components/schemas/RedirectPageResponse' },
      { $ref: '#/components/schemas/PartialRedirectPageResponse' },
    ],
  },
  createRedirect: { $ref: '#/components/schemas/RedirectView' },
  remountSpace: { $ref: '#/components/schemas/SiteDetail' },
  bindDomain: { $ref: '#/components/schemas/DomainDetail' },
  verifyDomain: { $ref: '#/components/schemas/DomainDetail' },
  setPrimaryDomain: { $ref: '#/components/schemas/DomainDetail' },
  listPluginVerifications: {
    anyOf: [
      { $ref: '#/components/schemas/VerificationList' },
      { $ref: '#/components/schemas/PartialVerificationList' },
    ],
  },
  verifyPluginCandidate: { $ref: '#/components/schemas/Verification' },
  listPluginDevelopments: {
    anyOf: [
      { $ref: '#/components/schemas/DevelopmentList' },
      { $ref: '#/components/schemas/PartialDevelopmentList' },
    ],
  },
  createPluginDevelopment: { $ref: '#/components/schemas/Development' },
  listPluginCandidates: {
    anyOf: [
      { $ref: '#/components/schemas/CandidateList' },
      { $ref: '#/components/schemas/PartialCandidateList' },
    ],
  },
  compilePluginCandidate: { $ref: '#/components/schemas/Candidate' },
  listTenantInvitations: {
    anyOf: [
      { $ref: '#/components/schemas/TenantInvitationPage' },
      { $ref: '#/components/schemas/PartialTenantInvitationPage' },
    ],
  },
  inviteTenantMember: { $ref: '#/components/schemas/TenantIssuedInvitation' },
  listContentTypeVersions: {
    anyOf: [
      { $ref: '#/components/schemas/VersionList' },
      { $ref: '#/components/schemas/PartialVersionList' },
    ],
  },
  registerContentTypeVersion: { $ref: '#/components/schemas/Version' },
  deactivateContentType: { $ref: '#/components/schemas/State' },
  activateContentType: { $ref: '#/components/schemas/State' },
  viewCollections: {
    anyOf: [
      { $ref: '#/components/schemas/CollectionView' },
      { $ref: '#/components/schemas/PartialCollectionView' },
    ],
  },
  createCollection: { $ref: '#/components/schemas/CollectionView' },
  moveCollection: { $ref: '#/components/schemas/CollectionView' },
  listManagementTokens: { $ref: '#/components/schemas/ManagementTokenPage' },
  issueManagementToken: { $ref: '#/components/schemas/IssuedManagementToken' },
  acceptInvitation: { $ref: '#/components/schemas/InvitationAcceptance' },
  listTenants: {
    anyOf: [
      { $ref: '#/components/schemas/Tenants' },
      { $ref: '#/components/schemas/PartialTenants' },
    ],
  },
  provisionTenant: { $ref: '#/components/schemas/Provisioned' },
  view: {
    anyOf: [
      { $ref: '#/components/schemas/TeamView' },
      { $ref: '#/components/schemas/PartialTeamView' },
    ],
  },
  rename: { $ref: '#/components/schemas/TeamView' },
  viewSpace: {
    anyOf: [
      { $ref: '#/components/schemas/SpaceDetail' },
      { $ref: '#/components/schemas/PartialSpaceDetail' },
    ],
  },
  deleteSpace: { $ref: '#/components/schemas/Deletion' },
  updateSpace: { $ref: '#/components/schemas/SpaceDetail' },
  removeTocEntry: { $ref: '#/components/schemas/TocView' },
  relabelTocEntry: { $ref: '#/components/schemas/TocView' },
  viewRelease: {
    anyOf: [
      { $ref: '#/components/schemas/ReleaseDetail' },
      { $ref: '#/components/schemas/PartialReleaseDetail' },
    ],
  },
  patchRelease: { $ref: '#/components/schemas/ReleaseDetail' },
  viewPage: {
    anyOf: [
      { $ref: '#/components/schemas/PageDetail' },
      { $ref: '#/components/schemas/PartialPageDetail' },
    ],
  },
  renamePage: { $ref: '#/components/schemas/PageDetail' },
  setPageSeo: { $ref: '#/components/schemas/PageDetail' },
  viewSite: {
    anyOf: [
      { $ref: '#/components/schemas/SiteDetail' },
      { $ref: '#/components/schemas/PartialSiteDetail' },
    ],
  },
  deleteSite: { $ref: '#/components/schemas/Deletion' },
  updateSite: { $ref: '#/components/schemas/SiteDetail' },
  removeCollection: { $ref: '#/components/schemas/CollectionView' },
  patchCollection: { $ref: '#/components/schemas/CollectionView' },
  listWebhookDeliveries: {
    anyOf: [
      { $ref: '#/components/schemas/DeliveryPage' },
      { $ref: '#/components/schemas/PartialDeliveryPage' },
    ],
  },
  tenantUsage: {
    anyOf: [
      { $ref: '#/components/schemas/Usage' },
      { $ref: '#/components/schemas/PartialUsage' },
    ],
  },
  spaceUsage: {
    anyOf: [
      { $ref: '#/components/schemas/Usage' },
      { $ref: '#/components/schemas/PartialUsage' },
    ],
  },
  siteTraffic: {
    anyOf: [
      { $ref: '#/components/schemas/Traffic' },
      { $ref: '#/components/schemas/PartialTraffic' },
    ],
  },
  siteSearchStats: {
    anyOf: [
      { $ref: '#/components/schemas/Search' },
      { $ref: '#/components/schemas/PartialSearch' },
    ],
  },
  readiness: {
    anyOf: [
      { $ref: '#/components/schemas/ProbeResponse' },
      { $ref: '#/components/schemas/PartialProbeResponse' },
    ],
  },
  storageUsage: {
    anyOf: [
      { $ref: '#/components/schemas/StorageUsage' },
      { $ref: '#/components/schemas/PartialStorageUsage' },
    ],
  },
  listMailJobs: {
    anyOf: [
      { $ref: '#/components/schemas/MailJobPage' },
      { $ref: '#/components/schemas/PartialMailJobPage' },
    ],
  },
  listJobs: {
    anyOf: [
      { $ref: '#/components/schemas/JobPage' },
      { $ref: '#/components/schemas/PartialJobPage' },
    ],
  },
  domainCertificate: {
    anyOf: [
      { $ref: '#/components/schemas/Certificate' },
      { $ref: '#/components/schemas/PartialCertificate' },
    ],
  },
  health: {
    anyOf: [
      { $ref: '#/components/schemas/ProbeResponse' },
      { $ref: '#/components/schemas/PartialProbeResponse' },
    ],
  },
  listAudit: {
    anyOf: [
      { $ref: '#/components/schemas/AuditPage' },
      { $ref: '#/components/schemas/PartialAuditPage' },
    ],
  },
  viewAuditExport: {
    anyOf: [
      { $ref: '#/components/schemas/ExportStatus' },
      { $ref: '#/components/schemas/PartialExportStatus' },
    ],
  },
  members: {
    anyOf: [
      { $ref: '#/components/schemas/TeamMemberPage' },
      { $ref: '#/components/schemas/PartialTeamMemberPage' },
    ],
  },
  listTags: {
    anyOf: [
      { $ref: '#/components/schemas/TagPage' },
      { $ref: '#/components/schemas/PartialTagPage' },
    ],
  },
  listTaggedPages: {
    anyOf: [
      { $ref: '#/components/schemas/TaggedPagePage' },
      { $ref: '#/components/schemas/PartialTaggedPagePage' },
    ],
  },
  planSpaceTermination: {
    anyOf: [
      { $ref: '#/components/schemas/TerminationPlan' },
      { $ref: '#/components/schemas/PartialTerminationPlan' },
    ],
  },
  listTrash: {
    anyOf: [
      { $ref: '#/components/schemas/TrashPage' },
      { $ref: '#/components/schemas/PartialTrashPage' },
    ],
  },
  listReleases: {
    anyOf: [
      { $ref: '#/components/schemas/ReleasePage' },
      { $ref: '#/components/schemas/PartialReleasePage' },
    ],
  },
  diffReleases: {
    anyOf: [
      { $ref: '#/components/schemas/ReleaseDelta' },
      { $ref: '#/components/schemas/PartialReleaseDelta' },
    ],
  },
  listReleasePreviewPages: {
    anyOf: [
      { $ref: '#/components/schemas/SnapshotPreviewPages' },
      { $ref: '#/components/schemas/PartialSnapshotPreviewPages' },
    ],
  },
  previewRelease: {
    anyOf: [
      { $ref: '#/components/schemas/SnapshotPreview' },
      { $ref: '#/components/schemas/PartialSnapshotPreview' },
    ],
  },
  previewReleaseByPageId: {
    anyOf: [
      { $ref: '#/components/schemas/SnapshotPreview' },
      { $ref: '#/components/schemas/PartialSnapshotPreview' },
    ],
  },
  listSpacePermissions: {
    anyOf: [
      { $ref: '#/components/schemas/GrantPage' },
      { $ref: '#/components/schemas/PartialGrantPage' },
    ],
  },
  searchPermissionUsers: {
    anyOf: [
      { $ref: '#/components/schemas/PrincipalPage' },
      { $ref: '#/components/schemas/PartialPrincipalPage' },
    ],
  },
  searchPermissionTeams: {
    anyOf: [
      { $ref: '#/components/schemas/PrincipalPage' },
      { $ref: '#/components/schemas/PartialPrincipalPage' },
    ],
  },
  listPermissionPages: {
    anyOf: [
      { $ref: '#/components/schemas/PermissionPage' },
      { $ref: '#/components/schemas/PartialPermissionPage' },
    ],
  },
  listPageRevisions: {
    anyOf: [
      { $ref: '#/components/schemas/RevisionPage' },
      { $ref: '#/components/schemas/PartialRevisionPage' },
    ],
  },
  diffPageRevisions: {
    anyOf: [
      { $ref: '#/components/schemas/RevisionDiff' },
      { $ref: '#/components/schemas/PartialRevisionDiff' },
    ],
  },
  viewPageRevision: {
    anyOf: [
      { $ref: '#/components/schemas/RevisionDetail' },
      { $ref: '#/components/schemas/PartialRevisionDetail' },
    ],
  },
  viewPagePermission: {
    anyOf: [
      { $ref: '#/components/schemas/PagePermissionView' },
      { $ref: '#/components/schemas/PartialPagePermissionView' },
    ],
  },
  explainPageRead: {
    anyOf: [
      { $ref: '#/components/schemas/EffectivePermissionView' },
      { $ref: '#/components/schemas/PartialEffectivePermissionView' },
    ],
  },
  viewPageAttachment: {
    anyOf: [
      { $ref: '#/components/schemas/AttachmentLink' },
      { $ref: '#/components/schemas/PartialAttachmentLink' },
    ],
  },
  detachPageFile: { $ref: '#/components/schemas/PageDetail' },
  listSpaceMounts: {
    anyOf: [
      { type: 'array', items: { $ref: '#/components/schemas/SpaceMount' } },
      {
        type: 'array',
        items: { $ref: '#/components/schemas/PartialSpaceMount' },
      },
    ],
  },
  viewImportJob: {
    anyOf: [
      { $ref: '#/components/schemas/ImportJob' },
      { $ref: '#/components/schemas/PartialImportJob' },
    ],
  },
  listBundleExports: {
    anyOf: [
      { $ref: '#/components/schemas/BundleExportPage' },
      { $ref: '#/components/schemas/PartialBundleExportPage' },
    ],
  },
  viewBundleExport: {
    anyOf: [
      { $ref: '#/components/schemas/BundleExportJob' },
      { $ref: '#/components/schemas/PartialBundleExportJob' },
    ],
  },
  viewDrift: {
    anyOf: [
      { $ref: '#/components/schemas/DriftBoard' },
      { $ref: '#/components/schemas/PartialDriftBoard' },
    ],
  },
  listSpaceAttachments: {
    anyOf: [
      { $ref: '#/components/schemas/AttachmentPageResponse' },
      { $ref: '#/components/schemas/PartialAttachmentPageResponse' },
    ],
  },
  planSiteTermination: {
    anyOf: [
      { $ref: '#/components/schemas/TerminationPlan' },
      { $ref: '#/components/schemas/PartialTerminationPlan' },
    ],
  },
  listSitePermissions: {
    anyOf: [
      { $ref: '#/components/schemas/GrantPage' },
      { $ref: '#/components/schemas/PartialGrantPage' },
    ],
  },
  explainSiteAdmin: {
    anyOf: [
      { $ref: '#/components/schemas/EffectivePermissionView' },
      { $ref: '#/components/schemas/PartialEffectivePermissionView' },
    ],
  },
  searchSitePermissionUsers: {
    anyOf: [
      { $ref: '#/components/schemas/PrincipalPage' },
      { $ref: '#/components/schemas/PartialPrincipalPage' },
    ],
  },
  searchSitePermissionTeams: {
    anyOf: [
      { $ref: '#/components/schemas/PrincipalPage' },
      { $ref: '#/components/schemas/PartialPrincipalPage' },
    ],
  },
  viewDomain: {
    anyOf: [
      { $ref: '#/components/schemas/DomainDetail' },
      { $ref: '#/components/schemas/PartialDomainDetail' },
    ],
  },
  siteDeliveryStatus: {
    anyOf: [
      { $ref: '#/components/schemas/Status' },
      { $ref: '#/components/schemas/PartialStatus' },
    ],
  },
  listTenantReleases: {
    anyOf: [
      { $ref: '#/components/schemas/TenantReleasePage' },
      { $ref: '#/components/schemas/PartialTenantReleasePage' },
    ],
  },
  viewPluginVerification: {
    anyOf: [
      { $ref: '#/components/schemas/Verification' },
      { $ref: '#/components/schemas/PartialVerification' },
    ],
  },
  viewPluginCandidate: {
    anyOf: [
      { $ref: '#/components/schemas/Candidate' },
      { $ref: '#/components/schemas/PartialCandidate' },
    ],
  },
  operationsCapabilities: {
    anyOf: [
      { $ref: '#/components/schemas/Capabilities' },
      { $ref: '#/components/schemas/PartialCapabilities' },
    ],
  },
  listTenantMembers: {
    anyOf: [
      { $ref: '#/components/schemas/TenantMemberPage' },
      { $ref: '#/components/schemas/PartialTenantMemberPage' },
    ],
  },
  listTenantDomains: {
    anyOf: [
      { $ref: '#/components/schemas/TenantDomainPage' },
      { $ref: '#/components/schemas/PartialTenantDomainPage' },
    ],
  },
  listDeletions: {
    anyOf: [
      { $ref: '#/components/schemas/DeletionPage' },
      { $ref: '#/components/schemas/PartialDeletionPage' },
    ],
  },
  listContentTypes: {
    anyOf: [
      { $ref: '#/components/schemas/TypeList' },
      { $ref: '#/components/schemas/PartialTypeList' },
    ],
  },
  viewContentTypeVersion: {
    anyOf: [
      { $ref: '#/components/schemas/Version' },
      { $ref: '#/components/schemas/PartialVersion' },
    ],
  },
  contentPluginCatalog: {
    anyOf: [
      { $ref: '#/components/schemas/Catalog' },
      { $ref: '#/components/schemas/PartialCatalog' },
    ],
  },
  listSessions: { $ref: '#/components/schemas/Sessions' },
  previewInvitation: {
    anyOf: [
      { $ref: '#/components/schemas/InvitePreview' },
      { $ref: '#/components/schemas/PartialInvitePreview' },
    ],
  },
  authenticationContext: {
    $ref: '#/components/schemas/ManagementAuthenticationContext',
  },
  searchAdminUsers: {
    anyOf: [
      { $ref: '#/components/schemas/UserPage' },
      { $ref: '#/components/schemas/PartialUserPage' },
    ],
  },
  getAdminUser: {
    anyOf: [
      { $ref: '#/components/schemas/UserDetail' },
      { $ref: '#/components/schemas/PartialUserDetail' },
    ],
  },
  platformHealth: {
    anyOf: [
      { $ref: '#/components/schemas/HealthReport' },
      { $ref: '#/components/schemas/PartialHealthReport' },
    ],
  },
  keys: { anyOf: [{ type: 'object' }, { type: 'object' }] },
  unmountSpaceById: { $ref: '#/components/schemas/SiteDetail' },
};
