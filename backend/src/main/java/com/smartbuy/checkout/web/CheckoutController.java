package com.smartbuy.checkout.web;

import com.smartbuy.checkout.service.CheckoutService;
import com.smartbuy.checkout.web.dto.CheckoutRequest;
import com.smartbuy.checkout.web.dto.CheckoutResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/orders")
    public CheckoutResponse checkout(
        @RequestHeader("X-Session-Id") String sessionId,
        @RequestHeader(value = "X-Auth-Token", required = false) String authToken,
        @Valid @RequestBody CheckoutRequest request
    ) {
        return checkoutService.checkout(sessionId, request, authToken);
    }
}


