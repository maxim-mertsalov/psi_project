package com.smartbuy.customer.repository;

import com.smartbuy.customer.domain.AccountSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountSessionRepository extends JpaRepository<AccountSession, Long> {

    Optional<AccountSession> findByToken(String token);
}

