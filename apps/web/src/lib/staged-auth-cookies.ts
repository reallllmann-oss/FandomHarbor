import "server-only";

import type { AuthCookieMutation, AuthCookieStore } from "@fandom-harbor/auth";

// Auth may emit cookies before the application has checked the returned UID.
// Keep those mutations request-local until the trusted identity is accepted.
export function createStagedAuthCookies(destination: AuthCookieStore) {
  const pending = new Map<string, AuthCookieMutation>();
  let accepted = false;
  const cookieAdapter: AuthCookieStore = {
    async getAll() {
      const values = new Map(
        (await destination.getAll()).map((cookie) => [cookie.name, cookie]),
      );
      for (const mutation of pending.values()) {
        if (mutation.options?.maxAge === 0) values.delete(mutation.name);
        else values.set(mutation.name, mutation);
      }
      return [...values.values()];
    },
    async setAll(mutations) {
      if (accepted) {
        await destination.setAll(mutations);
        return;
      }
      for (const mutation of mutations) pending.set(mutation.name, mutation);
    },
  };

  return {
    cookieAdapter,
    async commit() {
      if (pending.size) await destination.setAll([...pending.values()]);
      pending.clear();
      // Later Auth refresh/update events must still reach the accepted session.
      accepted = true;
    },
  };
}
