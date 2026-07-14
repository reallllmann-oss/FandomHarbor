import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createWebIdentityAccess } from "../../../lib/identity-access";
import { pageMetadata, privatePageMetadata } from "../../../lib/seo";
import { createSocialRelationshipGateway } from "../../../lib/social-relationships";
import { FollowAuthorButton } from "./follow-author-button";

export const dynamic = "force-dynamic";

function DiscoveryRecovery({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      aria-label="继续发现"
      className={
        compact
          ? "author-recovery-actions"
          : "author-recovery author-recovery-actions"
      }
    >
      <Link className="author-secondary-action" href="/archive">
        浏览作品档案
      </Link>
      <Link className="author-text-action" href="/search">
        搜索作品或作者
      </Link>
    </nav>
  );
}

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
    <div className="author-profile-shell">
      <section
        aria-labelledby="author-profile-title"
        className="author-identity"
      >
        <div className="author-identity-main">
          <div className="author-identity-heading">
            <div
              aria-label={`${profile.displayName} 的头像`}
              className="author-avatar"
              role="img"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">公开创作者</p>
              <h1 className="author-name" id="author-profile-title">
                {profile.displayName}
              </h1>
            </div>
          </div>
          <p className="author-bio">
            {profile.bio || "这位作者还没有填写公开简介。"}
          </p>
          <dl className="author-metrics" aria-label="作者公开信息">
            <div>
              <dt>公开作品</dt>
              <dd>{profile.publishedWorkCount}</dd>
            </div>
            <div>
              <dt>关注者</dt>
              <dd>{profile.followerCount}</dd>
            </div>
            <div>
              <dt>关注中</dt>
              <dd>{profile.followingCount}</dd>
            </div>
          </dl>
        </div>
        {canFollow ? (
          <aside aria-label="作者关系" className="author-relationship">
            <p className="author-relationship-label">关注关系</p>
            <p className="author-relationship-copy">
              关注这位作者，保留你与其公开创作身份的联系。
            </p>
            {session ? (
              <FollowAuthorButton
                authorSlug={profile.slug}
                authorUserId={profile.userId}
                isFollowing={profile.isFollowing}
              />
            ) : (
              <Link
                className="author-follow-action"
                href={`/auth/sign-in?next=/author/${profile.slug}`}
              >
                登录后关注
              </Link>
            )}
          </aside>
        ) : null}
      </section>

      <section aria-labelledby="published-works" className="author-works">
        <header className="author-works-heading">
          <div>
            <p className="eyebrow">创作档案</p>
            <h2 id="published-works">已发布作品</h2>
          </div>
          <p>
            共 {profile.publishedWorkCount}{" "}
            部公开作品。这里仅呈现作者已发布的创作。
          </p>
        </header>
        {profile.works.length === 0 ? (
          <div className="author-empty">
            <h3>作品正在驶向港湾</h3>
            <p>这位作者目前还没有公开发布的作品。</p>
            <DiscoveryRecovery compact />
          </div>
        ) : (
          <ul className="author-work-list">
            {profile.works.map((work) => (
              <li className="author-work" key={work.id}>
                <p className="author-work-date">
                  发布于{" "}
                  {work.publishedAt.toLocaleDateString("zh-CN", {
                    timeZone: "UTC",
                  })}
                </p>
                <h3 className="author-work-title">
                  <Link href={`/works/${work.slug}`}>{work.title}</Link>
                </h3>
                <p className="author-work-summary">
                  {work.summary || "暂无作品简介。"}
                </p>
                <Link
                  className="author-work-entry"
                  href={`/works/${work.slug}`}
                >
                  查看作品
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {profile.works.length > 0 ? <DiscoveryRecovery /> : null}
    </div>
  );
}
