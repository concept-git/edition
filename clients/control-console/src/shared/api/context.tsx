import { createContext, useContext } from 'react';
import type { Api } from './generated/sdk';
import type { SessionTransport } from './session';

export type ResourceScope = {
  tenantId: string;
  spaceId: string;
  pageId: string;
  siteId: string;
  teamId: string;
  resourceId: string;
  panel: string;
};
export type Services = {
  api: Api;
  session: SessionTransport;
  scope: ResourceScope;
  actorKey: string;
  navigate: (target: string) => void;
};
export const ServicesContext = createContext<Services | null>(null);
export function useServices() {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('Console services are not mounted');
  return services;
}
