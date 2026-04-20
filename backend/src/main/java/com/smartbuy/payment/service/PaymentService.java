package com.smartbuy.payment.service;

import com.smartbuy.order.domain.OrderEntity;
import com.smartbuy.order.domain.OrderStatus;
import com.smartbuy.order.repository.OrderRepository;
import com.smartbuy.payment.domain.PaymentStatus;
import com.smartbuy.payment.domain.PaymentTransaction;
import com.smartbuy.payment.repository.PaymentTransactionRepository;
import com.smartbuy.payment.web.dto.InitiatePaymentResponse;
import com.smartbuy.payment.web.dto.PaymentCallbackRequest;
import com.smartbuy.payment.web.dto.PaymentCallbackResponse;
import com.smartbuy.shared.exception.BadRequestException;
import com.smartbuy.shared.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${smartbuy.payment.callback-secret}")
    private String callbackSecret;

    public PaymentService(OrderRepository orderRepository, PaymentTransactionRepository paymentTransactionRepository) {
        this.orderRepository = orderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    public InitiatePaymentResponse initiatePayment(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.WAITING_FOR_PAYMENT) {
            throw new BadRequestException("Order is not waiting for payment");
        }

        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrder(order);
        tx.setAmount(order.getTotalAmount());
        tx.setStatus(PaymentStatus.INITIATED);
        tx.setExternalReference("PAY-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase(Locale.ROOT));
        tx.setCreatedAt(Instant.now());

        PaymentTransaction saved = paymentTransactionRepository.save(tx);

        return new InitiatePaymentResponse(
            saved.getId(),
            saved.getExternalReference(),
            "https://example-gateway/pay/" + saved.getExternalReference(),
            saved.getStatus().name()
        );
    }

    public PaymentCallbackResponse processCallback(String providedSecret, PaymentCallbackRequest request) {
        if (!callbackSecret.equals(providedSecret)) {
            throw new BadRequestException("Invalid callback secret");
        }

        PaymentTransaction tx = paymentTransactionRepository.findByExternalReference(request.externalReference())
            .orElseThrow(() -> new NotFoundException("Payment transaction not found"));

        if (tx.isTerminal()) {
            return new PaymentCallbackResponse("IGNORED_DUPLICATE", "Terminal state already processed");
        }

        String normalizedResult = request.result().toUpperCase(Locale.ROOT);
        switch (normalizedResult) {
            case "SUCCESS" -> {
                tx.setStatus(PaymentStatus.SUCCESSFUL);
                tx.getOrder().setStatus(OrderStatus.PAID);
                orderRepository.save(tx.getOrder());
                paymentTransactionRepository.save(tx);
                return new PaymentCallbackResponse("OK", "Payment marked as successful");
            }
            case "FAILED" -> {
                tx.setStatus(PaymentStatus.FAILED);
                paymentTransactionRepository.save(tx);
                return new PaymentCallbackResponse("OK", "Payment marked as failed");
            }
            case "CANCELLED" -> {
                tx.setStatus(PaymentStatus.CANCELLED);
                paymentTransactionRepository.save(tx);
                return new PaymentCallbackResponse("OK", "Payment marked as cancelled");
            }
            default -> throw new BadRequestException("Unsupported callback result: " + request.result());
        }
    }
}

