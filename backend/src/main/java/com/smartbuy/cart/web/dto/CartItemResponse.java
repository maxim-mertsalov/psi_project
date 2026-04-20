package com.smartbuy.cart.web.dto;

import java.math.BigDecimal;

public record CartItemResponse(
    Long itemId,
    Long productId,
    String productName,
    int quantity,
    BigDecimal unitPriceSnapshot,
    BigDecimal currentUnitPrice,
    boolean priceChanged,
    BigDecimal lineTotal
) {
}

