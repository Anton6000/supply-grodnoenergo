package com.shop.ElectronicShop.supply.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/** Каталог с главной страницы: строки категория — подкатегория — число номенклатурных позиций. */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SupplyCatalogSummaryResponse {

    private List<CatalogSubcategoryRowResponse> rows;

    /** Уникальные категории в порядке первого появления в списке строк. */
    private List<String> categories;
}
