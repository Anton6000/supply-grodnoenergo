package com.shop.ElectronicShop.client.controller;

import com.shop.ElectronicShop.client.dto.ClientLoginRequest;
import com.shop.ElectronicShop.client.dto.ClientLoginResponse;
import com.shop.ElectronicShop.client.dto.ClientRegisterRequest;
import com.shop.ElectronicShop.client.dto.ClientRegisterResponse;
import com.shop.ElectronicShop.client.service.ClientAuthService;
import com.shop.ElectronicShop.client.service.ClientRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ClientAuthController {

    private final ClientAuthService clientAuthService;
    private final ClientRegistrationService clientRegistrationService;

    /** Вход по таблице system_users (табельный номер + email + пароль + роль). */
    @PostMapping("/login")
    public ResponseEntity<ClientLoginResponse> login(@Valid @RequestBody ClientLoginRequest request) {
        ClientLoginResponse response = clientAuthService.authenticate(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /** Регистрация новой записи в system_users. */
    @PostMapping("/register")
    public ResponseEntity<ClientRegisterResponse> register(@Valid @RequestBody ClientRegisterRequest request) {
        ClientRegisterResponse response = clientRegistrationService.register(request);
        if (!response.isSuccess()) {
            HttpStatus status =
                    response.getConflicts() != null && !response.getConflicts().isEmpty()
                            ? HttpStatus.CONFLICT
                            : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
