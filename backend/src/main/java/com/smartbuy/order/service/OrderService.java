package com.smartbuy.order.service;

import com.smartbuy.catalog.domain.StockItem;
import com.smartbuy.catalog.repository.StockItemRepository;
import com.smartbuy.customer.domain.AccountRole;
import com.smartbuy.customer.service.AuthService;
import com.smartbuy.order.domain.OrderEntity;
import com.smartbuy.order.domain.OrderStatus;
import com.smartbuy.order.repository.OrderRepository;
import com.smartbuy.order.web.dto.OrderProcessResponse;
import com.smartbuy.order.web.dto.OrderSummaryResponse;
import com.smartbuy.shared.exception.ConflictException;
import com.smartbuy.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockItemRepository stockItemRepository;
    private final AuthService authService;

    public OrderService(OrderRepository orderRepository, StockItemRepository stockItemRepository, AuthService authService) {
        this.orderRepository = orderRepository;
        this.stockItemRepository = stockItemRepository;
        this.authService = authService;
    }

    public List<OrderSummaryResponse> listMyOrders(String authToken) {
        String email = authService.requireAccount(authToken).getEmail();
        return orderRepository.findByOwnerEmailOrderByCreatedAtDesc(email).stream()
            .map(this::toSummary)
            .toList();
    }

    public OrderProcessResponse cancelMyOrder(String authToken, Long orderId) {
        String email = authService.requireAccount(authToken).getEmail();
        OrderEntity order = orderRepository.findByIdAndOwnerEmail(orderId, email)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new ConflictException("Order can no longer be cancelled");
        }

        releaseReservedStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return new OrderProcessResponse(order.getId(), order.getStatus(), "Order cancelled");
    }

    public OrderProcessResponse processOrder(String authToken, Long orderId) {
        authService.requireRole(authToken, AccountRole.ADMIN, AccountRole.WAREHOUSE);
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new ConflictException("Order must be PAID before processing");
        }

        order.setStatus(OrderStatus.PROCESSING);
        orderRepository.save(order);
        return new OrderProcessResponse(order.getId(), order.getStatus(), "Order moved to processing");
    }

    public OrderProcessResponse shipOrder(String authToken, Long orderId) {
        authService.requireRole(authToken, AccountRole.ADMIN, AccountRole.WAREHOUSE);
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new ConflictException("Order must be PROCESSING before shipping");
        }

        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);
        return new OrderProcessResponse(order.getId(), order.getStatus(), "Order shipped");
    }

    private void releaseReservedStock(OrderEntity order) {
        order.getItems().forEach(item -> {
            StockItem stockItem = stockItemRepository.findByProductId(item.getProductId())
                .orElseThrow(() -> new NotFoundException("Stock item not found for product: " + item.getProductId()));
            stockItem.setQuantityReserved(Math.max(0, stockItem.getQuantityReserved() - item.getQuantity()));
            stockItemRepository.save(stockItem);
        });
    }

    private OrderSummaryResponse toSummary(OrderEntity order) {
        return new OrderSummaryResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getStatus(),
            order.getTotalAmount(),
            order.getCreatedAt(),
            order.getOwnerEmail(),
            order.getGuestEmail()
        );
    }
}

