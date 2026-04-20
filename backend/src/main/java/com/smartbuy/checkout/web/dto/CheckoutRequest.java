package com.smartbuy.checkout.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CheckoutRequest(
    @Email String guestEmail,
    @NotBlank String shippingMethod,
    @NotNull @DecimalMin(value = "0.00") BigDecimal shippingPrice,
    @NotBlank String paymentMethod,
    @NotNull @Valid AddressDto address
) {
}

