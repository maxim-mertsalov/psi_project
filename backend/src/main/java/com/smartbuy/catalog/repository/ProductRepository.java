package com.smartbuy.catalog.repository;

import com.smartbuy.catalog.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIdAndIdNot(Long categoryId, Long id);
}

