import type {
  Article,
  Chapter,
  ContentDocument,
  ContentStore,
  Work,
} from "@fandom-harbor/services";

const publishedAt = new Date("2026-06-24T10:00:00.000Z");
const createdAt = new Date("2026-06-10T10:00:00.000Z");

function document(...paragraphs: string[]): ContentDocument {
  return {
    content: paragraphs.map((paragraph) => ({
      content: [{ text: paragraph, type: "text" }],
      type: "paragraph",
    })),
    type: "doc",
  };
}

export const fixtureWorks: Work[] = [
  {
    categoryId: "31000000-0000-4000-8000-000000000001",
    createdAt,
    id: "33000000-0000-4000-8000-000000000001",
    publishedAt,
    slug: "glass-harbor",
    status: "published",
    summary:
      "暴雨季节来临前，旧港口档案馆重新开放。两位彼此提防的守夜人，被迫共同整理一批不该出现的手稿。",
    title: "Glass Harbor",
    updatedAt: publishedAt,
  },
  {
    categoryId: "31000000-0000-4000-8000-000000000001",
    createdAt,
    id: "33000000-0000-4000-8000-000000000002",
    publishedAt: new Date("2026-06-12T10:00:00.000Z"),
    slug: "radio-after-sunset",
    status: "published",
    summary:
      "一档深夜电台节目在停播三年后意外恢复，所有点歌都精准命中某个未被承认的过去。",
    title: "Radio After Sunset",
    updatedAt: new Date("2026-06-12T10:00:00.000Z"),
  },
  {
    categoryId: null,
    createdAt: new Date("2026-06-28T08:00:00.000Z"),
    id: "33000000-0000-4000-8000-000000000003",
    publishedAt: null,
    slug: "paper-moons",
    status: "draft",
    summary: "尚未发布的短篇作品草稿，用于 Author Studio 列表状态验证。",
    title: "Paper Moons",
    updatedAt: new Date("2026-06-29T09:30:00.000Z"),
  },
  {
    categoryId: null,
    createdAt: new Date("2026-06-26T08:00:00.000Z"),
    id: "33000000-0000-4000-8000-000000000004",
    publishedAt: null,
    slug: "unlit-margins",
    status: "draft",
    summary: "全部章节仍为草稿的作品，用于 Studio 边界状态验证。",
    title: "Unlit Margins",
    updatedAt: new Date("2026-06-27T09:00:00.000Z"),
  },
];

export const fixtureChapters: Chapter[] = [
  {
    content: document(
      "雨从玻璃穹顶落下来时，整座馆像一艘倒扣在岸上的船。林在值夜表上写下名字，墨迹慢慢向外晕开。",
      "港口城市总在夜里显得更诚实一些。灯一盏一盏沿着岸线亮起，像有人把迟到的星图重新摊开。",
      "他们站在同一张长桌两端，之间是尚未编目的纸页、盐痕和时间。真正需要整理的，从来不只是档案。",
    ),
    contentSchemaVersion: 1,
    createdAt,
    id: "34000000-0000-4000-8000-000000000001",
    position: 1,
    publishedAt,
    slug: "below-the-tide-line",
    status: "published",
    title: "第一章：潮线以下",
    updatedAt: publishedAt,
    workId: "33000000-0000-4000-8000-000000000001",
  },
  {
    content: document(
      "乔把那本没有编号的目录册放到桌上，像放下一句不该说出口的话。封面上的盐渍仍然是新的。",
      "目录从第七码头开始断裂。空白不是缺页，而是有人刻意留下的航道。",
      "林合上窗，雨声却没有变小。某些记录一旦被找到，就不再允许任何人假装从未看见。",
    ),
    contentSchemaVersion: 1,
    createdAt,
    id: "34000000-0000-4000-8000-000000000002",
    position: 2,
    publishedAt,
    slug: "the-missing-catalogue",
    status: "published",
    title: "第二章：遗失目录",
    updatedAt: publishedAt,
    workId: "33000000-0000-4000-8000-000000000001",
  },
  {
    content: document(
      "这是一章尚未发布的本地草稿，不应出现在任何 Reader 数据流中。",
    ),
    contentSchemaVersion: 1,
    createdAt: new Date("2026-06-29T07:00:00.000Z"),
    id: "34000000-0000-4000-8000-000000000004",
    position: 3,
    publishedAt: null,
    slug: "the-sealed-room-draft",
    status: "draft",
    title: "第三章：封存室（草稿）",
    updatedAt: new Date("2026-06-29T08:00:00.000Z"),
    workId: "33000000-0000-4000-8000-000000000001",
  },
  {
    content: document(
      "电流声像一层薄薄的雾。宋把耳机压紧，听见那句熟悉的晚上好从多年以前重新走来。",
      "红色的直播灯没有亮，调音台却自己推高了一格。窗外的城市仍在沉睡，只有旧频道记得该从哪里开始。",
    ),
    contentSchemaVersion: 1,
    createdAt,
    id: "34000000-0000-4000-8000-000000000003",
    position: 1,
    publishedAt,
    slug: "opening-lines",
    status: "published",
    title: "开场白",
    updatedAt: publishedAt,
    workId: "33000000-0000-4000-8000-000000000002",
  },
  {
    content: document("这是一章仅在 Author Studio 可见的未发布草稿。"),
    contentSchemaVersion: 1,
    createdAt: new Date("2026-06-26T08:30:00.000Z"),
    id: "34000000-0000-4000-8000-000000000005",
    position: 1,
    publishedAt: null,
    slug: "margin-note-draft",
    status: "draft",
    title: "第一章：页边灯（草稿）",
    updatedAt: new Date("2026-06-27T09:00:00.000Z"),
    workId: "33000000-0000-4000-8000-000000000004",
  },
];

