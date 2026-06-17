package com.shop.ElectronicShop.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRegisterResponse {

    private boolean success;
    private String message;
    private String clientId;

    /** Ключи полей с коллизией: fullName, position, tabNumber, phone, email, password */
    private List<String> conflicts;

    public static ClientRegisterResponse ok(String clientId) {
        return ClientRegisterResponse.builder()
                .success(true)
                .message("Регистрация успешна")
                .clientId(clientId)
                .build();
    }

    public static ClientRegisterResponse conflict(String message, List<String> conflicts) {
        return ClientRegisterResponse.builder()
                .success(false)
                .message(message)
                .conflicts(conflicts)
                .build();
    }

    public static ClientRegisterResponse error(String message) {
        return ClientRegisterResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
