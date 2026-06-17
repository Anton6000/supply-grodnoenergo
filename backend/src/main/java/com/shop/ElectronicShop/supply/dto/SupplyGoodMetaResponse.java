package com.shop.ElectronicShop.supply.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SupplyGoodMetaResponse {

    private List<String> categories;

    /** Для каждой категории — отсортированный список подкатегорий. */
    private Map<String, List<String>> subcategoriesByCategory;

    private List<String> brands;
    private List<String> countries;
}
