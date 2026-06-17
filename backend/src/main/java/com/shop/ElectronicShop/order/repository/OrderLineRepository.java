package com.shop.ElectronicShop.order.repository;

import com.shop.ElectronicShop.order.entity.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderLineRepository extends JpaRepository<OrderLine, String> {

    List<OrderLine> findByOrderOrderIdOrderByOrderLineIdAsc(String orderId);

    Optional<OrderLine> findByOrderOrderIdAndSupplyGoodSupplyGoodId(String orderId, String supplyGoodId);

    void deleteByOrderOrderIdAndSupplyGoodSupplyGoodIdIn(String orderId, Collection<String> supplyGoodIds);

    @Query("SELECT l.orderLineId FROM OrderLine l WHERE l.orderLineId LIKE :pfx")
    List<String> findOrderLineIdsByPrefix(@Param("pfx") String pfx);
}
