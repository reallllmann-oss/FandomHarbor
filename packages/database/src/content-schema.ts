import type {
  ContentDocument,
  ContentStatus,
  ContentTagGovernanceState,
  ContentTagType,
} from "@fandom-harbor/services";

export interface WorkRow {
  category_id: string | null;
  created_at: string;
  id: string;
  owner_user_id: string;
  published_at: string | null;
  slug: string;
  status: ContentStatus;
  summary: string;
  title: string;
  updated_at: string;
}

export interface ChapterRow {
  content: ContentDocument;
  content_schema_version: number;
  created_at: string;
  id: string;
  position: number;
  published_at: string | null;
  slug: string;
  status: ContentStatus;
  title: string;
  updated_at: string;
  work_id: string;
}

export interface ArticleRow {
  category_id: string | null;
  content: ContentDocument;
  content_schema_version: number;
  created_at: string;
  id: string;
  owner_user_id: string;
  published_at: string | null;
  slug: string;
  status: ContentStatus;
  summary: string;
  title: string;
  updated_at: string;
}

export interface ContentCategoryRow {
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  updated_at: string;
}

export interface ContentTagRow {
  canonical_tag_id: string | null;
  created_at: string;
  description: string | null;
  governance_state: ContentTagGovernanceState;
  id: string;
  name: string;
  slug: string;
  tag_type: ContentTagType;
  updated_at: string;
}

export interface WorkTagRow {
  created_at: string;
  tag_id: string;
  work_id: string;
}

export interface ArticleTagRow {
  article_id: string;
  created_at: string;
  tag_id: string;
}

export interface ContentDatabaseTables {
  article_tags: ArticleTagRow;
  articles: ArticleRow;
  chapters: ChapterRow;
  content_categories: ContentCategoryRow;
  content_tags: ContentTagRow;
  work_tags: WorkTagRow;
  works: WorkRow;
}
