import "server-only";

export function assertTrustedActionRequest(requestHeaders: Headers) {
  const originValue = requestHeaders.get("origin");
  const hostValue =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const fetchSite = requestHeaders.get("sec-fetch-site");

  if (!originValue || !hostValue) throw new Error("untrusted request origin");

  let origin: URL;
  try {
    origin = new URL(originValue);
  } catch {
    throw new Error("untrusted request origin");
  }

  if (
    origin.host.toLowerCase() !==
      hostValue.split(",")[0]?.trim().toLowerCase() ||
    (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site")
  ) {
    throw new Error("untrusted request origin");
  }
}

export function requestClientKey(requestHeaders: Headers) {
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  const agent = requestHeaders.get("user-agent") || "unknown";
  return `${address}\0${agent.slice(0, 256)}`;
}
