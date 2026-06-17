export const MSG_EMAIL =
  "Введите корректный email: латинские буквы и цифры, символ @ и точка в домене (например, name@domain.by), не короче 8 символов";

/** Совпадает с правилами регистрации на сервере: без пробелов, минимум 6, нужны латинские буквы и цифра; можно спецсимволы. */
export const MSG_PASSWORD =
  "Пароль: минимум 6 символов без пробелов, нужны латинские буквы и хотя бы одна цифра (можно спецсимволы)";

export function validateEmailFormat(email) {
  const t = email.trim();
  if (t.length < 8) return MSG_EMAIL;

  const parts = t.split("@");
  if (parts.length !== 2) return MSG_EMAIL;

  const [local, domain] = parts;
  if (!local || !domain) return MSG_EMAIL;
  if (local.length === 1) {
    if (!/^[A-Za-z0-9]$/.test(local)) return MSG_EMAIL;
  } else if (!/^[A-Za-z0-9][A-Za-z0-9._+-]*[A-Za-z0-9]$/.test(local)) {
    return MSG_EMAIL;
  }
  if (!/^[A-Za-z0-9.-]+$/.test(domain)) return MSG_EMAIL;
  if (!domain.includes(".")) return MSG_EMAIL;

  const segments = domain.split(".");
  if (segments.some((s) => s.length === 0)) return MSG_EMAIL;
  if (!/^[A-Za-z0-9]/.test(domain) || !/[A-Za-z0-9]$/.test(domain)) return MSG_EMAIL;

  return null;
}

export function validatePasswordFormat(password) {
  // Как PASSWORD_RULE на backend: хотя бы одна латинская буква и цифра, без пробелов, длина ≥ 6.
  if (!/^(?=.*[a-zA-Z])(?=.*\d)\S{6,}$/.test(password)) return MSG_PASSWORD;
  return null;
}

/** ФИО: только ru/en буквы, слова через один пробел, минимум minLen символов */
export function validatePersonName(fullNameTrimmed, minLen = 5) {
  if (fullNameTrimmed.length < minLen) {
    return `ФИО: минимум ${minLen} символов`;
  }
  if (!/^[a-zA-Zа-яА-ЯёЁ]+( [a-zA-Zа-яА-ЯёЁ]+)*$/.test(fullNameTrimmed)) {
    return "ФИО: только русские или латинские буквы и пробелы между словами";
  }
  return null;
}

/** Должность: только ru/en буквы и пробелы, минимум minLen символов */
export function validatePosition(positionTrimmed, minLen = 3) {
  if (positionTrimmed.length < minLen) {
    return `Должность: минимум ${minLen} символов`;
  }
  if (!/^[a-zA-Zа-яА-ЯёЁ]+( [a-zA-Zа-яА-ЯёЁ]+)*$/.test(positionTrimmed)) {
    return "Должность: только русские или латинские буквы и пробелы между словами";
  }
  return null;
}
