package com.smartbuy.checkout.web.dto;

import com.smartbuy.order.domain.OrderStatus;

import java.math.BigDecimal;

public record CheckoutResponse(
    Long orderId,
    String orderNumber,
    OrderStatus status,
    BigDecimal totalAmount
) {
}

