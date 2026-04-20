package com.smartbuy.payment.web;

import com.smartbuy.payment.service.PaymentService;
import com.smartbuy.payment.web.dto.InitiatePaymentResponse;
import com.smartbuy.payment.web.dto.PaymentCallbackRequest;
import com.smartbuy.payment.web.dto.PaymentCallbackResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{orderId}/initiate")
    public InitiatePaymentResponse initiate(@PathVariable Long orderId) {
        return paymentService.initiatePayment(orderId);
    }

    @PostMapping("/callback")
    public PaymentCallbackResponse callback(
        @RequestHeader("X-Payment-Secret") String callbackSecret,
        @Valid @RequestBody PaymentCallbackRequest request
    ) {
        return paymentService.processCallback(callbackSecret, request);
    }
}

