import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

async function source(pathname: string) {
  return readFile(new URL(pathname, import.meta.url), "utf8");
}

describe("Web Public Site Copy consumption contract", () => {
  it("maps the exact Homepage fields while keeping both CTA targets locked", async () => {
    const [page, layout] = await Promise.all([
      source("./page.tsx"),
      source("./layout.tsx"),
    ]);

    expect(page).toContain("readWebPublicSiteCopy()");
    expect(page).toContain("siteCopy.content.homepage_title");
    expect(page).toContain("siteCopy.content.homepage_introduction");
    expect(page).toContain("siteCopy.content.homepage_primary_cta_label");
    expect(page).toContain("siteCopy.content.homepage_secondary_cta_label");
    expect(page).toMatch(
      /href="\/archive"[\s\S]*?siteCopy\.content\.homepage_primary_cta_label/,
    );
    expect(page).toMatch(
      /href="\/search"[\s\S]*?siteCopy\.content\.homepage_secondary_cta_label/,
    );
    expect(page).not.toContain("siteCopy.version");

    const consumedFields = [
      ...`${page}\n${layout}`.matchAll(/siteCopy\.content\.([a-z_]+)/gu),
    ].map((match) => match[1]);
    expect([...new Set(consumedFields)].sort()).toEqual(
      [
        "footer_brand_note",
        "homepage_introduction",
        "homepage_primary_cta_label",
        "homepage_secondary_cta_label",
        "homepage_title",
        "navigation_archive_label",
        "navigation_search_label",
        "navigation_studio_label",
      ].sort(),
    );
  });

  it("shares one server reader across Header and Footer without changing access rules", async () => {
    const [layout, navigation, readerLayout, reader] = await Promise.all([
      source("./layout.tsx"),
      source("../lib/global-shell-navigation.ts"),
      source("./reader-site-layout.tsx"),
      source("../lib/public-site-copy.ts"),
    ]);

    expect(layout).toContain('export const dynamic = "force-dynamic"');
    expect(layout).toContain("readWebPublicSiteCopy()");
    expect(layout).toContain(
      'session?.access.capabilities.has("work:author") ?? false',
    );
    expect(layout).toContain("siteCopy.content.navigation_archive_label");
    expect(layout).toContain("siteCopy.content.navigation_search_label");
    expect(layout).toContain("siteCopy.content.navigation_studio_label");
    expect(layout).toContain("siteCopy.content.footer_brand_note");
    expect(layout).not.toContain("siteCopy.version");

    expect(navigation).toMatch(
      /href: "\/archive"[\s\S]*href: "\/search"[\s\S]*href: "\/studio"/,
    );
    expect(readerLayout).toContain('{ href: "/privacy", label: "Privacy" }');
    expect(readerLayout).toContain('{ href: "/terms", label: "Terms" }');
    expect(readerLayout).toContain(
      '{ href: "/content-policy", label: "Content Policy" }',
    );
    expect(readerLayout).toContain("<span>{footerBrandNote}</span>");
    expect(reader).toContain(
      "export const readWebPublicSiteCopy = cache(readCurrentPublicSiteCopy)",
    );
  });

  it("keeps Site Copy database access out of every Web Client Component", async () => {
    const paths = await readdir(join(process.cwd(), "src"), {
      recursive: true,
      withFileTypes: true,
    });
    const clientSources: string[] = [];

    for (const path of paths) {
      if (!path.isFile() || !/\.tsx?$/u.test(path.name)) continue;
      const pathname = join(path.parentPath, path.name);
      const contents = await readFile(pathname, "utf8");
      if (/^["']use client["'];/u.test(contents)) clientSources.push(contents);
    }

    expect(clientSources.length).toBeGreaterThan(0);
    for (const clientSource of clientSources) {
      expect(clientSource).not.toContain("public-site-copy");
      expect(clientSource).not.toContain("get_public_site_copy");
      expect(clientSource).not.toContain(
        "createSupabasePublicSiteCopyRepository",
      );
    }
  });
});
