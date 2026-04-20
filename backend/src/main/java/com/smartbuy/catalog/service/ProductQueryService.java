package com.smartbuy.catalog.service;

import com.smartbuy.catalog.domain.Product;
import com.smartbuy.catalog.domain.StockItem;
import com.smartbuy.catalog.repository.ProductRepository;
import com.smartbuy.catalog.repository.StockItemRepository;
import com.smartbuy.catalog.web.dto.ProductDetailResponse;
import com.smartbuy.catalog.web.dto.ProductSummaryResponse;
import com.smartbuy.shared.exception.BadRequestException;
import com.smartbuy.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ProductQueryService {

    private final ProductRepository productRepository;
    private final StockItemRepository stockItemRepository;

    public ProductQueryService(ProductRepository productRepository, StockItemRepository stockItemRepository) {
        this.productRepository = productRepository;
        this.stockItemRepository = stockItemRepository;
    }

    public List<ProductSummaryResponse> findProducts(String query, BigDecimal minPrice, BigDecimal maxPrice, Boolean availableOnly) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("minPrice must be <= maxPrice");
        }

        List<Product> products = productRepository.findAll();
        String normalized = query == null ? "" : query.toLowerCase(Locale.ROOT);

        return products.stream()
            .filter(p -> normalized.isBlank() || p.getName().toLowerCase(Locale.ROOT).contains(normalized))
            .filter(p -> minPrice == null || p.getBasePrice().compareTo(minPrice) >= 0)
            .filter(p -> maxPrice == null || p.getBasePrice().compareTo(maxPrice) <= 0)
            .filter(p -> availableOnly == null || !availableOnly || p.isAvailable())
            .sorted(Comparator.comparing(Product::getName))
            .map(this::toSummary)
            .toList();
    }

    public ProductDetailResponse getProductDetail(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found: " + id));

        List<ProductSummaryResponse> similar = new ArrayList<>();
        if (product.getCategory() != null) {
            similar = productRepository.findByCategoryIdAndIdNot(product.getCategory().getId(), product.getId()).stream()
                .limit(3)
                .map(this::toSummary)
                .toList();
        }

        StockItem stockItem = stockItemRepository.findByProductId(product.getId()).orElse(null);
        int availableStock = stockItem == null ? 0 : stockItem.getAvailableQuantity();

        return new ProductDetailResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getBasePrice(),
            product.isAvailable(),
            availableStock,
            similar
        );
    }

    private ProductSummaryResponse toSummary(Product product) {
        int availableStock = stockItemRepository.findByProductId(product.getId())
            .map(StockItem::getAvailableQuantity)
            .orElse(0);

        return new ProductSummaryResponse(
            product.getId(),
            product.getName(),
            product.getBasePrice(),
            product.isAvailable(),
            availableStock
        );
    }
}

