package com.shop.ElectronicShop.order.dto;

import java.math.BigDecimal;

public record OrderLineResponse(
        String lineId,
        String id,
        String name,
        String imageUrl,
        String category,
        String subcategory,
        String unit,
        BigDecimal price,
        Integer qty,
        BigDecimal lineTotal) {}