export const fixtureArticles: Article[] = [
  {
    categoryId: "31000000-0000-4000-8000-000000000002",
    content: document(
      "一座归档站真正保存的并不只是文本。它也保存作品之间的路径、读者抵达它们的方式，以及作者愿意公开的那一部分身份。",
      "阅读界面因此不该争夺注意力。标题、正文、章节方向和必要的舒适度控制已经足够，其他东西都应当退后一步。",
      "这也是 Fandom Harbor 的起点：让内容拥有稳定的地址，让阅读拥有安静的空间。",
    ),
    contentSchemaVersion: 1,
    createdAt,
    id: "35000000-0000-4000-8000-000000000001",
    publishedAt,
    slug: "why-an-archive-needs-quiet",
    status: "published",
    summary: "关于作品归档、稳定地址与安静阅读界面的短文。",
    title: "为什么归档需要安静",
    updatedAt: publishedAt,
  },
  {
    categoryId: null,
    content: document("这是一篇尚未进入编辑流程的本地文章草稿占位。"),
    contentSchemaVersion: 1,
    createdAt: new Date("2026-06-29T04:00:00.000Z"),
    id: "35000000-0000-4000-8000-000000000002",
    publishedAt: null,
    slug: "notes-from-the-breakwater",
    status: "draft",
    summary: "Author Studio 文章草稿状态示例。",
    title: "防波堤笔记",
    updatedAt: new Date("2026-06-29T06:00:00.000Z"),
  },
];

function unsupportedWrite(): never {
  throw new Error("Reader fixture store is read-only");
}

export const readerFixtureStore: ContentStore = {
  async createArticle() {
    return unsupportedWrite();
  },
  async createChapter() {
    return unsupportedWrite();
  },
  async createWork() {
    return unsupportedWrite();
  },
  async getPublishedArticleBySlug(slug) {
    return (
      fixtureArticles.find(
        (article) => article.slug === slug && article.status === "published",
      ) ?? null
    );
  },
  async getPublishedWorkBySlug(slug) {
    return (
      fixtureWorks.find(
        (work) => work.slug === slug && work.status === "published",
      ) ?? null
    );
  },
  async listCategories() {
    return [];
  },
  async listPublishedArticles({ limit, offset }) {
    return fixtureArticles
      .filter((article) => article.status === "published")
      .slice(offset, offset + limit);
  },
  async listPublishedChapters(workId) {
    return fixtureChapters
      .filter(
        (chapter) =>
          chapter.workId === workId && chapter.status === "published",
      )
      .sort((left, right) => left.position - right.position);
  },
  async listPublishedWorks({ limit, offset }) {
    return fixtureWorks
      .filter((work) => work.status === "published")
      .slice(offset, offset + limit);
  },
  async listTags() {
    return [];
  },
};
