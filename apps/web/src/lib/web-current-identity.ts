import {
  createCurrentAccountIdentity,
  resolveSurfaceDisplayRole,
  type CurrentAccountIdentityFor,
  type TrustedAccessContext,
  type TrustedIdentity,
} from "@fandom-harbor/auth";

export interface WebCurrentIdentities {
  author: CurrentAccountIdentityFor<"author"> | null;
  reader: CurrentAccountIdentityFor<"reader">;
}

interface WebCurrentIdentityDependencies {
  getAccessContext(): Promise<TrustedAccessContext | null>;
  getRegistrationName(identity: TrustedIdentity): Promise<string | null>;
}

export function createWebCurrentIdentities(
  access: TrustedAccessContext,
  registrationName: string | null,
): WebCurrentIdentities | null {
  const reader = createCurrentAccountIdentity(
    access,
    registrationName,
    "reader",
  );
  if (reader === null) return null;

  return {
    author: createCurrentAccountIdentity(access, registrationName, "author"),
    reader,
  };
}

export async function loadWebCurrentIdentities(
  dependencies: WebCurrentIdentityDependencies,
): Promise<WebCurrentIdentities | null> {
  const access = await dependencies.getAccessContext();
  if (access === null || resolveSurfaceDisplayRole(access, "reader") === null) {
    return null;
  }

  const registrationName = await dependencies.getRegistrationName(
    access.identity,
  );
  return createWebCurrentIdentities(access, registrationName);
}
