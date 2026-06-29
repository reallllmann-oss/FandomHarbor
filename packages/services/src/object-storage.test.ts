import { describe, expect, it } from "vitest";

import {
  objectStorageKey,
  type ObjectMetadata,
  type ObjectStorage,
} from "./object-storage";

describe("object storage contract", () => {
  it("normalizes stable provider-independent keys", () => {
    expect(objectStorageKey("/works/asset-1")).toBe("works/asset-1");
    expect(() => objectStorageKey("../secret")).toThrow();
  });

  it("supports a provider-independent test fake", async () => {
    const objects = new Map<string, ObjectMetadata>();
    const storage: ObjectStorage = {
      async createAuthorizedRead({ key, expiresInSeconds }) {
        return {
          expiresAt: new Date(Date.now() + expiresInSeconds * 1_000),
          url: new URL(`https://storage.test/${key}`),
        };
      },
      async delete(key) {
        objects.delete(key);
      },
      async getMetadata(key) {
        return objects.get(key) ?? null;
      },
      async put(input) {
        const metadata = {
          checksum: input.checksum,
          contentType: input.contentType,
          key: input.key,
          size: input.size,
        };
        objects.set(metadata.key, metadata);
        return metadata;
      },
    };

    const key = objectStorageKey("works/asset-1");
    await storage.put({
      body: new Uint8Array([1]),
      contentType: "image/png",
      key,
      size: 1,
    });

    await expect(storage.getMetadata(key)).resolves.toMatchObject({ key });
    await expect(
      storage.createAuthorizedRead({ expiresInSeconds: 60, key }),
    ).resolves.toMatchObject({
      url: new URL("https://storage.test/works/asset-1"),
    });
  });
});
