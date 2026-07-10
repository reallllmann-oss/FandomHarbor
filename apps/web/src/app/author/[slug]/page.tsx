import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createWebIdentityAccess } from "../../../lib/identity-access";
import { pageMetadata, privatePageMetadata } from "../../../lib/seo";
import { createSocialRelationshipGateway } from "../../../lib/social-relationships";
import { FollowAuthorButton } from "./follow-author-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dependencies = await createWebIdentityAccess();
  const profile = await createSocialRelationshipGateway(
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getPublicAuthorProfile(slug);
  if (!profile) return privatePageMetadata("作者未找到");

  return pageMetadata({
    description:
      profile.bio ||
      `${profile.displayName} 在 Fandom Harbor 发布了 ${profile.publishedWorkCount} 部作品。`,
    pathname: `/author/${encodeURIComponent(profile.slug)}`,
    title: profile.displayName,
  });
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  const profile = await createSocialRelationshipGateway(
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getPublicAuthorProfile(slug);
  if (!profile) notFound();

  const initials = profile.displayName.trim().slice(0, 2).toUpperCase();
  const canFollow =
    profile.slug !== "fandom-harbor-archive" &&
    session?.identity.id !== profile.userId;

  return (
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              aria-label={`${profile.displayName} 的头像`}
              className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
              role="img"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Author Profile</p>
              <h1 className="mt-2 break-words text-3xl font-semibold">
                {profile.displayName}
              </h1>
              <p className="mt-3 max-w-2xl whitespace-pre-line text-muted-foreground">
                {profile.bio || "这位作者还没有填写简介。"}
              </p>
            </div>
          </div>
          {canFollow ? (
            session ? (
              <FollowAuthorButton
                authorSlug={profile.slug}
                authorUserId={profile.userId}
                isFollowing={profile.isFollowing}
              />
            ) : (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 font-medium text-primary-foreground"
                href={`/auth/sign-in?next=/author/${profile.slug}`}
              >
                登录后关注
              </Link>
            )
          ) : null}
        </div>
        <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center sm:max-w-lg">
          <div>
            <dt className="text-sm text-muted-foreground">作品</dt>
            <dd className="mt-1 text-xl font-semibold">
              {profile.publishedWorkCount}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">关注者</dt>
            <dd className="mt-1 text-xl font-semibold">
              {profile.followerCount}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">关注中</dt>
            <dd className="mt-1 text-xl font-semibold">
              {profile.followingCount}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="published-works"
        className="reading-card max-w-none"
      >
        <h2 className="text-2xl font-semibold" id="published-works">
          已发布作品
        </h2>
        {profile.works.length === 0 ? (
          <div className="mt-6 rounded-control border border-dashed border-border p-8 text-center">
            <p className="font-medium">作品正在驶向港湾</p>
            <p className="mt-2 text-sm text-muted-foreground">
              这位作者目前还没有公开发布的作品。
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {profile.works.map((work) => (
              <li
                className="rounded-control border border-border p-5"
                key={work.id}
              >
                <h3 className="text-lg font-semibold">{work.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  作者：
                  <Link
                    className="text-primary"
                    href={`/author/${profile.slug}`}
                  >
                    {profile.displayName}
                  </Link>
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {work.summary || "暂无作品简介。"}
                </p>
                <Link
                  className="mt-4 inline-block font-medium"
                  href={`/works/${work.slug}`}
                >
                  查看作品
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
