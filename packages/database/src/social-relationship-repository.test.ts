import { describe, expect, it } from "vitest";

import { createSocialRelationshipRepository } from "./social-relationship-repository";

const authorId = "20000000-0000-4000-8000-000000000001";

describe("social relationship repository", () => {
  it("maps the public author contract and published works", async () => {
    const repository = createSocialRelationshipRepository({
      followAuthor: async () => ({ follower_count: 1, is_following: true }),
      getInvitationRelationships: async () => ({
        direct_invitee_count: 0,
        direct_invitees: [],
        inviter_user_id: null,
      }),
      getPublicAuthorProfile: async () => ({
        bio: "Writes harbor stories.",
        display_name: "Harbor Author",
        follower_count: 2,
        following_count: 1,
        is_following: false,
        published_work_count: 1,
        slug: "harbor-author",
        user_id: authorId,
        works: [
          {
            id: "30000000-0000-4000-8000-000000000001",
            published_at: "2026-07-02T08:00:00.000Z",
            slug: "harbor-light",
            summary: "A light at the edge.",
            title: "Harbor Light",
          },
        ],
      }),
      getPublishedWorkAuthors: async () => [],
      unfollowAuthor: async () => ({ follower_count: 0, is_following: false }),
    });

    const profile = await repository.getPublicAuthorProfile("harbor-author");
    expect(profile?.displayName).toBe("Harbor Author");
    expect(profile?.works[0]?.publishedAt).toEqual(
      new Date("2026-07-02T08:00:00.000Z"),
    );
  });

  it("maps idempotent follow state and invitation relationships", async () => {
    const repository = createSocialRelationshipRepository({
      followAuthor: async () => ({ follower_count: 1, is_following: true }),
      getInvitationRelationships: async () => ({
        direct_invitee_count: 1,
        direct_invitees: [
          {
            invitation_id: "40000000-0000-4000-8000-000000000001",
            invitee_user_id: "50000000-0000-4000-8000-000000000001",
            redeemed_at: "2026-07-02T08:00:00.000Z",
          },
        ],
        inviter_user_id: authorId,
      }),
      getPublicAuthorProfile: async () => null,
      getPublishedWorkAuthors: async () => [
        {
          author_slug: "harbor-author",
          display_name: "Harbor Author",
          work_slug: "harbor-light",
        },
      ],
      unfollowAuthor: async () => ({ follower_count: 0, is_following: false }),
    });

    await expect(repository.followAuthor(authorId)).resolves.toEqual({
      followerCount: 1,
      isFollowing: true,
    });
    const relationships = await repository.getInvitationRelationships();
    expect(relationships.directInviteeCount).toBe(1);
    expect(relationships.directInvitees[0]?.inviteeUserId).toBe(
      "50000000-0000-4000-8000-000000000001",
    );
    await expect(
      repository.getPublishedWorkAuthors(["harbor-light"]),
    ).resolves.toEqual([
      {
        authorSlug: "harbor-author",
        displayName: "Harbor Author",
        workSlug: "harbor-light",
      },
    ]);
  });
});
