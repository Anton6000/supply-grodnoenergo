package com.shop.ElectronicShop.supply.dto;

import com.shop.ElectronicShop.supply.repository.SupplyCategorySubcategoryStats;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CatalogSubcategoryRowResponse {

    private String category;
    private String subcategory;
    private long productCount;

    public static CatalogSubcategoryRowResponse from(SupplyCategorySubcategoryStats s) {
        long cnt = s.getProductCount() != null ? s.getProductCount() : 0L;
        return new CatalogSubcategoryRowResponse(s.getCategory(), s.getSubcategory(), cnt);
    }
}
