import type { TrustedAccessContext } from "@fandom-harbor/auth";
import { describe, expect, it, vi } from "vitest";

import {
  createSocialRelationshipService,
  SocialRelationshipAuthorizationError,
  type SocialRelationshipStore,
} from "./social-relationships";

function context(reader = true) {
  return {
    capabilities: new Set(reader ? (["archive:read"] as const) : []),
    identity: { id: "10000000-0000-4000-8000-000000000001" },
  } as unknown as TrustedAccessContext;
}

function store(): SocialRelationshipStore {
  return {
    followAuthor: vi
      .fn()
      .mockResolvedValue({ followerCount: 1, isFollowing: true }),
    getInvitationRelationships: vi.fn().mockResolvedValue({
      directInviteeCount: 0,
      directInvitees: [],
      inviterUserId: null,
    }),
    getPublicAuthorProfile: vi.fn().mockResolvedValue(null),
    getPublishedWorkAuthors: vi.fn().mockResolvedValue([]),
    unfollowAuthor: vi
      .fn()
      .mockResolvedValue({ followerCount: 0, isFollowing: false }),
  };
}

describe("social relationship service", () => {
  it("keeps public author profile reads available without an access context", async () => {
    const source = store();
    await createSocialRelationshipService(source).getPublicAuthorProfile(
      "quiet-author",
    );
    expect(source.getPublicAuthorProfile).toHaveBeenCalledWith("quiet-author");
  });

  it("allows active readers to follow and unfollow authors", async () => {
    const source = store();
    const service = createSocialRelationshipService(source);
    await service.followAuthor(
      context(),
      "20000000-0000-4000-8000-000000000001",
    );
    await service.unfollowAuthor(
      context(),
      "20000000-0000-4000-8000-000000000001",
    );
    expect(source.followAuthor).toHaveBeenCalledOnce();
    expect(source.unfollowAuthor).toHaveBeenCalledOnce();
  });

  it("rejects relationship mutations without Reader capability", async () => {
    const service = createSocialRelationshipService(store());
    expect(() =>
      service.followAuthor(
        context(false),
        "20000000-0000-4000-8000-000000000001",
      ),
    ).toThrow(SocialRelationshipAuthorizationError);
  });
});
