import { goto } from '$app/navigation';
import type { Session } from '#lib/features/session/presentation/session.svelte';

export async function leaveConsole(session: Session) {
  await session.signOut();
  await goto('/login');
}
