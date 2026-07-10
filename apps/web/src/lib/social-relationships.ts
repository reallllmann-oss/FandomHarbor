import type {
  AuthCookieStore,
  TrustedAccessContext,
} from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseSocialRelationshipRepository } from "@fandom-harbor/database";
import { createSocialRelationshipService } from "@fandom-harbor/services";

import { fixtureWorks } from "./reader-content-fixtures";

const fixtureWorkSlugs = new Set(
  fixtureWorks
    .filter((work) => work.status === "published")
    .map((work) => work.slug),
);

export function createSocialRelationshipGateway(
  runtime: PublicRuntimeConfig,
  cookies: AuthCookieStore,
) {
  const service = createSocialRelationshipService(
    createSupabaseSocialRelationshipRepository(runtime, cookies),
  );
  return {
    ...service,
    async getPublicAuthorProfile(slug: string) {
      const profile = await service.getPublicAuthorProfile(slug);
      if (profile || slug !== "fandom-harbor-archive") return profile;
      const works = fixtureWorks
        .filter((work) => work.status === "published")
        .map((work) => ({
          id: work.id,
          publishedAt: work.publishedAt!,
          slug: work.slug,
          summary: work.summary,
          title: work.title,
        }));
      return {
        bio: "Fandom Harbor 的公开示例作者档案。",
        displayName: "Fandom Harbor Archive",
        followerCount: 0,
        followingCount: 0,
        isFollowing: false,
        publishedWorkCount: works.length,
        slug,
        userId: "30000000-0000-4000-8000-000000000002",
        works,
      };
    },
    async getPublishedWorkAuthors(workSlugs: string[]) {
      const authors = await service.getPublishedWorkAuthors(workSlugs);
      const byWorkSlug = new Map(
        authors.map((author) => [author.workSlug, author]),
      );
      for (const workSlug of workSlugs) {
        if (!byWorkSlug.has(workSlug) && fixtureWorkSlugs.has(workSlug)) {
          byWorkSlug.set(workSlug, {
            authorSlug: "fandom-harbor-archive",
            displayName: "Fandom Harbor Archive",
            workSlug,
          });
        }
      }
      return [...byWorkSlug.values()];
    },
  };
}

export function createAuthorizedSocialRelationshipGateway(
  context: TrustedAccessContext,
  runtime: PublicRuntimeConfig,
  cookies: AuthCookieStore,
) {
  const service = createSocialRelationshipGateway(runtime, cookies);
  return {
    followAuthor: (authorUserId: string) =>
      service.followAuthor(context, authorUserId),
    getInvitationRelationships: () =>
      service.getInvitationRelationships(context),
    unfollowAuthor: (authorUserId: string) =>
      service.unfollowAuthor(context, authorUserId),
  };
}
