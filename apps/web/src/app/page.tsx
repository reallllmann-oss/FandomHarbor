import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import Link from "next/link";

import { createPublicBrowseGateway } from "../lib/public-browse";
import { readWebPublicSiteCopy } from "../lib/public-site-copy";
import { HomepageWorkPreview } from "./homepage-content";
import { HomepageSection, HomepageShell } from "./homepage-shell";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [browse, siteCopy] = await Promise.all([
    createPublicBrowseGateway(readPublicRuntimeConfig()).list({
      page: 1,
      sort: "newest",
    }),
    readWebPublicSiteCopy(),
  ]);
  const latestWorks = browse.items.slice(0, 3);

  return (
    <HomepageShell>
      <HomepageSection labelledBy="homepage-title">
        <div className="homepage-hero">
          <p className="eyebrow">安静的文学港湾</p>
          <h1 className="homepage-title" id="homepage-title">
            {siteCopy.content.homepage_title}
          </h1>
          <p className="homepage-introduction">
            {siteCopy.content.homepage_introduction}
          </p>
          <nav aria-label="首页主要入口" className="homepage-actions">
            <Link
              className="homepage-action homepage-action-primary"
              href="/archive"
            >
              {siteCopy.content.homepage_primary_cta_label}
            </Link>
            <Link className="homepage-action" href="/search">
              {siteCopy.content.homepage_secondary_cta_label}
            </Link>
          </nav>
          <p className="homepage-orientation-note">
            Homepage 只提供安静的入口；完整浏览留在
            Archive，带着关键词的寻找留在 Search。
          </p>
        </div>
      </HomepageSection>

      <HomepageSection labelledBy="homepage-discovery-title" tone="quiet">
        <header className="homepage-section-header">
          <p className="eyebrow">发现路径</p>
          <h2 className="homepage-section-title" id="homepage-discovery-title">
            选择一条适合此刻的路径。
          </h2>
          <p className="homepage-section-lede">
            这里没有热度榜或无尽信息流。你可以安静浏览完整归档，也可以带着一个名字或关键词主动寻找。
          </p>
        </header>
        <div className="homepage-path-list">
          <article className="homepage-path">
            <p className="homepage-path-index">01</p>
            <div>
              <h3 className="homepage-path-title">沿 Archive 浏览</h3>
              <p className="homepage-path-copy">
                按发布时间或标题浏览完整的公开作品集合，慢慢比较故事与作者线索。
              </p>
              <Link className="homepage-text-link" href="/archive">
                进入 Archive
              </Link>
            </div>
          </article>
          <article className="homepage-path">
            <p className="homepage-path-index">02</p>
            <div>
              <h3 className="homepage-path-title">带着关键词寻找</h3>
              <p className="homepage-path-copy">
                主动查询已经公开的作品与作者，不需要穿过推荐、排名或 Feed。
              </p>
              <Link className="homepage-text-link" href="/search">
                打开 Search
              </Link>
            </div>
          </article>
          <article className="homepage-path">
            <p className="homepage-path-index">03</p>
            <div>
              <h3 className="homepage-path-title">从最近公开的故事开始</h3>
              <p className="homepage-path-copy">
                先读一段简介、认识公开作者，再进入作品详情决定是否开始阅读。
              </p>
              <Link
                className="homepage-text-link"
                href="#homepage-latest-title"
              >
                查看最新公开作品
              </Link>
            </div>
          </article>
        </div>
      </HomepageSection>

      <HomepageSection labelledBy="homepage-latest-title">
        <div className="homepage-section-heading-row">
          <header>
            <p className="eyebrow">最新公开作品</p>
            <h2 className="homepage-section-title" id="homepage-latest-title">
              最近抵达港湾的故事
            </h2>
            <p className="homepage-section-lede">
              这里仅展示按发布时间排列的三部最新公开作品，作为进入 Work Detail
              与完整 Archive 的邀请；它们不是推荐或排名。
            </p>
          </header>
          <Link className="homepage-text-link" href="/archive">
            浏览全部公开作品
          </Link>
        </div>
        {latestWorks.length > 0 ? (
          <div className="homepage-preview-list">
            {latestWorks.map((work) => (
              <HomepageWorkPreview key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="homepage-empty">
            <p role="status">
              这里暂时没有公开作品。已保存但尚未发布的草稿不会在 Homepage 出现。
            </p>
            <nav
              aria-label="首页空状态恢复入口"
              className="homepage-reading-links"
            >
              <Link className="homepage-text-link" href="/archive">
                前往 Archive
              </Link>
              <Link className="homepage-text-link" href="/search">
                打开 Search
              </Link>
              <Link className="homepage-text-link" href="/auth/sign-up">
                创建账号
              </Link>
            </nav>
          </div>
        )}
      </HomepageSection>

      <HomepageSection labelledBy="homepage-reading-title" tone="quiet">
        <div className="homepage-return-grid">
          <header>
            <p className="eyebrow">回到阅读</p>
            <h2 className="homepage-section-title" id="homepage-reading-title">
              继续自己的阅读路径。
            </h2>
            <p className="homepage-section-lede">
              阅读记录与书签属于私人回访。Reader Library
              会沿用既有登录边界，不在 Homepage 展示个人阅读内容。
            </p>
            <nav
              aria-label="Reader 回访入口"
              className="homepage-reading-links"
            >
              <Link
                className="homepage-action homepage-action-primary"
                href="/works"
              >
                进入 Reader Library
              </Link>
              <Link className="homepage-text-link" href="/archive">
                发现新的故事
              </Link>
            </nav>
          </header>
          <div
            aria-labelledby="homepage-access-title"
            className="homepage-access-context"
          >
            <p className="homepage-access-label">账号路径</p>
            <h3 className="homepage-access-title" id="homepage-access-title">
              登录、注册与邀请各有清楚边界。
            </h3>
            <p className="homepage-access-copy">
              页首负责显示当前账号状态。这里仅提供中性的既有路径：先创建或登录账号；需要门禁资格时，再按现有流程使用邀请码。
            </p>
            <nav aria-label="账号与邀请入口" className="homepage-access-links">
              <Link className="homepage-text-link" href="/auth/sign-in">
                账号登录
              </Link>
              <Link className="homepage-text-link" href="/auth/sign-up">
                创建账号
              </Link>
              <Link className="homepage-text-link" href="/access">
                使用邀请码
              </Link>
            </nav>
          </div>
        </div>
      </HomepageSection>

      <HomepageSection labelledBy="homepage-closing-title">
        <div className="homepage-closing">
          <p className="eyebrow">安静继续</p>
          <h2 className="homepage-section-title" id="homepage-closing-title">
            从适合此刻的入口出发。
          </h2>
          <p className="homepage-section-lede">
            还没有决定读什么时，可以回到完整归档，或用关键词寻找一部作品与它的公开作者。
          </p>
          <nav aria-label="首页恢复入口" className="homepage-reading-links">
            <Link className="homepage-text-link" href="/archive">
              回到 Archive
            </Link>
            <Link className="homepage-text-link" href="/search">
              前往 Search
            </Link>
            <Link className="homepage-text-link" href="#homepage-title">
              回到页面开头
            </Link>
          </nav>
        </div>
      </HomepageSection>
    </HomepageShell>
  );
}
