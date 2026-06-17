package com.shop.ElectronicShop.client.util;

import java.util.Locale;

/** Нормализация табельного номера (убираем дефисы и прочее; только буквы и цифры, верхний регистр). */
public final class TabNumberNormalizer {

    private TabNumberNormalizer() {}

    public static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (char c : raw.toUpperCase(Locale.ROOT).toCharArray()) {
            if (Character.isLetterOrDigit(c)) {
                sb.append(c);
            }
        }
        return sb.toString();
    }
}
