package com.shop.ElectronicShop.order.repository;

import com.shop.ElectronicShop.order.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, String> {

    Optional<CustomerOrder> findFirstByUserIdAndStatusOrderByUpdatedAtDesc(String userId, String status);

    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT o.orderId FROM CustomerOrder o WHERE o.orderId LIKE :pfx")
    List<String> findOrderIdsByPrefix(@Param("pfx") String pfx);

    long countByUserIdAndStatusNotIn(String userId, List<String> statuses);

    List<CustomerOrder> findByStatusNotOrderByUpdatedAtDesc(String status);
}
