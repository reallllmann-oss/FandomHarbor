export function normalizeWorkTagNames(value: string): string[] {
  const names = Array.from(
    new Map(
      value
        .split(/[,，]/u)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => [tag.toLocaleLowerCase(), tag]),
    ).values(),
  );
  if (names.length > 20 || names.some((tag) => tag.length > 80)) {
    throw new RangeError("Invalid work tags");
  }
  return names;
}
