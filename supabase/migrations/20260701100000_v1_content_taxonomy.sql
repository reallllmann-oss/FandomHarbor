insert into public.content_categories (id, name, slug)
values
  ('21000000-0000-4000-8000-000000000001', '小说', 'fiction'),
  ('21000000-0000-4000-8000-000000000002', '同人', 'fanfiction'),
  ('21000000-0000-4000-8000-000000000003', '原创', 'original'),
  ('21000000-0000-4000-8000-000000000004', '随笔', 'essay'),
  ('21000000-0000-4000-8000-000000000005', '设定集', 'worldbuilding')
on conflict (slug) do update
set name = excluded.name
where public.content_categories.name is distinct from excluded.name;

insert into public.content_tags (
  id,
  name,
  slug,
  tag_type,
  governance_state
)
values
  ('22000000-0000-4000-8000-000000000001', 'Harbor', 'harbor', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000002', '连载中', 'ongoing', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000003', '已完结', 'completed', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000004', '短篇', 'short-form', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000005', '长篇', 'long-form', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000006', '轻松', 'light', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000007', '治愈', 'healing', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000008', '剧情', 'plot', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000009', '角色向', 'character-focused', 'additional', 'canonical'),
  ('22000000-0000-4000-8000-000000000010', '世界观', 'worldbuilding', 'additional', 'canonical')
on conflict (slug) do update
set
  name = excluded.name,
  tag_type = excluded.tag_type,
  governance_state = excluded.governance_state,
  canonical_tag_id = null
where
  public.content_tags.name is distinct from excluded.name
  or public.content_tags.tag_type is distinct from excluded.tag_type
  or public.content_tags.governance_state is distinct from excluded.governance_state
  or public.content_tags.canonical_tag_id is not null;
