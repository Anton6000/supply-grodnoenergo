package com.shop.ElectronicShop.supply.dto;

import com.shop.ElectronicShop.supply.entity.SupplyGood;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SupplyGoodResponse {

    /** То же значение, что supply_good_id (например SG-1001). */
    private String id;

    private String goodName;
    private String imageUrl;
    private String category;
    private String subcategory;
    private String description;
    private String brand;
    private String country;
    private String unit;
    private BigDecimal price;

    public static SupplyGoodResponse fromEntity(SupplyGood e) {
        return new SupplyGoodResponse(
                e.getSupplyGoodId(),
                e.getGoodName(),
                e.getImageUrl(),
                e.getCategory(),
                e.getSubcategory(),
                e.getDescription(),
                e.getBrand(),
                e.getCountry(),
                e.getUnit(),
                e.getPrice());
    }
}
