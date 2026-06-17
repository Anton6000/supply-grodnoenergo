package com.shop.ElectronicShop.supply.repository;

import com.shop.ElectronicShop.supply.entity.SupplyGood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplyGoodRepository extends JpaRepository<SupplyGood, String>, JpaSpecificationExecutor<SupplyGood> {

    @Query(
            """
            select sg.category as category, sg.subcategory as subcategory, count(sg.supplyGoodId) as productCount
            from SupplyGood sg
            group by sg.category, sg.subcategory
            order by sg.category asc, sg.subcategory asc
            """)
    List<SupplyCategorySubcategoryStats> listStatsByCategoryAndSubcategory();

    @Query("select distinct sg.category from SupplyGood sg order by sg.category asc")
    List<String> findDistinctCategories();

    @Query("select distinct sg.brand from SupplyGood sg order by sg.brand asc")
    List<String> findDistinctBrands();

    @Query("select distinct sg.country from SupplyGood sg order by sg.country asc")
    List<String> findDistinctCountries();

    @Query("SELECT sg.supplyGoodId FROM SupplyGood sg WHERE sg.supplyGoodId LIKE :pfx")
    List<String> findSupplyGoodIdsByPrefix(@Param("pfx") String pfx);
}
