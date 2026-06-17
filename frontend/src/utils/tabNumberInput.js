/**
 * Табельный номер в формате БД: одна латинская буква, дефис, 4 цифры (пример T 1111 → вводится как T-1111).
 * На экране маска: _-____ → T-____ → T-1111
 */

/** Визуальная маска для поля ввода */
export function buildTabMaskVisual(lettersRaw, digitsRaw) {
  const letters = String(lettersRaw ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
  const digits = String(digitsRaw ?? "").replace(/\D/g, "").slice(0, 4);

  const partL = letters.length === 0 ? "_" : letters;
  const partR = digits.padEnd(4, "_");
  return `${partL}-${partR}`;
}

/** Склейка для API и сравнения с БД (без дефиса), например T4521 */
export function normalizeTabParts(lettersRaw, digitsRaw) {
  const letters = String(lettersRaw ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
  const digits = String(digitsRaw ?? "").replace(/\D/g, "").slice(0, 4);
  return `${letters}${digits}`;
}

/** Нормализация произвольной строки */
export function normalizeTabNumber(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

export function parseTabFromText(text) {
  const cleaned = normalizeTabNumber(text);
  let letters = "";
  let digits = "";
  for (const ch of cleaned) {
    if (/[A-Z]/.test(ch) && digits.length === 0 && letters.length < 1) {
      letters += ch;
    } else if (/[0-9]/.test(ch) && letters.length === 1 && digits.length < 4) {
      digits += ch;
    }
  }
  return { letters, digits };
}

/** Маска заполнена: ровно 1 буква и 4 цифры */
export function isTabMaskComplete(lettersRaw, digitsRaw) {
  const letters = String(lettersRaw ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  const digits = String(digitsRaw ?? "").replace(/\D/g, "");
  return letters.length === 1 && digits.length === 4;
}

export function isValidTabNumberNormalized(norm) {
  if (!norm) return false;
  return /^[A-Z]\d{4}$/.test(norm);
}

export const MSG_TAB_TEMPLATE =
  "Введите табельный номер по шаблону: одна латинская буква, дефис, 4 цифры (пример T 1111)";

const NAV_KEYS = ["Tab", "ArrowLeft", "ArrowRight", "Home", "End"];

/**
 * Ввод «как телефон»: Backspace/Delete убирают последний введённый символ (сначала цифры, потом буква).
 * Буква — только первая позиция, затем до 4 цифр.
 */
export function tabKeyDownPhoneStyle(e, setTab) {
  if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    setTab((prev) => {
      if (prev.d.length > 0) {
        return { ...prev, d: prev.d.slice(0, -1) };
      }
      return { l: "", d: "" };
    });
    return true;
  }

  if (NAV_KEYS.includes(e.key)) {
    return false;
  }

  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      setTab((prev) => {
        if (prev.l.length > 0) return prev;
        return { l: e.key.toUpperCase(), d: prev.d };
      });
      return true;
    }
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setTab((prev) => {
        if (prev.l.length !== 1 || prev.d.length >= 4) return prev;
        return { ...prev, d: prev.d + e.key };
      });
      return true;
    }
  }

  e.preventDefault();
  return true;
}

/** Вставка / мобильный ввод: нормализация через parseTabFromText */
export function tabApplyParsedText(text, setTab) {
  const { letters, digits } = parseTabFromText(text);
  setTab({ l: letters.slice(0, 1), d: digits.slice(0, 4) });
}
