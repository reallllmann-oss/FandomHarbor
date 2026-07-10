import type { TrustedAccessContext } from "@fandom-harbor/auth";

export interface PublicAuthorWork {
  id: string;
  publishedAt: Date;
  slug: string;
  summary: string;
  title: string;
}

export interface PublicWorkAuthor {
  authorSlug: string;
  displayName: string;
  workSlug: string;
}

export interface PublicAuthorProfile {
  bio: string;
  displayName: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  publishedWorkCount: number;
  slug: string;
  userId: string;
  works: PublicAuthorWork[];
}

export interface FollowState {
  followerCount: number;
  isFollowing: boolean;
}

export interface InvitationRelationship {
  invitationId: string;
  inviteeUserId: string;
  redeemedAt: Date;
}

export interface InvitationRelationshipSummary {
  directInviteeCount: number;
  directInvitees: InvitationRelationship[];
  inviterUserId: string | null;
}

export interface SocialRelationshipStore {
  followAuthor(authorUserId: string): Promise<FollowState>;
  getInvitationRelationships(): Promise<InvitationRelationshipSummary>;
  getPublicAuthorProfile(slug: string): Promise<PublicAuthorProfile | null>;
  getPublishedWorkAuthors(workSlugs: string[]): Promise<PublicWorkAuthor[]>;
  unfollowAuthor(authorUserId: string): Promise<FollowState>;
}

export class SocialRelationshipAuthorizationError extends Error {
  constructor() {
    super("Social relationship operation is not authorized");
    this.name = "SocialRelationshipAuthorizationError";
  }
}

function requireReader(context: TrustedAccessContext) {
  if (!context.capabilities.has("archive:read")) {
    throw new SocialRelationshipAuthorizationError();
  }
}

export function createSocialRelationshipService(
  store: SocialRelationshipStore,
) {
  return {
    followAuthor(context: TrustedAccessContext, authorUserId: string) {
      requireReader(context);
      return store.followAuthor(authorUserId);
    },
    getInvitationRelationships(context: TrustedAccessContext) {
      requireReader(context);
      return store.getInvitationRelationships();
    },
    getPublicAuthorProfile(slug: string) {
      return store.getPublicAuthorProfile(slug);
    },
    getPublishedWorkAuthors(workSlugs: string[]) {
      return store.getPublishedWorkAuthors(workSlugs);
    },
    unfollowAuthor(context: TrustedAccessContext, authorUserId: string) {
      requireReader(context);
      return store.unfollowAuthor(authorUserId);
    },
  };
}
