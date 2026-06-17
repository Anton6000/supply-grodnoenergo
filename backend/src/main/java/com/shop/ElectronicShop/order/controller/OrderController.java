package com.shop.ElectronicShop.order.controller;

import com.shop.ElectronicShop.order.dto.AddOrderItemRequest;
import com.shop.ElectronicShop.order.dto.ChangeOrderQuantityRequest;
import com.shop.ElectronicShop.order.dto.OrderCountsResponse;
import com.shop.ElectronicShop.order.dto.OrderResponse;
import com.shop.ElectronicShop.order.dto.PickupOrdersRequest;
import com.shop.ElectronicShop.order.dto.PickupOrdersResponse;
import com.shop.ElectronicShop.order.dto.UpdateOrderStatusRequest;
import com.shop.ElectronicShop.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/current")
    public ResponseEntity<OrderResponse> current(@RequestParam String userId) {
        return ResponseEntity.ok(orderService.current(userId));
    }

    @PostMapping("/current/items")
    public ResponseEntity<OrderResponse> addItem(
            @RequestParam String userId, @RequestBody AddOrderItemRequest request) {
        return ResponseEntity.ok(orderService.addItem(userId, request.supplyGoodId()));
    }

    @PatchMapping("/current/items/{supplyGoodId}")
    public ResponseEntity<OrderResponse> changeQuantity(
            @RequestParam String userId,
            @PathVariable String supplyGoodId,
            @RequestBody ChangeOrderQuantityRequest request) {
        return ResponseEntity.ok(orderService.changeQuantity(userId, supplyGoodId, request.delta(), request.quantity()));
    }

    @DeleteMapping("/current/items")
    public ResponseEntity<OrderResponse> removeItems(
            @RequestParam String userId, @RequestParam List<String> supplyGoodIds) {
        return ResponseEntity.ok(orderService.removeItems(userId, supplyGoodIds));
    }

    @PostMapping("/current/place")
    public ResponseEntity<OrderResponse> place(@RequestParam String userId) {
        return ResponseEntity.ok(orderService.place(userId));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> accountOrders(@RequestParam String userId) {
        return ResponseEntity.ok(orderService.ordersForAccount(userId));
    }

    /** Заказы всех клиентов (без статуса draft) для администратора и кладовщика. */
    @GetMapping("/workspace")
    public ResponseEntity<List<OrderResponse>> workspaceOrders() {
        return ResponseEntity.ok(orderService.ordersWorkspace());
    }

    @GetMapping("/counts")
    public ResponseEntity<OrderCountsResponse> counts(@RequestParam String userId) {
        return ResponseEntity.ok(orderService.counts(userId));
    }

    @PostMapping("/pickup")
    public ResponseEntity<PickupOrdersResponse> pickup(
            @RequestParam String userId, @RequestBody PickupOrdersRequest request) {
        return ResponseEntity.ok(new PickupOrdersResponse(orderService.pickup(userId, request.orderIds())));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String orderId, @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, request.status()));
    }
}
