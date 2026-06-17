package com.shop.ElectronicShop.order.dto;

import java.util.List;

public record PickupOrdersRequest(List<String> orderIds) {}
