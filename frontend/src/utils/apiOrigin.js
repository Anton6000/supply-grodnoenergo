/**
 * Относительный /api/... на порту 3000 иногда даёт 404 (CRA proxy не доходит до Spring).
 * В development — хост backend (CORS уже настроен).
 * Переопределение: REACT_APP_API_ORIGIN=http://localhost:8080
 */
export function apiAbsoluteUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fromEnv =
    typeof process.env.REACT_APP_API_ORIGIN === "string"
      ? process.env.REACT_APP_API_ORIGIN.trim().replace(/\/$/, "")
      : "";
  const origin =
    fromEnv ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "");
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}
