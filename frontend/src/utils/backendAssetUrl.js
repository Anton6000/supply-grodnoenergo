import { apiAbsoluteUrl } from "./apiOrigin";

/** Картинки и прочие пути вида `/images/...` с боевого API (Spring на 8080). */
export function backendAssetUrl(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== "string") {
    return "";
  }
  const t = pathOrUrl.trim();
  if (/^https?:\/\//i.test(t) || /^data:/i.test(t)) {
    return t;
  }
  return apiAbsoluteUrl(t.startsWith("/") ? t : `/${t}`);
}
