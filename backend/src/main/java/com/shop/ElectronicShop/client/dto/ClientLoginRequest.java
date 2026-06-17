package com.shop.ElectronicShop.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ClientLoginRequest {

    @NotBlank(message = "Табельный номер обязателен")
    private String tabNumber;

    /**
     * Формат проверяется на фронте; здесь только непустое значение, чтобы вход не блокировался из‑за строгого RFC у {@code @Email}.
     */
    @NotBlank(message = "Email обязателен")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    private String password;

    /** Значения из БД: client | storekeeper | admin */
    @NotBlank(message = "Роль обязательна")
    @Pattern(
            regexp = "client|storekeeper|admin",
            message = "Роль должна быть client, storekeeper или admin"
    )
    private String role;
}
