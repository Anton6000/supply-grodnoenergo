package com.shop.ElectronicShop.order.service;

import com.shop.ElectronicShop.client.entity.Client;
import com.shop.ElectronicShop.client.repository.ClientRepository;
import com.shop.ElectronicShop.order.dto.OrderCountsResponse;
import com.shop.ElectronicShop.order.dto.OrderLineResponse;
import com.shop.ElectronicShop.order.dto.OrderResponse;
import com.shop.ElectronicShop.order.entity.CustomerOrder;
import com.shop.ElectronicShop.order.entity.OrderLine;
import com.shop.ElectronicShop.order.repository.CustomerOrderRepository;
import com.shop.ElectronicShop.order.repository.OrderLineRepository;
import com.shop.ElectronicShop.supply.entity.SupplyGood;
import com.shop.ElectronicShop.supply.repository.SupplyGoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    public static final String STATUS_DRAFT = "draft";
    public static final String STATUS_WAITING = "в ожидании";
    public static final String STATUS_READY = "готов к получению";
    public static final String STATUS_RECEIVED = "получен";

    private static final Set<String> FINISHED_STATUSES = Set.of(STATUS_RECEIVED, "доставлен");

    private final CustomerOrderRepository orderRepository;
    private final OrderLineRepository lineRepository;
    private final SupplyGoodRepository supplyGoodRepository;
    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public OrderResponse current(String rawUserId) {
        String userId = normalizeUserId(rawUserId);
        return orderRepository
                .findFirstByUserIdAndStatusOrderByUpdatedAtDesc(userId, STATUS_DRAFT)
                .map(this::toResponse)
                .orElseGet(() -> emptyCurrent(userId));
    }

    @Transactional
    public OrderResponse addItem(String rawUserId, String rawSupplyGoodId) {
        String userId = normalizeUserId(rawUserId);
        String supplyGoodId = normalizeId(rawSupplyGoodId, "supplyGoodId");
        CustomerOrder order = ensureDraftOrder(userId);
        SupplyGood supplyGood =
                supplyGoodRepository
                        .findById(supplyGoodId)
                        .orElseThrow(() -> new IllegalArgumentException("Товар не найден: " + supplyGoodId));

        OrderLine line =
                lineRepository
                        .findByOrderOrderIdAndSupplyGoodSupplyGoodId(order.getOrderId(), supplyGoodId)
                        .orElseGet(
                                () -> {
                                    OrderLine created = new OrderLine();
                                    created.setOrderLineId(nextLineId());
                                    created.setOrder(order);
                                    created.setSupplyGood(supplyGood);
                                    created.setQuantity(0);
                                    created.setUnitPrice(supplyGood.getPrice());
                                    return created;
                                });

        line.setQuantity((line.getQuantity() == null ? 0 : line.getQuantity()) + 1);
        lineRepository.save(line);
        touch(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse changeQuantity(String rawUserId, String rawSupplyGoodId, Integer delta, Integer quantity) {
        String userId = normalizeUserId(rawUserId);
        String supplyGoodId = normalizeId(rawSupplyGoodId, "supplyGoodId");
        CustomerOrder order = findDraftOrder(userId);
        OrderLine line =
                lineRepository
                        .findByOrderOrderIdAndSupplyGoodSupplyGoodId(order.getOrderId(), supplyGoodId)
                        .orElseThrow(() -> new IllegalArgumentException("Позиция не найдена: " + supplyGoodId));

        int nextQty =
                quantity != null
                        ? quantity
                        : (line.getQuantity() == null ? 0 : line.getQuantity()) + (delta == null ? 0 : delta);

        if (nextQty <= 0) {
            lineRepository.delete(line);
        } else {
            line.setQuantity(nextQty);
            lineRepository.save(line);
        }
        touch(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse removeItems(String rawUserId, List<String> rawSupplyGoodIds) {
        String userId = normalizeUserId(rawUserId);
        CustomerOrder order = findDraftOrder(userId);
        List<String> supplyGoodIds =
                (rawSupplyGoodIds == null ? List.<String>of() : rawSupplyGoodIds).stream()
                        .map((id) -> normalizeId(id, "supplyGoodId"))
                        .distinct()
                        .toList();
        if (!supplyGoodIds.isEmpty()) {
            lineRepository.deleteByOrderOrderIdAndSupplyGoodSupplyGoodIdIn(order.getOrderId(), supplyGoodIds);
            touch(order);
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse place(String rawUserId) {
        String userId = normalizeUserId(rawUserId);
        CustomerOrder order = findDraftOrder(userId);
        if (lineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(order.getOrderId()).isEmpty()) {
            throw new IllegalStateException("Нельзя оформить пустой заказ");
        }
        order.setStatus(STATUS_WAITING);
        touch(order);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> ordersForAccount(String rawUserId) {
        String userId = normalizeUserId(rawUserId);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter((order) -> !STATUS_DRAFT.equals(order.getStatus()))
                .map(this::toResponse)
                .toList();
    }

    /** Все оформленные заказы (не черновики): админка, кладовщик. */
    @Transactional(readOnly = true)
    public List<OrderResponse> ordersWorkspace() {
        return orderRepository.findByStatusNotOrderByUpdatedAtDesc(STATUS_DRAFT).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public int pickup(String rawUserId, List<String> rawOrderIds) {
        String userId = normalizeUserId(rawUserId);
        List<String> orderIds =
                (rawOrderIds == null ? List.<String>of() : rawOrderIds).stream()
                        .map((id) -> normalizeId(id, "orderId"))
                        .distinct()
                        .toList();
        int changed = 0;
        LocalDateTime now = now();
        for (String orderId : orderIds) {
            CustomerOrder order = orderRepository.findById(orderId).orElse(null);
            if (order == null || !userId.equals(order.getUserId()) || !STATUS_READY.equals(order.getStatus())) {
                continue;
            }
            order.setStatus(STATUS_RECEIVED);
            order.setUpdatedAt(now);
            orderRepository.save(order);
            changed++;
        }
        return changed;
    }

    @Transactional
    public OrderResponse updateStatus(String rawOrderId, String rawStatus) {
        String orderId = normalizeId(rawOrderId, "orderId");
        String status = normalizeStatus(rawStatus);
        CustomerOrder order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() -> new IllegalArgumentException("Заказ не найден: " + orderId));
        order.setStatus(status);
        touch(order);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderCountsResponse counts(String rawUserId) {
        String userId = normalizeUserId(rawUserId);
        int cartCount =
                orderRepository
                        .findFirstByUserIdAndStatusOrderByUpdatedAtDesc(userId, STATUS_DRAFT)
                        .map((order) -> lineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(order.getOrderId()).size())
                        .orElse(0);
        int activeCount =
                (int) orderRepository.countByUserIdAndStatusNotIn(userId, List.of(STATUS_DRAFT, STATUS_RECEIVED, "доставлен"));
        return new OrderCountsResponse(cartCount, activeCount);
    }

    private CustomerOrder ensureDraftOrder(String userId) {
        return orderRepository
                .findFirstByUserIdAndStatusOrderByUpdatedAtDesc(userId, STATUS_DRAFT)
                .orElseGet(
                        () -> {
                            CustomerOrder order = new CustomerOrder();
                            LocalDateTime now = now();
                            order.setOrderId(nextOrderId());
                            order.setUserId(userId);
                            order.setStatus(STATUS_DRAFT);
                            order.setCreatedAt(now);
                            order.setUpdatedAt(now);
                            return orderRepository.save(order);
                        });
    }

    private CustomerOrder findDraftOrder(String userId) {
        return orderRepository
                .findFirstByUserIdAndStatusOrderByUpdatedAtDesc(userId, STATUS_DRAFT)
                .orElseThrow(() -> new IllegalStateException("Текущий заказ не найден"));
    }

    private void touch(CustomerOrder order) {
        order.setUpdatedAt(now());
        orderRepository.save(order);
    }

    private OrderResponse emptyCurrent(String userId) {
        return clientRepository
                .findById(userId)
                .map(
                        (client) ->
                                new OrderResponse(
                                        null,
                                        "",
                                        userId,
                                        userId,
                                        client.getFullName(),
                                        client.getPosition(),
                                        client.getTabNumber(),
                                        STATUS_DRAFT,
                                        null,
                                        null,
                                        null,
                                        0,
                                        0,
                                        BigDecimal.ZERO,
                                        List.of()))
                .orElseGet(
                        () ->
                                new OrderResponse(
                                        null,
                                        "",
                                        userId,
                                        userId,
                                        userId,
                                        "—",
                                        "—",
                                        STATUS_DRAFT,
                                        null,
                                        null,
                                        null,
                                        0,
                                        0,
                                        BigDecimal.ZERO,
                                        List.of()));
    }

    private OrderResponse toResponse(CustomerOrder order) {
        List<OrderLineResponse> items =
                lineRepository.findByOrderOrderIdOrderByOrderLineIdAsc(order.getOrderId()).stream()
                        .map(this::toLineResponse)
                        .toList();
        int totalQty = items.stream().mapToInt((line) -> line.qty() == null ? 0 : line.qty()).sum();
        BigDecimal totalSum =
                items.stream()
                        .map(OrderLineResponse::lineTotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        String status = order.getStatus();
        return clientRepository
                .findById(order.getUserId())
                .map(
                        (client) ->
                                new OrderResponse(
                                        order.getOrderId(),
                                        numberFromOrderId(order.getOrderId()),
                                        order.getUserId(),
                                        order.getUserId(),
                                        client.getFullName(),
                                        client.getPosition(),
                                        client.getTabNumber(),
                                        status,
                                        order.getCreatedAt(),
                                        order.getUpdatedAt(),
                                        FINISHED_STATUSES.contains(status) ? order.getUpdatedAt() : null,
                                        items.size(),
                                        totalQty,
                                        totalSum,
                                        items))
                .orElseGet(
                        () ->
                                new OrderResponse(
                                        order.getOrderId(),
                                        numberFromOrderId(order.getOrderId()),
                                        order.getUserId(),
                                        order.getUserId(),
                                        order.getUserId(),
                                        "—",
                                        "—",
                                        status,
                                        order.getCreatedAt(),
                                        order.getUpdatedAt(),
                                        FINISHED_STATUSES.contains(status) ? order.getUpdatedAt() : null,
                                        items.size(),
                                        totalQty,
                                        totalSum,
                                        items));
    }

    private OrderLineResponse toLineResponse(OrderLine line) {
        SupplyGood good = line.getSupplyGood();
        BigDecimal unitPrice = line.getUnitPrice() == null ? BigDecimal.ZERO : line.getUnitPrice();
        int qty = line.getQuantity() == null ? 0 : line.getQuantity();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
        return new OrderLineResponse(
                line.getOrderLineId(),
                good.getSupplyGoodId(),
                good.getGoodName(),
                good.getImageUrl(),
                good.getCategory(),
                good.getSubcategory(),
                good.getUnit(),
                unitPrice,
                qty,
                lineTotal);
    }

    private String nextOrderId() {
        return "OR-" + (maxSuffix(orderRepository.findOrderIdsByPrefix("OR-%")) + 1);
    }

    private String nextLineId() {
        return "OL-" + (maxSuffix(lineRepository.findOrderLineIdsByPrefix("OL-%")) + 1);
    }

    private int maxSuffix(List<String> ids) {
        return ids.stream().map(this::suffixNumber).max(Comparator.naturalOrder()).orElse(1000);
    }

    private int suffixNumber(String id) {
        int idx = id == null ? -1 : id.lastIndexOf('-');
        if (idx < 0 || idx >= id.length() - 1) {
            return 1000;
        }
        try {
            return Integer.parseInt(id.substring(idx + 1));
        } catch (NumberFormatException e) {
            return 1000;
        }
    }

    private String normalizeUserId(String raw) {
        return normalizeId(raw, "userId");
    }

    private String normalizeId(String raw, String field) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(field + " обязателен");
        }
        return raw.trim();
    }

    private String normalizeStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new IllegalArgumentException("status обязателен");
        }
        return rawStatus.trim().toLowerCase(Locale.ROOT);
    }

    private String numberFromOrderId(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            return "";
        }
        int idx = orderId.lastIndexOf('-');
        return idx >= 0 && idx < orderId.length() - 1 ? orderId.substring(idx + 1) : orderId;
    }

    private LocalDateTime now() {
        return LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }
}
