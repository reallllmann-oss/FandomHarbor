import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("Mission 3C-2 browse migration contract", () => {
  it("keeps public browsing bounded, stable and published-only", async () => {
    const sql = await readFile(
      resolve(
        process.cwd(),
        "../../supabase/migrations/20260703120000_browse_experience.sql",
      ),
      "utf8",
    );

    expect(sql).toContain("function public.browse_public_works");
    expect(sql).toContain("w.status = 'published'");
    expect(sql).toContain("'newest', 'oldest', 'title-asc', 'title-desc'");
    expect(sql).toContain("ew.id asc");
    expect(sql).toContain("result_limit");
    expect(sql).toContain("result_offset");
    expect(sql).toContain("to anon, authenticated");
    expect(sql).not.toContain("owner_user_id',");
  });
});
