package com.smartbuy.catalog.web.dto;

import java.math.BigDecimal;

public record AdminProductResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    boolean available,
    String category,
    int stockQuantity
) {
}

