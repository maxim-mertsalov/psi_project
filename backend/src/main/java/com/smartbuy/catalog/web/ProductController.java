package com.smartbuy.catalog.web;

import com.smartbuy.catalog.service.ProductQueryService;
import com.smartbuy.catalog.web.dto.ProductDetailResponse;
import com.smartbuy.catalog.web.dto.ProductSummaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductQueryService productQueryService;

    public ProductController(ProductQueryService productQueryService) {
        this.productQueryService = productQueryService;
    }

    @GetMapping
    public List<ProductSummaryResponse> getProducts(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) Boolean available
    ) {
        return productQueryService.findProducts(q, minPrice, maxPrice, available);
    }

    @GetMapping("/{id}")
    public ProductDetailResponse getProduct(@PathVariable Long id) {
        return productQueryService.getProductDetail(id);
    }
}

