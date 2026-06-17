package com.shop.ElectronicShop.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientLoginResponse {

    private boolean success;
    private String message;
    private String fullName;
    private String clientId;
    /** Роль как в БД: client | storekeeper | admin */
    private String role;

    public static ClientLoginResponse ok(String fullName, String clientId, String role) {
        return ClientLoginResponse.builder()
                .success(true)
                .message("Успешный вход")
                .fullName(fullName)
                .clientId(clientId)
                .role(role)
                .build();
    }

    public static ClientLoginResponse failure(String message) {
        return ClientLoginResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
