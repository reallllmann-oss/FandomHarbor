import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import type {
  SocialRelationshipStore,
  FollowState,
  InvitationRelationshipSummary,
  PublicAuthorProfile,
  PublicWorkAuthor,
} from "@fandom-harbor/services";
import { z } from "zod";

import { DatabaseAccessError } from "./access-context-repository";
import { createServerSupabaseClient } from "./server-client";

const uuid = z.string().uuid();
const nonnegativeCount = z.coerce.number().int().nonnegative();
const followStateRow = z.object({
  follower_count: nonnegativeCount,
  is_following: z.boolean(),
});
const publicAuthorRow = z.object({
  bio: z.string(),
  display_name: z.string(),
  follower_count: nonnegativeCount,
  following_count: nonnegativeCount,
  is_following: z.boolean(),
  published_work_count: nonnegativeCount,
  slug: z.string(),
  user_id: uuid,
  works: z.array(
    z.object({
      id: uuid,
      published_at: z.string().datetime({ offset: true }),
      slug: z.string(),
      summary: z.string(),
      title: z.string(),
    }),
  ),
});
const invitationSummaryRow = z.object({
  direct_invitee_count: nonnegativeCount,
  direct_invitees: z.array(
    z.object({
      invitation_id: uuid,
      invitee_user_id: uuid,
      redeemed_at: z.string().datetime({ offset: true }),
    }),
  ),
  inviter_user_id: uuid.nullable(),
});
const publicWorkAuthorRow = z.object({
  author_slug: z.string(),
  display_name: z.string(),
  work_slug: z.string(),
});

export interface SocialRelationshipRepositoryDataSource {
  followAuthor(authorUserId: string): Promise<unknown>;
  getInvitationRelationships(): Promise<unknown>;
  getPublicAuthorProfile(slug: string): Promise<unknown>;
  getPublishedWorkAuthors(workSlugs: string[]): Promise<unknown>;
  unfollowAuthor(authorUserId: string): Promise<unknown>;
}

function mapFollowState(input: unknown): FollowState {
  const row = followStateRow.parse(input);
  return { followerCount: row.follower_count, isFollowing: row.is_following };
}

function mapProfile(input: unknown): PublicAuthorProfile | null {
  if (input === null) return null;
  const row = publicAuthorRow.parse(input);
  return {
    bio: row.bio,
    displayName: row.display_name,
    followerCount: row.follower_count,
    followingCount: row.following_count,
    isFollowing: row.is_following,
    publishedWorkCount: row.published_work_count,
    slug: row.slug,
    userId: row.user_id,
    works: row.works.map((work) => ({
      id: work.id,
      publishedAt: new Date(work.published_at),
      slug: work.slug,
      summary: work.summary,
      title: work.title,
    })),
  };
}

function mapInvitationSummary(input: unknown): InvitationRelationshipSummary {
  const row = invitationSummaryRow.parse(input);
  return {
    directInviteeCount: row.direct_invitee_count,
    directInvitees: row.direct_invitees.map((relationship) => ({
      invitationId: relationship.invitation_id,
      inviteeUserId: relationship.invitee_user_id,
      redeemedAt: new Date(relationship.redeemed_at),
    })),
    inviterUserId: row.inviter_user_id,
  };
}

export function createSocialRelationshipRepository(
  source: SocialRelationshipRepositoryDataSource,
): SocialRelationshipStore {
  return {
    async followAuthor(authorUserId) {
      return mapFollowState(
        await source.followAuthor(uuid.parse(authorUserId)),
      );
    },
    async getInvitationRelationships() {
      return mapInvitationSummary(await source.getInvitationRelationships());
    },
    async getPublicAuthorProfile(slug) {
      const safeSlug = z.string().trim().min(3).max(80).parse(slug);
      return mapProfile(await source.getPublicAuthorProfile(safeSlug));
    },
    async getPublishedWorkAuthors(workSlugs) {
      const safeSlugs = z
        .array(z.string().min(1).max(160))
        .max(100)
        .parse(workSlugs);
      return z
        .array(publicWorkAuthorRow)
        .parse(await source.getPublishedWorkAuthors(safeSlugs))
        .map((row): PublicWorkAuthor => ({
          authorSlug: row.author_slug,
          displayName: row.display_name,
          workSlug: row.work_slug,
        }));
    },
    async unfollowAuthor(authorUserId) {
      return mapFollowState(
        await source.unfollowAuthor(uuid.parse(authorUserId)),
      );
    },
  };
}

export function createSupabaseSocialRelationshipRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): SocialRelationshipStore {
  const client = createServerSupabaseClient(environment, cookies);

  async function rpc(name: string, parameters: Record<string, unknown> = {}) {
    const { data, error } = await client.rpc(name, parameters);
    if (error) {
      throw new DatabaseAccessError(
        `Social relationship operation failed: ${name}`,
        {
          cause: error,
        },
      );
    }
    return data;
  }

  return createSocialRelationshipRepository({
    followAuthor: (authorUserId) =>
      rpc("follow_author", { p_author_user_id: authorUserId }),
    getInvitationRelationships: () => rpc("get_my_invitation_relationships"),
    getPublicAuthorProfile: (slug) =>
      rpc("get_public_author_profile", { p_slug: slug }),
    getPublishedWorkAuthors: (workSlugs) =>
      rpc("get_published_work_authors", { p_work_slugs: workSlugs }),
    unfollowAuthor: (authorUserId) =>
      rpc("unfollow_author", { p_author_user_id: authorUserId }),
  });
}
