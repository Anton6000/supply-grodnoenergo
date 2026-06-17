package com.shop.ElectronicShop.client.repository;

import com.shop.ElectronicShop.client.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, String> {

    /**
     * JPQL (не native): так Hibernate корректно подтягивает все поля сущности, в том числе колонку {@code password}.
     */
    @Query(
            """
                    SELECT c FROM Client c
                    WHERE lower(trim(c.email)) = lower(trim(:email))
                      AND lower(trim(c.role)) = lower(trim(:role))
                    """)
    Optional<Client> findForLogin(@Param("email") String email, @Param("role") String role);

    @Query("SELECT c.clientId FROM Client c WHERE c.clientId LIKE :pfx")
    List<String> findClientIdsByPrefix(@Param("pfx") String pfx);

    @Query(
            value =
                    """
                    SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM orders o
                    WHERE o.user_id = :userId
                    """,
            nativeQuery = true)
    boolean hasOrders(@Param("userId") String userId);

    @Query(
            """
                    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Client c
                    WHERE lower(trim(c.fullName)) = lower(trim(:v))
                    """)
    boolean existsByFullNameTrimmed(@Param("v") String v);

    @Query(
            """
                    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Client c
                    WHERE lower(trim(c.position)) = lower(trim(:v))
                    """)
    boolean existsByPositionTrimmed(@Param("v") String v);

    @Query(
            """
                    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Client c
                    WHERE lower(trim(c.tabNumber)) = lower(trim(:v))
                    """)
    boolean existsByTabNumberTrimmed(@Param("v") String v);

    /** Совпадение номера при любом форматировании в колонке (PostgreSQL). */
    @Query(
            value =
                    """
                    SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM system_users c
                    WHERE regexp_replace(COALESCE(c.phone, ''), '[^0-9]', '', 'g') = :digitsOnly
                    """,
            nativeQuery = true)
    boolean existsByPhoneNormalizedDigits(@Param("digitsOnly") String digitsOnly);

    @Query(
            """
                    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Client c
                    WHERE lower(trim(c.email)) = lower(trim(:v))
                    """)
    boolean existsByEmailTrimmed(@Param("v") String v);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Client c WHERE c.password = :pwd")
    boolean existsByPasswordValue(@Param("pwd") String pwd);
}
