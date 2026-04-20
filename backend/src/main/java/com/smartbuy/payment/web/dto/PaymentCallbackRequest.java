package com.smartbuy.payment.web.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentCallbackRequest(
    @NotBlank String externalReference,
    @NotBlank String result
) {
}

