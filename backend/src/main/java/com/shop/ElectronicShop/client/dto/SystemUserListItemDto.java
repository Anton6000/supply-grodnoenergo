package com.shop.ElectronicShop.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Элемент таблицы system_users для панели администратора (только список, без простого текста пароля). */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SystemUserListItemDto {

    private String id;
    private String fullName;
    private String position;
    /** Табельный номер как в колонке {@code tab_number}. */
    private String employeeId;
    private String phone;
    private String email;
    /** Демонстрационная строка (как на фронте), не отправляется фактический пароль. */
    private String passwordDisplay;
    private LocalDateTime createdAt;
    private String role;
}
