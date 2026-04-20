package com.smartbuy.order.web.dto;

import com.smartbuy.order.domain.OrderStatus;

public record OrderProcessResponse(
    Long orderId,
    OrderStatus status,
    String message
) {
}

