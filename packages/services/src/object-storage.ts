export type ObjectStorageKey = string & {
  readonly __brand: "ObjectStorageKey";
};

export interface ObjectMetadata {
  checksum?: string;
  contentType: string;
  key: ObjectStorageKey;
  size: number;
}

export interface PutObjectInput extends ObjectMetadata {
  body: ReadableStream<Uint8Array> | Uint8Array;
}

export interface AuthorizedObjectRead {
  expiresAt: Date;
  url: URL;
}

export interface AuthorizedObjectReadInput {
  downloadName?: string;
  expiresInSeconds: number;
  key: ObjectStorageKey;
}

export interface ObjectStorage {
  delete(key: ObjectStorageKey): Promise<void>;
  getMetadata(key: ObjectStorageKey): Promise<ObjectMetadata | null>;
  put(input: PutObjectInput): Promise<ObjectMetadata>;
  createAuthorizedRead(
    input: AuthorizedObjectReadInput,
  ): Promise<AuthorizedObjectRead>;
}

export function objectStorageKey(value: string): ObjectStorageKey {
  const normalized = value.trim().replace(/^\/+/, "");

  if (!normalized || normalized.includes("..") || normalized.includes("\\")) {
    throw new Error("Invalid object storage key");
  }

  return normalized as ObjectStorageKey;
}
