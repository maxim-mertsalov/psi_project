package com.smartbuy.order.web.dto;

import com.smartbuy.order.domain.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderSummaryResponse(
    Long orderId,
    String orderNumber,
    OrderStatus status,
    BigDecimal totalAmount,
    Instant createdAt,
    String ownerEmail,
    String guestEmail
) {
}

