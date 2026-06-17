package com.shop.ElectronicShop.supply.spec;

import com.shop.ElectronicShop.supply.entity.SupplyGood;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class SupplyGoodSpecifications {

    private SupplyGoodSpecifications() {}

    public static Specification<SupplyGood> categoryEquals(String raw) {
        if (raw == null || raw.isBlank()) {
            return (root, q, cb) -> cb.conjunction();
        }
        String v = raw.trim();
        return (root, q, cb) -> cb.equal(root.get("category"), v);
    }

    public static Specification<SupplyGood> subcategoryEquals(String raw) {
        if (raw == null || raw.isBlank()) {
            return (root, q, cb) -> cb.conjunction();
        }
        String v = raw.trim();
        return (root, q, cb) -> cb.equal(root.get("subcategory"), v);
    }

    public static Specification<SupplyGood> brandEquals(String raw) {
        if (raw == null || raw.isBlank()) {
            return (root, q, cb) -> cb.conjunction();
        }
        String v = raw.trim();
        return (root, q, cb) -> cb.equal(root.get("brand"), v);
    }

    public static Specification<SupplyGood> countryEquals(String raw) {
        if (raw == null || raw.isBlank()) {
            return (root, q, cb) -> cb.conjunction();
        }
        String v = raw.trim();
        return (root, q, cb) -> cb.equal(root.get("country"), v);
    }

    /** Поиск по названию и описанию (без учёта регистра). */
    public static Specification<SupplyGood> searchText(String raw) {
        if (raw == null || raw.isBlank()) {
            return (root, q, cb) -> cb.conjunction();
        }
        String p = "%" + raw.trim().toLowerCase() + "%";
        return (root, q, cb) ->
                cb.or(
                        cb.like(cb.lower(root.get("goodName")), p),
                        cb.like(cb.lower(root.get("description")), p));
    }

    public static Specification<SupplyGood> priceGreaterOrEqual(BigDecimal min) {
        if (min == null) {
            return (root, q, cb) -> cb.conjunction();
        }
        return (root, q, cb) -> cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    public static Specification<SupplyGood> priceLessOrEqual(BigDecimal max) {
        if (max == null) {
            return (root, q, cb) -> cb.conjunction();
        }
        return (root, q, cb) -> cb.lessThanOrEqualTo(root.get("price"), max);
    }
}
