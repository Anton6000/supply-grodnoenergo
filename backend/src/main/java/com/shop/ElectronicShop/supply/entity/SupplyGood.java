package com.shop.ElectronicShop.supply.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "supply_goods")
@Getter
@Setter
@NoArgsConstructor
public class SupplyGood {

    @Id
    @Column(name = "supply_good_id", length = 32)
    private String supplyGoodId;

    @Column(name = "good_name", nullable = false, columnDefinition = "TEXT")
    private String goodName;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 200)
    private String category;

    @Column(nullable = false, length = 200)
    private String subcategory;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(nullable = false, length = 32)
    private String unit;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal price;
}
