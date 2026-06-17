package com.shop.ElectronicShop.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class CustomerOrder {

    @Id
    @Column(name = "order_id", length = 20)
    private String orderId;

    @Column(name = "user_id", nullable = false, length = 15)
    private String userId;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "created_at", nullable = false, columnDefinition = "timestamp(0)")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, columnDefinition = "timestamp(0)")
    private LocalDateTime updatedAt;
}
