package com.shop.ElectronicShop.supply.dto;

import java.math.BigDecimal;

public record SupplyGoodUpsertRequest(
        String goodName,
        String imageUrl,
        String category,
        String subcategory,
        String description,
        String brand,
        String country,
        String unit,
        BigDecimal price) {}
