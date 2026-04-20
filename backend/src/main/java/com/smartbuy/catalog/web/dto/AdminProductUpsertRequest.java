package com.smartbuy.catalog.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AdminProductUpsertRequest(
    @NotBlank String name,
    String description,
    @NotNull @DecimalMin(value = "0.00") BigDecimal price,
    boolean available,
    @NotNull Long categoryId,
    @NotNull @Min(0) Integer stockQuantity
) {
}

