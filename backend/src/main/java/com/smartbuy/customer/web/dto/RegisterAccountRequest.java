package com.smartbuy.customer.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterAccountRequest(
    @NotBlank String name,
    @Email String email,
    @NotBlank @Size(min = 4) String password
) {
}

