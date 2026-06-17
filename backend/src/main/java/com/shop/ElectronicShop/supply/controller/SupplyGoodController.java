package com.shop.ElectronicShop.supply.controller;

import com.shop.ElectronicShop.supply.dto.SupplyCatalogSummaryResponse;
import com.shop.ElectronicShop.supply.dto.SupplyGoodMetaResponse;
import com.shop.ElectronicShop.supply.dto.SupplyGoodResponse;
import com.shop.ElectronicShop.supply.dto.SupplyGoodUpsertRequest;
import com.shop.ElectronicShop.supply.service.SupplyGoodService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/supply-goods")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class SupplyGoodController {

    private final SupplyGoodService supplyGoodService;

    public SupplyGoodController(SupplyGoodService supplyGoodService) {
        this.supplyGoodService = supplyGoodService;
    }

    /** Уникальные значения фильтров (как в таблице supply_goods). Должен объявляться до маршрута с {id}. */
    @GetMapping("/meta")
    public ResponseEntity<SupplyGoodMetaResponse> meta() {
        return ResponseEntity.ok(supplyGoodService.getMeta());
    }

    /** Сводка для блока «Каталог снабжения» на главной: категории, подкатегории, количество товаров. */
    @GetMapping("/catalog-summary")
    public ResponseEntity<SupplyCatalogSummaryResponse> catalogSummary() {
        return ResponseEntity.ok(supplyGoodService.getCatalogSummary());
    }

    @GetMapping
    public ResponseEntity<List<SupplyGoodResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String minPrice,
            @RequestParam(required = false) String maxPrice,
            @RequestParam(required = false, name = "sort") String sortMode) {

        BigDecimal min = parseDecimal(minPrice);
        BigDecimal max = parseDecimal(maxPrice);
        List<SupplyGoodResponse> list =
                supplyGoodService.findFiltered(
                        category, subcategory, search, brand, country, min, max, sortMode);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<SupplyGoodResponse> one(@PathVariable String id) {
        return supplyGoodService
                .findBySupplyGoodId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SupplyGoodResponse> create(@RequestBody SupplyGoodUpsertRequest request) {
        return ResponseEntity.ok(supplyGoodService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplyGoodResponse> update(
            @PathVariable String id, @RequestBody SupplyGoodUpsertRequest request) {
        return supplyGoodService.update(id, request).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@RequestParam List<String> ids) {
        supplyGoodService.deleteMany(ids);
        return ResponseEntity.noContent().build();
    }

    private static BigDecimal parseDecimal(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(raw.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
