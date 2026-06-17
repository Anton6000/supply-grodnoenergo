package com.shop.ElectronicShop.client.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_users")
@Getter
@Setter
@NoArgsConstructor
public class Client {

    @Id
    @Column(name = "user_id", length = 15)
    private String clientId;

    @Column(name = "full_name", nullable = false, unique = true, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String position;

    @Column(name = "tab_number", nullable = false, unique = true, length = 10)
    private String tabNumber;

    /** Отображение как в БД: {@code +375 (29) 111-22-33}. Уникально (проверка дубликатов по нормализованным цифрам). */
    @Column(nullable = false, unique = true, length = 28)
    private String phone;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    /** Открытый текст пароля (как договорено для учебного проекта). Колонка в БД: password. Уникально. */
    @Column(nullable = false, unique = true, length = 255)
    private String password;

    /** Дата и время без долей секунды и без смещения часового пояса в модели (хранится как TIMESTAMP в PostgreSQL). */
    @Column(name = "created_at", nullable = false, columnDefinition = "timestamp(0)")
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 20)
    private String role;
}
