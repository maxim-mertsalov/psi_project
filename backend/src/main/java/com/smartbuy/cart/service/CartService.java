package com.smartbuy.cart.service;

import com.smartbuy.catalog.domain.Product;
import com.smartbuy.catalog.domain.StockItem;
import com.smartbuy.catalog.repository.ProductRepository;
import com.smartbuy.catalog.repository.StockItemRepository;
import com.smartbuy.cart.domain.Cart;
import com.smartbuy.cart.domain.CartItem;
import com.smartbuy.cart.repository.CartRepository;
import com.smartbuy.cart.web.dto.CartItemResponse;
import com.smartbuy.cart.web.dto.CartResponse;
import com.smartbuy.shared.exception.BadRequestException;
import com.smartbuy.shared.exception.ConflictException;
import com.smartbuy.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final StockItemRepository stockItemRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository, StockItemRepository stockItemRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.stockItemRepository = stockItemRepository;
    }

    public CartResponse getCart(String sessionId) {
        Cart cart = getOrCreateCart(sessionId);
        return toResponse(cart);
    }

    public CartResponse addItem(String sessionId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found: " + productId));

        int currentInCart = cart.getItems().stream()
            .filter(i -> i.getProduct().getId().equals(productId))
            .mapToInt(CartItem::getQuantity)
            .sum();

        int target = currentInCart + quantity;
        validateStock(productId, target);

        Optional<CartItem> existing = cart.getItems().stream()
            .filter(i -> i.getProduct().getId().equals(productId))
            .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(target);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPriceSnapshot(product.getBasePrice());
            cart.getItems().add(item);
        }

        cart.setUpdatedAt(Instant.now());
        return toResponse(cartRepository.save(cart));
    }

    public CartResponse updateItem(String sessionId, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(sessionId);
        CartItem item = cart.getItems().stream()
            .filter(i -> i.getId().equals(itemId))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Cart item not found: " + itemId));

        validateStock(item.getProduct().getId(), quantity);
        item.setQuantity(quantity);
        cart.setUpdatedAt(Instant.now());
        return toResponse(cartRepository.save(cart));
    }

    public CartResponse removeItem(String sessionId, Long itemId) {
        Cart cart = getOrCreateCart(sessionId);
        boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new NotFoundException("Cart item not found: " + itemId);
        }
        cart.setUpdatedAt(Instant.now());
        return toResponse(cartRepository.save(cart));
    }

    public Cart getOrCreateCart(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new BadRequestException("sessionId is required");
        }

        return cartRepository.findBySessionId(sessionId)
            .orElseGet(() -> {
                Cart cart = new Cart();
                cart.setSessionId(sessionId);
                cart.setCreatedAt(Instant.now());
                cart.setUpdatedAt(Instant.now());
                return cartRepository.save(cart);
            });
    }

    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
    }

    private void validateStock(Long productId, int quantity) {
        StockItem stockItem = stockItemRepository.findByProductId(productId)
            .orElseThrow(() -> new ConflictException("No stock item for product: " + productId));

        int available = stockItem.getAvailableQuantity();
        if (quantity > available) {
            throw new ConflictException("Requested quantity exceeds stock. maxAvailable=" + available);
        }
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            BigDecimal currentPrice = item.getProduct().getBasePrice();
            boolean priceChanged = currentPrice.compareTo(item.getUnitPriceSnapshot()) != 0;
            BigDecimal lineTotal = item.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            itemResponses.add(new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPriceSnapshot(),
                currentPrice,
                priceChanged,
                lineTotal
            ));
        }

        return new CartResponse(cart.getId(), cart.getSessionId(), itemResponses, subtotal);
    }
}

