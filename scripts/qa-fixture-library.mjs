const createdAt = "2026-07-12T08:00:00.000Z";
const publishedAt = "2026-07-12T08:30:00.000Z";
const categoryId = "21000000-0000-4000-8000-000000000003";

const paragraphSeeds = [
  "这是 Fandom Harbor 本地 QA 专用的合成长文。段落只用于检查长时间阅读时的行宽、行高、留白和滚动稳定性，不来自任何真实作者或用户作品。",
  "港湾灯塔按固定节奏亮起，记录员依次核对页码、章节位置和阅读状态。内容刻意保持平静，方便观察界面是否在连续滚动中退到文字之后。",
  "测试读者沿着同一条叙事路径继续前进，偶尔打开目录或阅读设置，再回到正文。每次操作都应保持当前位置清楚，不产生横向溢出或突然的视觉跳动。",
  "这一段继续模拟稳定的文学阅读节奏。句子长度有轻微变化，但不会引入真实人物、现实事件或受版权保护的文本，只承担排版与交互验证职责。",
  "章节中的信息密度保持克制，正文仍然是第一视觉。导航可以被找到，控制只在需要时出现，关闭之后页面应恢复完整而安静的阅读空间。",
  "当文本量持续增加，页面高度会自然增长；正文宽度、段落间距和字体设置则必须保持稳定。这个约束是长篇阅读 QA 最需要反复确认的部分。",
];

function readingDocument(label, paragraphCount) {
  return {
    content: Array.from({ length: paragraphCount }, (_, index) => ({
      content: [
        {
          text: `${label} · QA 段落 ${index + 1}。${paragraphSeeds[index % paragraphSeeds.length]}`,
          type: "text",
        },
      ],
      type: "paragraph",
    })),
    type: "doc",
  };
}

export const readingFixtureWorks = [
  {
    categoryId,
    createdAt,
    id: "71000000-0000-4000-8000-000000000001",
    publishedAt,
    slug: "qa-reading-short",
    status: "published",
    summary: "[QA Fixture] 快速验证 Reading 页面、标题和单章节入口。",
    title: "[QA Fixture] Short Reading",
    updatedAt: publishedAt,
  },
  {
    categoryId,
    createdAt,
    id: "71000000-0000-4000-8000-000000000002",
    publishedAt,
    slug: "qa-reading-longform",
    status: "published",
    summary:
      "[QA Fixture] Non-production 长篇阅读、多章节连续性和 Draft 隔离测试作品。",
    title: "[QA Fixture] Long-form Reading Harbor",
    updatedAt: publishedAt,
  },
  {
    categoryId,
    createdAt,
    id: "71000000-0000-4000-8000-000000000003",
    publishedAt,
    slug: "qa-reading-empty",
    status: "published",
    summary: "[QA Fixture] 已发布但没有公开章节，用于 Empty State QA。",
    title: "[QA Fixture] Empty Published Work",
    updatedAt: publishedAt,
  },
  {
    categoryId,
    createdAt,
    id: "71000000-0000-4000-8000-000000000004",
    publishedAt: null,
    slug: "qa-reading-draft-only",
    status: "draft",
    summary: "[QA Fixture] Draft-only 隔离测试作品，不得进入 Reader 数据流。",
    title: "[QA Fixture] Hidden Draft Work",
    updatedAt: createdAt,
  },
];

export const readingFixtureChapters = [
  {
    content: readingDocument("Short Reading", 4),
    createdAt,
    id: "72000000-0000-4000-8000-000000000001",
    position: 1,
    publishedAt,
    slug: "quick-check",
    status: "published",
    title: "[QA] Quick Reading Check",
    updatedAt: publishedAt,
    workId: "71000000-0000-4000-8000-000000000001",
  },
  {
    content: readingDocument("Long-form Reading", 150),
    createdAt,
    id: "72000000-0000-4000-8000-000000000002",
    position: 1,
    publishedAt,
    slug: "long-watch",
    status: "published",
    title: "[QA] Long Watch",
    updatedAt: publishedAt,
    workId: "71000000-0000-4000-8000-000000000002",
  },
  {
    content: readingDocument("Medium Reading", 60),
    createdAt,
    id: "72000000-0000-4000-8000-000000000003",
    position: 2,
    publishedAt,
    slug: "tide-ledger",
    status: "published",
    title: "[QA] Tide Ledger",
    updatedAt: publishedAt,
    workId: "71000000-0000-4000-8000-000000000002",
  },
  {
    content: readingDocument("Chapter Continuity", 18),
    createdAt,
    id: "72000000-0000-4000-8000-000000000004",
    position: 3,
    publishedAt,
    slug: "return-log",
    status: "published",
    title: "[QA] Return Log",
    updatedAt: publishedAt,
    workId: "71000000-0000-4000-8000-000000000002",
  },
  {
    content: readingDocument("Draft Isolation", 12),
    createdAt,
    id: "72000000-0000-4000-8000-000000000005",
    position: 4,
    publishedAt: null,
    slug: "sealed-draft",
    status: "draft",
    title: "[QA] Sealed Draft",
    updatedAt: createdAt,
    workId: "71000000-0000-4000-8000-000000000002",
  },
  {
    content: readingDocument("Draft-only Work", 6),
    createdAt,
    id: "72000000-0000-4000-8000-000000000006",
    position: 1,
    publishedAt: null,
    slug: "hidden-draft-chapter",
    status: "draft",
    title: "[QA] Hidden Draft Chapter",
    updatedAt: createdAt,
    workId: "71000000-0000-4000-8000-000000000004",
  },
];

export const readingFixtureWorkIds = readingFixtureWorks.map((work) => work.id);
