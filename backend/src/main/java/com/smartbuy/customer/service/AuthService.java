package com.smartbuy.customer.service;

import com.smartbuy.customer.domain.Account;
import com.smartbuy.customer.domain.AccountRole;
import com.smartbuy.customer.domain.AccountSession;
import com.smartbuy.customer.repository.AccountRepository;
import com.smartbuy.customer.repository.AccountSessionRepository;
import com.smartbuy.customer.web.dto.AuthResponse;
import com.smartbuy.customer.web.dto.LoginRequest;
import com.smartbuy.customer.web.dto.RegisterAccountRequest;
import com.smartbuy.shared.exception.ConflictException;
import com.smartbuy.shared.exception.ForbiddenException;
import com.smartbuy.shared.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final AccountRepository accountRepository;
    private final AccountSessionRepository accountSessionRepository;

    public AuthService(AccountRepository accountRepository, AccountSessionRepository accountSessionRepository) {
        this.accountRepository = accountRepository;
        this.accountSessionRepository = accountSessionRepository;
    }

    public AuthResponse register(RegisterAccountRequest request) {
        if (accountRepository.findByEmail(request.email()).isPresent()) {
            throw new ConflictException("Email already exists");
        }

        Account account = new Account();
        account.setName(request.name());
        account.setEmail(request.email().toLowerCase());
        account.setPasswordHash(PasswordHashUtil.hash(request.password()));
        account.setRole(AccountRole.CUSTOMER);
        account.setCreatedAt(Instant.now());
        Account saved = accountRepository.save(account);

        return createSessionResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.email().toLowerCase())
            .orElseThrow(() -> new ForbiddenException("Invalid credentials"));

        if (!account.getPasswordHash().equals(PasswordHashUtil.hash(request.password()))) {
            throw new ForbiddenException("Invalid credentials");
        }

        return createSessionResponse(account);
    }

    public Account requireAccount(String token) {
        if (token == null || token.isBlank()) {
            throw new ForbiddenException("Missing auth token");
        }
        return accountSessionRepository.findByToken(token)
            .map(AccountSession::getAccount)
            .orElseThrow(() -> new ForbiddenException("Invalid auth token"));
    }

    public Account requireRole(String token, AccountRole... roles) {
        Account account = requireAccount(token);
        List<AccountRole> allowed = List.of(roles);
        if (!allowed.contains(account.getRole())) {
            throw new ForbiddenException("Insufficient permissions");
        }
        return account;
    }

    public Account getAdminAccount() {
        return accountRepository.findByEmail("admin@smartbuy.test")
            .orElseThrow(() -> new NotFoundException("Seed admin account missing"));
    }

    public Account getWarehouseAccount() {
        return accountRepository.findByEmail("warehouse@smartbuy.test")
            .orElseThrow(() -> new NotFoundException("Seed warehouse account missing"));
    }

    private AuthResponse createSessionResponse(Account account) {
        AccountSession session = new AccountSession();
        session.setAccount(account);
        session.setToken(UUID.randomUUID().toString());
        session.setCreatedAt(Instant.now());
        accountSessionRepository.save(session);
        return new AuthResponse(account.getId(), account.getName(), account.getEmail(), account.getRole().name(), session.getToken());
    }
}

