export interface MockChapter {
  id: string;
  title: string;
  wordCount: number;
  excerpt: string;
}

export interface MockWork {
  authorName: string;
  authorSlug: string;
  slug: string;
  title: string;
  summary: string;
  fandom: string;
  pairing: string;
  rating: "G" | "T" | "M";
  status: "连载中" | "已完结";
  updatedAt: string;
  readingMinutes: number;
  tags: string[];
  chapters: MockChapter[];
}

export const mockWorks: MockWork[] = [
  {
    authorName: "Fandom Harbor Archive",
    authorSlug: "fandom-harbor-archive",
    slug: "glass-harbor",
    title: "Glass Harbor",
    summary:
      "暴雨季节来临前，旧港口档案馆重新开放。两位彼此提防的守夜人，被迫共同整理一批不该出现的手稿。",
    fandom: "Original Harborverse",
    pairing: "Lin / Qiao",
    rating: "T",
    status: "连载中",
    updatedAt: "2026-06-24",
    readingMinutes: 18,
    tags: ["archive mystery", "slow burn", "rainy city"],
    chapters: [
      {
        id: "chapter-1",
        title: "第一章：潮线以下",
        wordCount: 3200,
        excerpt:
          "雨从玻璃穹顶落下来时，整座馆像一艘倒扣在岸上的船。林在值夜表上写下名字，墨迹慢慢向外晕开。",
      },
      {
        id: "chapter-2",
        title: "第二章：遗失目录",
        wordCount: 4100,
        excerpt:
          "乔把那本没有编号的目录册放到桌上，像放下一句不该说出口的话。封面上的盐渍仍然是新的。",
      },
    ],
  },
  {
    authorName: "Fandom Harbor Archive",
    authorSlug: "fandom-harbor-archive",
    slug: "radio-after-sunset",
    title: "Radio After Sunset",
    summary:
      "一档深夜电台节目在停播三年后意外恢复，所有点歌都精准命中某个未被承认的过去。",
    fandom: "City Frequency",
    pairing: "He / Song",
    rating: "G",
    status: "已完结",
    updatedAt: "2026-06-12",
    readingMinutes: 12,
    tags: ["friends to lovers", "night radio", "soft ending"],
    chapters: [
      {
        id: "chapter-1",
        title: "开场白",
        wordCount: 2800,
        excerpt:
          "电流声像一层薄薄的雾。宋把耳机压紧，听见那句熟悉的晚上好从多年以前重新走来。",
      },
    ],
  },
  {
    authorName: "Fandom Harbor Archive",
    authorSlug: "fandom-harbor-archive",
    slug: "salt-and-constellations",
    title: "Salt and Constellations",
    summary:
      "两位航海学院毕业生在最后一次实习航程上重逢，地图、星盘和沉默都比海风更难应付。",
    fandom: "North Sea Cadets",
    pairing: "Xu / Wen",
    rating: "M",
    status: "连载中",
    updatedAt: "2026-06-18",
    readingMinutes: 26,
    tags: ["nautical", "second chance", "contained tension"],
    chapters: [
      {
        id: "chapter-1",
        title: "偏北风",
        wordCount: 5000,
        excerpt:
          "训练舰离港那天，闻没有回头。直到徐把航海日志递来，他才意识到有些东西并不会因为毕业就结束。",
      },
      {
        id: "chapter-2",
        title: "夜测",
        wordCount: 4300,
        excerpt:
          "海面黑得像一块没有边的玻璃，星图展开时，所有避开的名字都被重新照亮。",
      },
    ],
  },
];

export const landingSignals = [
  {
    label: "当前阶段",
    value: "Sprint 002B",
    detail: "建立作品、章节与文章的阅读路由和可替换数据流。",
  },
  {
    label: "内容来源",
    value: "ContentStore Fixture",
    detail:
      "当前数据通过 002A Service 合同注入，后续可替换为 Supabase Repository。",
  },
  {
    label: "访问边界",
    value: "Auth + RLS",
    detail: "Reader / Author / Admin 路径继续沿用 Phase 1 身份与权限边界。",
  },
];
