package com.smartbuy.customer.web.dto;

public record AuthResponse(
    Long accountId,
    String name,
    String email,
    String role,
    String token
) {
}

