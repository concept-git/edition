/** Heartbeats at or under 60s are normal, at or under 180s are lagging, and older are lost. */
const NORMAL_WITHIN_MS = 60_000;
const LAGGING_WITHIN_MS = 180_000;

export type ProcessStatus = 'normal' | 'lagging' | 'lost' | 'unknown' | 'unconfigured';

export type HealthReport = {
  checkedAt: string;
  services: Array<{
    service: string;
    status?: string;
    instances?: Array<{ seenAt?: string | null }>;
  }>;
};

const rank = ['normal', 'lagging', 'lost', 'unknown'] as const;

export function classifySeenAt(seenAt: string | null | undefined, checkedAt: string): ProcessStatus {
  if (!seenAt) return 'unknown';
  const age = Date.parse(checkedAt) - Date.parse(seenAt);
  if (!Number.isFinite(age)) return 'unknown';
  if (age <= NORMAL_WITHIN_MS) return 'normal';
  if (age <= LAGGING_WITHIN_MS) return 'lagging';
  return 'lost';
}

export function classifyService(service: HealthReport['services'][number], checkedAt: string): ProcessStatus {
  const instances = service.instances ?? [];
  if (instances.length === 0) return service.status === 'unconfigured' ? 'unconfigured' : 'unknown';
  const statuses = instances.map((instance) => classifySeenAt(instance.seenAt, checkedAt));
  return rank.find((status) => statuses.includes(status)) ?? 'unknown';
}

/** Service name and status only. Instance details can carry tenant document text and stay out of the view. */
export function healthRows(report: HealthReport): Array<{ service: string; status: ProcessStatus }> {
  return report.services.map((service) => ({
    service: service.service,
    status: classifyService(service, report.checkedAt)
  }));
}
