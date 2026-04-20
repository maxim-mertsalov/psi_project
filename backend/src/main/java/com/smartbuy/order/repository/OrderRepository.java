package com.smartbuy.order.repository;

import com.smartbuy.order.domain.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

	List<OrderEntity> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);

	Optional<OrderEntity> findByIdAndOwnerEmail(Long id, String ownerEmail);
}


