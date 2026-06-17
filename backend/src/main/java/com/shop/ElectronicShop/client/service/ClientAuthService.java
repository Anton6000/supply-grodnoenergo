package com.shop.ElectronicShop.client.service;

import com.shop.ElectronicShop.client.dto.ClientLoginRequest;
import com.shop.ElectronicShop.client.dto.ClientLoginResponse;
import com.shop.ElectronicShop.client.entity.Client;
import com.shop.ElectronicShop.client.repository.ClientRepository;
import com.shop.ElectronicShop.client.util.TabNumberNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ClientAuthService {

    private static final String GENERIC_FAILURE = "Неверные данные или пользователь не найден";

    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public ClientLoginResponse authenticate(ClientLoginRequest request) {
        String role = request.getRole().trim().toLowerCase();
        String email = request.getEmail().trim();
        String requestedNorm = TabNumberNormalizer.normalize(request.getTabNumber());

        Client client = clientRepository.findForLogin(email, role).orElse(null);

        if (client == null) {
            return ClientLoginResponse.failure(GENERIC_FAILURE);
        }

        String storedNorm = TabNumberNormalizer.normalize(client.getTabNumber());
        if (!storedNorm.equals(requestedNorm)) {
            return ClientLoginResponse.failure(GENERIC_FAILURE);
        }

        String storedPassword = client.getPassword() != null ? client.getPassword().trim() : "";
        if (!Objects.equals(request.getPassword().trim(), storedPassword)) {
            return ClientLoginResponse.failure(GENERIC_FAILURE);
        }

        return ClientLoginResponse.ok(client.getFullName(), client.getClientId(), client.getRole());
    }
}
