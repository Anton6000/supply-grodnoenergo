package com.shop.ElectronicShop.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ClientRegisterRequest {

    @NotBlank(message = "ФИО обязательно")
    private String fullName;

    @NotBlank(message = "Должность обязательна")
    private String position;

    @NotBlank(message = "Табельный номер обязателен")
    private String tabNumber;

    /** Ровно 12 цифр, формат телефона РБ: 375 + 9 цифр */
    @NotBlank(message = "Телефон обязателен")
    @Pattern(regexp = "^375\\d{9}$", message = "Телефон: 12 цифр начиная с 375")
    private String phone;

    @NotBlank(message = "Email обязателен")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    private String password;

    @NotBlank(message = "Роль обязательна")
    @Pattern(
            regexp = "client|storekeeper|admin",
            message = "Роль должна быть client, storekeeper или admin")
    private String role;
}
