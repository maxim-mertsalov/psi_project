package com.smartbuy.checkout.service;

import com.smartbuy.catalog.domain.StockItem;
import com.smartbuy.catalog.repository.StockItemRepository;
import com.smartbuy.cart.domain.Cart;
import com.smartbuy.cart.domain.CartItem;
import com.smartbuy.cart.service.CartService;
import com.smartbuy.checkout.web.dto.CheckoutRequest;
import com.smartbuy.checkout.web.dto.CheckoutResponse;
import com.smartbuy.customer.service.AuthService;
import com.smartbuy.order.domain.Address;
import com.smartbuy.order.domain.OrderEntity;
import com.smartbuy.order.domain.OrderItem;
import com.smartbuy.order.domain.OrderStatus;
import com.smartbuy.order.repository.OrderRepository;
import com.smartbuy.shared.exception.BadRequestException;
import com.smartbuy.shared.exception.ConflictException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class CheckoutService {

    private final CartService cartService;
    private final StockItemRepository stockItemRepository;
    private final OrderRepository orderRepository;
    private final AuthService authService;

    public CheckoutService(CartService cartService, StockItemRepository stockItemRepository, OrderRepository orderRepository, AuthService authService) {
        this.cartService = cartService;
        this.stockItemRepository = stockItemRepository;
        this.orderRepository = orderRepository;
        this.authService = authService;
    }

    public CheckoutResponse checkout(String sessionId, CheckoutRequest request, String authToken) {
        Cart cart = cartService.getOrCreateCart(sessionId);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        String ownerEmail = null;
        if (authToken != null && !authToken.isBlank()) {
            ownerEmail = authService.requireAccount(authToken).getEmail();
        }

        // Re-validate stock and price right before order creation.
        for (CartItem item : cart.getItems()) {
            StockItem stockItem = stockItemRepository.findByProductId(item.getProduct().getId())
                .orElseThrow(() -> new ConflictException("No stock for product: " + item.getProduct().getId()));

            if (item.getQuantity() > stockItem.getAvailableQuantity()) {
                throw new ConflictException("Product became unavailable during checkout: " + item.getProduct().getName());
            }

            if (item.getUnitPriceSnapshot().compareTo(item.getProduct().getBasePrice()) != 0) {
                throw new ConflictException("Product price changed during checkout: " + item.getProduct().getName());
            }
        }

        OrderEntity order = new OrderEntity();
        order.setOrderNumber("SB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setSessionId(sessionId);
        order.setOwnerEmail(ownerEmail);
        order.setGuestEmail(request.guestEmail());
        order.setShippingMethod(request.shippingMethod());
        order.setShippingPrice(request.shippingPrice());
        order.setPaymentMethod(request.paymentMethod());
        order.setStatus(OrderStatus.WAITING_FOR_PAYMENT);
        order.setCreatedAt(Instant.now());

        Address address = new Address();
        address.setStreet(request.address().street());
        address.setCity(request.address().city());
        address.setZipCode(request.address().zipCode());
        address.setCountry(request.address().country());
        order.setAddress(address);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProduct().getId());
            orderItem.setProductNameSnapshot(item.getProduct().getName());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(item.getUnitPriceSnapshot());
            order.getItems().add(orderItem);

            subtotal = subtotal.add(item.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity())));

            StockItem stockItem = stockItemRepository.findByProductId(item.getProduct().getId())
                .orElseThrow(() -> new ConflictException("No stock for product: " + item.getProduct().getId()));
            stockItem.setQuantityReserved(stockItem.getQuantityReserved() + item.getQuantity());
            stockItemRepository.save(stockItem);
        }

        order.setTotalAmount(subtotal.add(request.shippingPrice()));
        OrderEntity saved = orderRepository.save(order);

        cartService.clearCart(cart);

        return new CheckoutResponse(saved.getId(), saved.getOrderNumber(), saved.getStatus(), saved.getTotalAmount());
    }
}


