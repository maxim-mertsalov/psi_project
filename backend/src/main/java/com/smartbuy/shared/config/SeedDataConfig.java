package com.smartbuy.shared.config;

import com.smartbuy.catalog.domain.Category;
import com.smartbuy.catalog.domain.Product;
import com.smartbuy.catalog.domain.StockItem;
import com.smartbuy.catalog.repository.CategoryRepository;
import com.smartbuy.catalog.repository.ProductRepository;
import com.smartbuy.catalog.repository.StockItemRepository;
import com.smartbuy.customer.domain.Account;
import com.smartbuy.customer.domain.AccountRole;
import com.smartbuy.customer.repository.AccountRepository;
import com.smartbuy.customer.service.PasswordHashUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.Instant;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedData(
        CategoryRepository categoryRepository,
        ProductRepository productRepository,
        StockItemRepository stockItemRepository,
        AccountRepository accountRepository
    ) {
        return args -> {
            if (accountRepository.count() == 0) {
                Account admin = new Account();
                admin.setName("Admin");
                admin.setEmail("admin@smartbuy.test");
                admin.setPasswordHash(PasswordHashUtil.hash("admin123"));
                admin.setRole(AccountRole.ADMIN);
                admin.setCreatedAt(Instant.now());
                accountRepository.save(admin);

                Account warehouse = new Account();
                warehouse.setName("Warehouse");
                warehouse.setEmail("warehouse@smartbuy.test");
                warehouse.setPasswordHash(PasswordHashUtil.hash("warehouse123"));
                warehouse.setRole(AccountRole.WAREHOUSE);
                warehouse.setCreatedAt(Instant.now());
                accountRepository.save(warehouse);
            }

            if (productRepository.count() > 0) {
                return;
            }

            Category phones = new Category();
            phones.setName("Telefony");
            phones.setId(0L);
            categoryRepository.save(phones);

            Category laptops = new Category();
            laptops.setName("Notebooky");
            laptops.setId(1L);
            categoryRepository.save(laptops);

            Product p1 = new Product();
            p1.setName("Phone X1");
            p1.setDescription("Smartphone 8GB RAM, 256GB storage");
            p1.setBasePrice(new BigDecimal("699.00"));
            p1.setAvailable(true);
            p1.setCategory(phones);
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setName("Phone X2 Pro");
            p2.setDescription("Smartphone 12GB RAM, 512GB storage");
            p2.setBasePrice(new BigDecimal("899.00"));
            p2.setAvailable(true);
            p2.setCategory(phones);
            productRepository.save(p2);

            Product p3 = new Product();
            p3.setName("Laptop Air 14");
            p3.setDescription("Laptop 16GB RAM, 512GB SSD");
            p3.setBasePrice(new BigDecimal("1199.00"));
            p3.setAvailable(true);
            p3.setCategory(laptops);
            productRepository.save(p3);

            Product p4 = new Product();
            p4.setName("Laptop Basic 15");
            p4.setDescription("Laptop 8GB RAM, 256GB SSD");
            p4.setBasePrice(new BigDecimal("749.00"));
            p4.setAvailable(false);
            p4.setCategory(laptops);
            productRepository.save(p4);

            seedStock(stockItemRepository, p1, 20, 0);
            seedStock(stockItemRepository, p2, 5, 0);
            seedStock(stockItemRepository, p3, 8, 0);
            seedStock(stockItemRepository, p4, 0, 0);
        };
    }

    private void seedStock(StockItemRepository stockItemRepository, Product product, int onHand, int reserved) {
        StockItem stockItem = new StockItem();
        stockItem.setProduct(product);
        stockItem.setQuantityOnHand(onHand);
        stockItem.setQuantityReserved(reserved);
        stockItemRepository.save(stockItem);
    }
}


