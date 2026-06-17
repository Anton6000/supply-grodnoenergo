package com.shop.ElectronicShop.client.controller;

import com.shop.ElectronicShop.client.dto.SystemUserListItemDto;
import com.shop.ElectronicShop.client.dto.SystemUserUpsertRequest;
import com.shop.ElectronicShop.client.entity.Client;
import com.shop.ElectronicShop.client.repository.ClientRepository;
import com.shop.ElectronicShop.client.util.PasswordPolicy;
import com.shop.ElectronicShop.client.util.StoredPasswordDisplay;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/system-users")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class SystemUserListController {

    private final ClientRepository clientRepository;

    @GetMapping
    public List<SystemUserListItemDto> listAllForAdmin() {
        return clientRepository.findAll(Sort.by(Sort.Direction.ASC, "clientId")).stream()
                .map(SystemUserListController::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public SystemUserListItemDto one(@PathVariable String id) {
        return clientRepository
                .findById(id)
                .map(SystemUserListController::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден: " + id));
    }

    @PostMapping
    public SystemUserListItemDto create(@RequestBody SystemUserUpsertRequest request) {
        Client client = new Client();
        client.setClientId(nextClientId(request.role()));
        apply(client, request, true);
        return toDto(clientRepository.save(client));
    }

    @PutMapping("/{id}")
    public SystemUserListItemDto update(@PathVariable String id, @RequestBody SystemUserUpsertRequest request) {
        Client client =
                clientRepository
                        .findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден: " + id));
        apply(client, request, false);
        return toDto(clientRepository.save(client));
    }

    @DeleteMapping
    public void delete(@RequestParam List<String> ids) {
        for (String id : ids) {
            if (id == null || id.isBlank() || clientRepository.hasOrders(id.trim())) {
                continue;
            }
            clientRepository.deleteById(id.trim());
        }
    }

    private static SystemUserListItemDto toDto(Client c) {
        return new SystemUserListItemDto(
                c.getClientId(),
                c.getFullName(),
                c.getPosition(),
                c.getTabNumber(),
                c.getPhone(),
                c.getEmail(),
                StoredPasswordDisplay.format(c.getPassword()),
                c.getCreatedAt(),
                c.getRole());
    }

    private void apply(Client client, SystemUserUpsertRequest request, boolean isCreate) {
        client.setFullName(required(request.fullName(), "ФИО"));
        client.setPosition(required(request.position(), "Должность"));
        client.setTabNumber(required(firstNonBlank(request.employeeId(), request.tabNumber()), "Табельный номер"));
        client.setPhone(required(request.phone(), "Телефон"));
        client.setEmail(required(request.email(), "Email"));
        if (isCreate || (request.password() != null && !request.password().isBlank())) {
            String pw = required(request.password(), "Пароль");
            if (!PasswordPolicy.matches(pw)) {
                throw new IllegalArgumentException(PasswordPolicy.ERROR_MESSAGE);
            }
            client.setPassword(pw);
        }
        client.setRole(normalizeRole(request.role()));
        if (client.getCreatedAt() == null) {
            client.setCreatedAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
        }
    }

    private String nextClientId(String role) {
        String prefix =
                switch (normalizeRole(role)) {
                    case "storekeeper" -> "ST-";
                    case "admin" -> "AD-";
                    default -> "SU-";
                };
        int next =
                clientRepository.findClientIdsByPrefix(prefix + "%").stream()
                        .map(SystemUserListController::suffixNumber)
                        .max(Comparator.naturalOrder())
                        .orElse(1000)
                        + 1;
        return prefix + next;
    }

    private static int suffixNumber(String id) {
        int idx = id == null ? -1 : id.lastIndexOf('-');
        if (idx < 0 || idx >= id.length() - 1) return 1000;
        try {
            return Integer.parseInt(id.substring(idx + 1));
        } catch (NumberFormatException e) {
            return 1000;
        }
    }

    private String normalizeRole(String role) {
        String r = role == null ? "client" : role.trim().toLowerCase();
        if ("warehouse".equals(r)) return "storekeeper";
        if (!List.of("client", "storekeeper", "admin").contains(r)) return "client";
        return r;
    }

    private String firstNonBlank(String a, String b) {
        return a != null && !a.isBlank() ? a : b;
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " обязателен");
        }
        return value.trim();
    }
}
