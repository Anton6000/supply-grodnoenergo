package com.shop.ElectronicShop.client.dto;

public record SystemUserUpsertRequest(
        String fullName,
        String position,
        String employeeId,
        String tabNumber,
        String phone,
        String email,
        String password,
        String role) {}
