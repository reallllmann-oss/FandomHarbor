import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("Mission 3C-1 search migration contract", () => {
  it("keeps Search MVP public, bounded, deterministic and published-only", async () => {
    const sql = await readFile(
      resolve(
        process.cwd(),
        "../../supabase/migrations/20260703110000_search_mvp.sql",
      ),
      "utf8",
    );

    expect(sql).toContain("function public.search_public_catalog");
    expect(sql).toContain("w.status = 'published'");
    expect(sql).toContain("strpos(lower(w.title), si.query)");
    expect(sql).toContain("strpos(lower(w.slug), si.query)");
    expect(sql).toContain("strpos(lower(ea.display_name), si.query)");
    expect(sql).toContain("char_length(si.query) between 1 and 80");
    expect(sql).toContain("to anon, authenticated");
    expect(sql).not.toContain("tsvector");
    expect(sql).not.toContain("similarity(");
  });
});
