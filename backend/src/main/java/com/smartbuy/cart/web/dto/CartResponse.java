package com.smartbuy.cart.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
    Long cartId,
    String sessionId,
    List<CartItemResponse> items,
    BigDecimal subtotal
) {
}

