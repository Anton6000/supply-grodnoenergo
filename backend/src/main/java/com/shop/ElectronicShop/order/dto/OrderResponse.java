package com.shop.ElectronicShop.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        String id,
        String number,
        String userId,
        String customerId,
        String customerName,
        String customerPosition,
        String customerTabNumber,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime pickedUpAt,
        Integer itemsCount,
        Integer totalQty,
        BigDecimal totalSum,
        List<OrderLineResponse> items) {}
