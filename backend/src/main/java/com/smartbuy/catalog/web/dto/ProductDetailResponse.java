package com.smartbuy.catalog.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
    Long id,
    String name,
    String description,
    BigDecimal price,
    boolean available,
    int stockAvailable,
    List<ProductSummaryResponse> similarProducts
) {
}

