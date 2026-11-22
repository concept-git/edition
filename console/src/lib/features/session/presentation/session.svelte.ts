import { createContext } from 'svelte';
import { clearsSession, type AccessGrant, type AuthGateway, type LoginResult, type SessionFailure } from '../domain/auth';

export class Session {
  status = $state<'unknown' | 'signed-in' | 'signed-out'>('unknown');
  /** Access token for later API calls. Never written to storage. */
  accessToken = $state<string | null>(null);
  hold = $state<SessionFailure | null>(null);

  constructor(private readonly auth: AuthGateway) {}

  async restore(path: string) {
    const result = await this.auth.refresh();
    if (result.ok) {
      this.accept(result.grant);
      return;
    }
    if (clearsSession(result.failure)) {
      this.clear();
      return;
    }
    this.hold = result.failure;
    this.status = path === '/login' ? 'signed-out' : 'signed-in';
  }

  async renew() {
    if (this.status === 'unknown') return;
    const result = await this.auth.refresh();
    if (result.ok) {
      this.accept(result.grant);
      return;
    }
    if (clearsSession(result.failure)) {
      this.clear();
      return;
    }
    this.hold = result.failure;
  }

  async signIn(email: string, password: string): Promise<LoginResult> {
    const result = await this.auth.login(email, password);
    if (result.ok) this.accept(result.grant);
    return result;
  }

  async signOut(): Promise<boolean> {
    const result = await this.auth.logout();
    if (result.ok || clearsSession(result.failure)) {
      this.clear();
      return true;
    }
    this.hold = result.failure;
    return false;
  }

  private accept(grant: AccessGrant) {
    this.accessToken = grant.accessToken;
    this.status = 'signed-in';
    this.hold = null;
  }

  private clear() {
    this.accessToken = null;
    this.status = 'signed-out';
    this.hold = null;
  }
}

export const [getSession, setSession] = createContext<Session>();
