package com.smartbuy.catalog.service;

import com.smartbuy.catalog.domain.Category;
import com.smartbuy.catalog.domain.Product;
import com.smartbuy.catalog.domain.StockItem;
import com.smartbuy.catalog.repository.CategoryRepository;
import com.smartbuy.catalog.repository.ProductRepository;
import com.smartbuy.catalog.repository.StockItemRepository;
import com.smartbuy.catalog.web.dto.AdminProductResponse;
import com.smartbuy.catalog.web.dto.AdminProductUpsertRequest;
import com.smartbuy.customer.domain.AccountRole;
import com.smartbuy.customer.service.AuthService;
import com.smartbuy.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockItemRepository stockItemRepository;
    private final AuthService authService;

    public AdminProductService(ProductRepository productRepository, CategoryRepository categoryRepository, StockItemRepository stockItemRepository, AuthService authService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.stockItemRepository = stockItemRepository;
        this.authService = authService;
    }

    public List<AdminProductResponse> list(String authToken) {
        authService.requireRole(authToken, AccountRole.ADMIN);
        return productRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AdminProductResponse create(String authToken, AdminProductUpsertRequest request) {
        authService.requireRole(authToken, AccountRole.ADMIN);
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new NotFoundException("Category not found: " + request.categoryId()));

        Product product = new Product();
        apply(product, request, category);
        Product saved = productRepository.save(product);
        saveStock(saved, request.stockQuantity());
        return toResponse(saved);
    }

    public AdminProductResponse update(String authToken, Long productId, AdminProductUpsertRequest request) {
        authService.requireRole(authToken, AccountRole.ADMIN);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new NotFoundException("Category not found: " + request.categoryId()));

        apply(product, request, category);
        Product saved = productRepository.save(product);
        saveStock(saved, request.stockQuantity());
        return toResponse(saved);
    }

    public void delete(String authToken, Long productId) {
        authService.requireRole(authToken, AccountRole.ADMIN);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
        stockItemRepository.findByProductId(product.getId()).ifPresent(stockItemRepository::delete);
        productRepository.delete(product);
    }

    private void saveStock(Product product, int quantity) {
        StockItem stockItem = stockItemRepository.findByProductId(product.getId()).orElseGet(StockItem::new);
        stockItem.setProduct(product);
        stockItem.setQuantityOnHand(quantity);
        stockItem.setQuantityReserved(0);
        stockItemRepository.save(stockItem);
    }

    private void apply(Product product, AdminProductUpsertRequest request, Category category) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setBasePrice(request.price());
        product.setAvailable(request.available());
        product.setCategory(category);
    }

    private AdminProductResponse toResponse(Product product) {
        int stock = stockItemRepository.findByProductId(product.getId())
            .map(StockItem::getAvailableQuantity)
            .orElse(0);
        String category = product.getCategory() == null ? null : product.getCategory().getName();
        return new AdminProductResponse(product.getId(), product.getName(), product.getDescription(), product.getBasePrice(), product.isAvailable(), category, stock);
    }
}

