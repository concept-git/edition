package io.edition.control.compositions.releases.bundleimport;

import java.util.UUID;

record ImportQueued(UUID tenantId, UUID jobId) {}
