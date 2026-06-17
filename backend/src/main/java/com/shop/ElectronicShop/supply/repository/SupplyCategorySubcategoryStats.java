package com.shop.ElectronicShop.supply.repository;

/** Проекция для группировки по категории и подкатегории из {@code SupplyGood}. */
public interface SupplyCategorySubcategoryStats {

    String getCategory();

    String getSubcategory();

    Long getProductCount();
}
