package com.smartbuy.cart.web;

import com.smartbuy.cart.service.CartService;
import com.smartbuy.cart.web.dto.AddCartItemRequest;
import com.smartbuy.cart.web.dto.CartResponse;
import com.smartbuy.cart.web.dto.UpdateCartItemRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse getCart(@RequestHeader("X-Session-Id") String sessionId) {
        return cartService.getCart(sessionId);
    }

    @PostMapping("/items")
    public CartResponse addItem(
        @RequestHeader("X-Session-Id") String sessionId,
        @Valid @RequestBody AddCartItemRequest request
    ) {
        return cartService.addItem(sessionId, request.productId(), request.quantity());
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse updateItem(
        @RequestHeader("X-Session-Id") String sessionId,
        @PathVariable Long itemId,
        @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateItem(sessionId, itemId, request.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(
        @RequestHeader("X-Session-Id") String sessionId,
        @PathVariable Long itemId
    ) {
        return cartService.removeItem(sessionId, itemId);
    }
}

