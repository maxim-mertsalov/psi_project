package com.smartbuy.payment.web.dto;

public record InitiatePaymentResponse(
    Long paymentId,
    String externalReference,
    String redirectUrl,
    String status
) {
}

