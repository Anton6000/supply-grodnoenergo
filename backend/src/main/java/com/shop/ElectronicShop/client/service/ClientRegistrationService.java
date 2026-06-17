package com.shop.ElectronicShop.client.service;

import com.shop.ElectronicShop.client.dto.ClientRegisterRequest;
import com.shop.ElectronicShop.client.dto.ClientRegisterResponse;
import com.shop.ElectronicShop.client.entity.Client;
import com.shop.ElectronicShop.client.repository.ClientRepository;
import com.shop.ElectronicShop.client.util.PasswordPolicy;
import com.shop.ElectronicShop.client.util.TabNumberNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ClientRegistrationService {

    static final int MIN_FULL_NAME_LENGTH = 5;
    static final int MIN_POSITION_LENGTH = 3;

    private static final Pattern NAME_OR_POSITION_CHARS =
            Pattern.compile("^[a-zA-Zа-яА-ЯёЁ]+( [a-zA-Zа-яА-ЯёЁ]+)*$");

    private final ClientRepository clientRepository;

    @Transactional
    public ClientRegisterResponse register(ClientRegisterRequest req) {
        String fullName = collapseSpaces(req.getFullName());
        String position = collapseSpaces(req.getPosition());
        String email = req.getEmail().trim();
        String phone = req.getPhone().trim();
        String rawPassword = req.getPassword();
        String role = req.getRole().trim().toLowerCase();

        if (!PasswordPolicy.matches(rawPassword)) {
            return ClientRegisterResponse.error(PasswordPolicy.ERROR_MESSAGE);
        }

        String password = rawPassword.trim();
        if (fullName.length() < MIN_FULL_NAME_LENGTH) {
            return ClientRegisterResponse.error(
                    "ФИО слишком короткое: минимум " + MIN_FULL_NAME_LENGTH + " символов");
        }
        if (!NAME_OR_POSITION_CHARS.matcher(fullName).matches()) {
            return ClientRegisterResponse.error(
                    "ФИО: только русские или латинские буквы и пробелы между словами");
        }

        if (position.length() < MIN_POSITION_LENGTH) {
            return ClientRegisterResponse.error(
                    "Должность слишком короткая: минимум " + MIN_POSITION_LENGTH + " символов");
        }
        if (!NAME_OR_POSITION_CHARS.matcher(position).matches()) {
            return ClientRegisterResponse.error(
                    "Должность: только русские или латинские буквы и пробелы между словами");
        }

        String tabFormatted = canonicalTabNumber(req.getTabNumber());
        if (tabFormatted == null || !tabFormatted.matches("^[A-Z]-\\d{4}$")) {
            return ClientRegisterResponse.error(
                    "Табельный номер: одна латинская буква, дефис и четыре цифры (например T-1111)");
        }

        if (!phone.matches("^375\\d{9}$")) {
            return ClientRegisterResponse.error("Телефон должен содержать 12 цифр в формате 375XXXXXXXXX");
        }

        String phoneStored = formatPhoneLikeExistingRows(phone);

        List<String> conflicts = new ArrayList<>();
        if (clientRepository.existsByFullNameTrimmed(fullName)) {
            conflicts.add("fullName");
        }
        if (clientRepository.existsByPositionTrimmed(position)) {
            conflicts.add("position");
        }
        if (clientRepository.existsByTabNumberTrimmed(tabFormatted)) {
            conflicts.add("tabNumber");
        }
        if (clientRepository.existsByPhoneNormalizedDigits(phone)) {
            conflicts.add("phone");
        }
        if (clientRepository.existsByEmailTrimmed(email)) {
            conflicts.add("email");
        }
        if (clientRepository.existsByPasswordValue(password)) {
            conflicts.add("password");
        }

        if (!conflicts.isEmpty()) {
            return ClientRegisterResponse.conflict(
                    "Такие данные уже есть в системе — каждый параметр должен быть уникален.", conflicts);
        }

        String prefix = clientIdPrefix(role);
        String clientId = nextClientId(prefix);

        Client entity = new Client();
        entity.setClientId(clientId);
        entity.setFullName(fullName);
        entity.setPosition(position);
        entity.setTabNumber(tabFormatted);
        entity.setPhone(phoneStored);
        entity.setEmail(email);
        entity.setPassword(password);
        entity.setCreatedAt(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
        entity.setRole(role);

        clientRepository.save(entity);
        return ClientRegisterResponse.ok(clientId);
    }

    /** Как у старых строк в таблице: {@code +375 (29) 111-22-33}; {@code digits12} — ровно {@code 375XXXXXXXXX}. */
    private static String formatPhoneLikeExistingRows(String digits12) {
        String tail = digits12.substring(3);
        return "+375 (%s) %s-%s-%s"
                .formatted(tail.substring(0, 2), tail.substring(2, 5), tail.substring(5, 7), tail.substring(7, 9));
    }

    /** "Иванов  Иван" → "Иванов Иван" */
    private static String collapseSpaces(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().replaceAll("\\s+", " ");
    }

    /** T-4521 / t4521 / "t 4521" → T-4521 */
    private String canonicalTabNumber(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String compact = TabNumberNormalizer.normalize(raw);
        if (!compact.matches("^[A-Z]\\d{4}$")) {
            return null;
        }
        return compact.charAt(0) + "-" + compact.substring(1);
    }

    private String clientIdPrefix(String role) {
        return switch (role) {
            case "storekeeper" -> "ST-";
            case "admin" -> "AD-";
            default -> "SU-";
        };
    }

    private String nextClientId(String prefixWithDash) {
        String like = prefixWithDash + "%";
        List<String> ids = clientRepository.findClientIdsByPrefix(like);
        int max = ids.stream()
                .map(this::suffixNumber)
                .max(Comparator.naturalOrder())
                .orElse(1000);
        return prefixWithDash + (max + 1);
    }

    /** SU-1001 → 1001 */
    private int suffixNumber(String clientId) {
        int i = clientId.lastIndexOf('-');
        if (i < 0 || i >= clientId.length() - 1) {
            return 1000;
        }
        try {
            return Integer.parseInt(clientId.substring(i + 1));
        } catch (NumberFormatException e) {
            return 1000;
        }
    }
}
