package com.smartbuy.catalog.web;

import com.smartbuy.catalog.service.AdminProductService;
import com.smartbuy.catalog.web.dto.AdminProductResponse;
import com.smartbuy.catalog.web.dto.AdminProductUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping
    public List<AdminProductResponse> list(@RequestHeader("X-Auth-Token") String authToken) {
        return adminProductService.list(authToken);
    }

    @PostMapping
    public AdminProductResponse create(@RequestHeader("X-Auth-Token") String authToken, @Valid @RequestBody AdminProductUpsertRequest request) {
        return adminProductService.create(authToken, request);
    }

    @PutMapping("/{productId}")
    public AdminProductResponse update(
        @RequestHeader("X-Auth-Token") String authToken,
        @PathVariable Long productId,
        @Valid @RequestBody AdminProductUpsertRequest request
    ) {
        return adminProductService.update(authToken, productId, request);
    }

    @DeleteMapping("/{productId}")
    public void delete(@RequestHeader("X-Auth-Token") String authToken, @PathVariable Long productId) {
        adminProductService.delete(authToken, productId);
    }
}

