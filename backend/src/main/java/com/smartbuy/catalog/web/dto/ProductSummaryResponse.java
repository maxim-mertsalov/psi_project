package com.smartbuy.catalog.web.dto;

import java.math.BigDecimal;

public record ProductSummaryResponse(
    Long id,
    String name,
    BigDecimal price,
    boolean available,
    int stockAvailable
) {
}

