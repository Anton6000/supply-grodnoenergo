package com.shop.ElectronicShop.client.util;

/**
 * То же представление пароля для админ-панели, что и функция {@code demoPasswordHashDisplay}
 * во фронтенде: не хеш, а условное «демо-хэш» по длине и простой функции от строки.
 */
public final class StoredPasswordDisplay {

    private StoredPasswordDisplay() {}

    public static String format(String password) {
        if (password == null || password.isBlank()) {
            return "—";
        }
        int h = 5381;
        for (int i = 0; i < password.length(); i++) {
            h = ((h << 5) + h) ^ password.charAt(i);
        }
        String hex = String.format("%08x", Integer.toUnsignedLong(h));
        return "PBKDF2-SHA256·" + hex + "…·" + password.length() + "симв.";
    }
}
