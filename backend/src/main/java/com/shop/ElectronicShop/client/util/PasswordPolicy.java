package com.shop.ElectronicShop.client.util;

import java.util.regex.Pattern;

/**
 * Единое правило пароля для регистрации и CRUD пользователей (админка):
 * хотя бы одна латинская буква и одна цифра, без пробелов, длина ≥ 6;
 * можно спецсимволы.
 */
public final class PasswordPolicy {

    private static final Pattern RULE = Pattern.compile("^(?=.*[a-zA-Z])(?=.*\\d)\\S{6,}$");

    public static final String ERROR_MESSAGE =
            "Пароль: минимум 6 символов без пробелов, нужны латинские буквы и хотя бы одна цифра (можно спецсимволы)";

    private PasswordPolicy() {}

    /** {@code candidate} уже как в БД (trim и т.д. по желанию вызывателя). */
    public static boolean matches(String candidate) {
        return candidate != null && RULE.matcher(candidate).matches();
    }
}
