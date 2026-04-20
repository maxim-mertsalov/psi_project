package com.smartbuy.payment.web.dto;

public record PaymentCallbackResponse(
    String status,
    String message
) {
}

