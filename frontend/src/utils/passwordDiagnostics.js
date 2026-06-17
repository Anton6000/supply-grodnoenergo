const PASSWORD_LEVELS = {
  empty: {
    tier: "empty",
    label: "Поле не должно быть пустым",
    progress: 0,
    color: "#64748b",
  },
  short: {
    tier: "short",
    label: "Слишком короткий пароль",
    progress: 14,
    color: "#dc2626",
  },
  weak: {
    tier: "weak",
    label: "Слабый",
    progress: 30,
    color: "#ea580c",
  },
  belowMedium: {
    tier: "below-medium",
    label: "Ниже среднего",
    progress: 46,
    color: "#ca8a04",
  },
  medium: {
    tier: "medium",
    label: "Средний",
    progress: 62,
    color: "#65a30d",
  },
  strong: {
    tier: "strong",
    label: "Сильный",
    progress: 82,
    color: "#16a34a",
  },
  ideal: {
    tier: "ideal",
    label: "Идеальный",
    progress: 100,
    color: "#059669",
  },
};

/**
 * @typedef {{ tier: string, label: string, progress: number, color: string, recommendations: string[] }} PasswordDiagnostics
 * @param {string} password
 * @param {{ shortThreshold?: number, recommendSymbols?: boolean }} [options] shortThreshold — минимальная длина до «слишком короткий»
 */
export function getPasswordDiagnostics(password, options = {}) {
  const shortThreshold = Number(options.shortThreshold) >= 2 ? Number(options.shortThreshold) : 8;
  const recommendSymbols = options.recommendSymbols !== false;

  if (!password) {
    return {
      ...PASSWORD_LEVELS.empty,
      recommendations: ["Введите пароль"],
    };
  }

  if (password.length < shortThreshold) {
    const need = shortThreshold - password.length;
    const rec =
      shortThreshold <= 8
        ? [`Добавьте ещё ${need} символ(ов)`, "Длинный пароль сложнее подобрать"]
        : [`Добавьте ещё ${need} символ(ов) (рекомендуем не короче 8)`];
    return {
      ...PASSWORD_LEVELS.short,
      recommendations: rec,
    };
  }

  const checks = {
    lowercase: /[a-zа-яё]/.test(password),
    uppercase: /[A-ZА-ЯЁ]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^a-zA-Zа-яА-ЯёЁ0-9]/.test(password),
    long: password.length >= 12,
  };

  const score = Object.values(checks).filter(Boolean).length;

  let level = PASSWORD_LEVELS.weak;
  if (score === 2) level = PASSWORD_LEVELS.belowMedium;
  if (score === 3) level = PASSWORD_LEVELS.medium;
  if (score === 4) level = PASSWORD_LEVELS.strong;
  if (score === 5) level = PASSWORD_LEVELS.ideal;

  const recommendations = [];
  if (!checks.lowercase) recommendations.push("Добавьте строчные буквы");
  if (!checks.uppercase) recommendations.push("Добавьте заглавные буквы");
  if (!checks.digit) recommendations.push("Добавьте цифры");
  if (recommendSymbols && !checks.symbol)
    recommendations.push("Добавьте спецсимволы (например: !@#$)");
  if (!checks.long) recommendations.push("Сделайте пароль длиннее (12+ символов)");

  return {
    ...level,
    recommendations,
  };
}

/** Демо-отображение «зашифрованного» пароля (без реального хранения plaintext в таблице после сохранения). */
export function demoPasswordHashDisplay(password) {
  if (!password) return "—";
  let h = 5381;
  for (let i = 0; i < password.length; i += 1) {
    h = ((h << 5) + h) ^ password.charCodeAt(i);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  const tail = password.length.toString();
  return `PBKDF2-SHA256·${hex}…·${tail}симв.`;
}
