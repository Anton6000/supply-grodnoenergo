package com.shop.ElectronicShop.supply.service;

import com.shop.ElectronicShop.supply.dto.CatalogSubcategoryRowResponse;
import com.shop.ElectronicShop.supply.dto.SupplyCatalogSummaryResponse;
import com.shop.ElectronicShop.supply.dto.SupplyGoodMetaResponse;
import com.shop.ElectronicShop.supply.dto.SupplyGoodResponse;
import com.shop.ElectronicShop.supply.dto.SupplyGoodUpsertRequest;
import com.shop.ElectronicShop.supply.entity.SupplyGood;
import com.shop.ElectronicShop.supply.repository.SupplyGoodRepository;
import com.shop.ElectronicShop.supply.spec.SupplyGoodSpecifications;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Comparator;

@Service
public class SupplyGoodService {

    private final SupplyGoodRepository supplyGoodRepository;

    public SupplyGoodService(SupplyGoodRepository supplyGoodRepository) {
        this.supplyGoodRepository = supplyGoodRepository;
    }

    @Transactional(readOnly = true)
    public SupplyCatalogSummaryResponse getCatalogSummary() {
        List<CatalogSubcategoryRowResponse> rows =
                supplyGoodRepository.listStatsByCategoryAndSubcategory().stream()
                        .map(CatalogSubcategoryRowResponse::from)
                        .toList();

        Set<String> uniq = new LinkedHashSet<>();
        for (CatalogSubcategoryRowResponse r : rows) {
            uniq.add(r.getCategory());
        }
        return new SupplyCatalogSummaryResponse(rows, new ArrayList<>(uniq));
    }

    @Transactional(readOnly = true)
    public SupplyGoodMetaResponse getMeta() {
        List<String> categories =
                supplyGoodRepository.findDistinctCategories().stream().distinct().toList();

        LinkedHashMap<String, LinkedHashSet<String>> buf = new LinkedHashMap<>();
        for (SupplyGood g : supplyGoodRepository.findAll()) {
            buf.computeIfAbsent(g.getCategory(), x -> new LinkedHashSet<>())
                    .add(g.getSubcategory());
        }

        Map<String, List<String>> subs = new LinkedHashMap<>();
        for (String cat : categories) {
            LinkedHashSet<String> set = buf.get(cat);
            if (set == null || set.isEmpty()) {
                subs.put(cat, List.of());
            } else {
                List<String> list = new ArrayList<>(set);
                list.sort(String::compareTo);
                subs.put(cat, list);
            }
        }

        return new SupplyGoodMetaResponse(
                categories,
                subs,
                supplyGoodRepository.findDistinctBrands(),
                supplyGoodRepository.findDistinctCountries());
    }

    @Transactional(readOnly = true)
    public List<SupplyGoodResponse> findFiltered(
            String category,
            String subcategory,
            String search,
            String brand,
            String country,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort) {

        Specification<SupplyGood> spec =
                Specification.where(SupplyGoodSpecifications.categoryEquals(category))
                        .and(SupplyGoodSpecifications.subcategoryEquals(subcategory))
                        .and(SupplyGoodSpecifications.brandEquals(brand))
                        .and(SupplyGoodSpecifications.countryEquals(country))
                        .and(SupplyGoodSpecifications.searchText(search))
                        .and(SupplyGoodSpecifications.priceGreaterOrEqual(minPrice))
                        .and(SupplyGoodSpecifications.priceLessOrEqual(maxPrice));

        Sort sortOrder = Sort.unsorted();
        if (sort != null && !sort.isBlank()) {
            switch (sort) {
                case "priceAsc" -> sortOrder = Sort.by("price").ascending();
                case "priceDesc" -> sortOrder = Sort.by("price").descending();
                case "nameAsc" -> sortOrder = Sort.by("goodName").ascending();
                case "nameDesc" -> sortOrder = Sort.by("goodName").descending();
                default -> sortOrder = Sort.by("goodName").ascending();
            }
        } else {
            sortOrder = Sort.by("goodName").ascending();
        }

        return supplyGoodRepository.findAll(spec, sortOrder).stream()
                .map(SupplyGoodResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<SupplyGoodResponse> findBySupplyGoodId(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return supplyGoodRepository.findById(id.trim()).map(SupplyGoodResponse::fromEntity);
    }

    @Transactional
    public SupplyGoodResponse create(SupplyGoodUpsertRequest request) {
        SupplyGood entity = new SupplyGood();
        entity.setSupplyGoodId(nextSupplyGoodId());
        apply(entity, request);
        return SupplyGoodResponse.fromEntity(supplyGoodRepository.save(entity));
    }

    @Transactional
    public Optional<SupplyGoodResponse> update(String id, SupplyGoodUpsertRequest request) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return supplyGoodRepository
                .findById(id.trim())
                .map(
                        entity -> {
                            apply(entity, request);
                            return SupplyGoodResponse.fromEntity(supplyGoodRepository.save(entity));
                        });
    }

    @Transactional
    public void deleteMany(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        ids.stream().filter((id) -> id != null && !id.isBlank()).map(String::trim).forEach(supplyGoodRepository::deleteById);
    }

    private void apply(SupplyGood entity, SupplyGoodUpsertRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Данные товара обязательны");
        }
        entity.setGoodName(required(request.goodName(), "Название товара"));
        entity.setImageUrl(blankToDefault(request.imageUrl(), "/images/placeholder.jpg"));
        entity.setCategory(required(request.category(), "Категория"));
        entity.setSubcategory(required(request.subcategory(), "Подкатегория"));
        entity.setDescription(blankToDefault(request.description(), entity.getGoodName()));
        entity.setBrand(blankToDefault(request.brand(), "—"));
        entity.setCountry(blankToDefault(request.country(), "—"));
        entity.setUnit(blankToDefault(request.unit(), "шт."));
        if (request.price() == null || request.price().signum() < 0) {
            throw new IllegalArgumentException("Цена должна быть не меньше 0");
        }
        entity.setPrice(request.price());
    }

    private String nextSupplyGoodId() {
        int next =
                supplyGoodRepository.findSupplyGoodIdsByPrefix("SG-%").stream()
                        .map(this::suffixNumber)
                        .max(Comparator.naturalOrder())
                        .orElse(1000)
                        + 1;
        return "SG-" + next;
    }

    private int suffixNumber(String id) {
        int idx = id == null ? -1 : id.lastIndexOf('-');
        if (idx < 0 || idx >= id.length() - 1) {
            return 1000;
        }
        try {
            return Integer.parseInt(id.substring(idx + 1));
        } catch (NumberFormatException e) {
            return 1000;
        }
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " обязателен");
        }
        return value.trim();
    }

    private String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim();
    }
}
