package io.edition.control.usecases.releases.bundleimport;

import java.util.UUID;

record ImportQueued(UUID tenantId, UUID jobId) {}
