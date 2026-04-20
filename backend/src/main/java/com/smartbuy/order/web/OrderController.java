package com.smartbuy.order.web;

import com.smartbuy.order.service.OrderService;
import com.smartbuy.order.web.dto.OrderProcessResponse;
import com.smartbuy.order.web.dto.OrderSummaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderSummaryResponse> myOrders(@RequestHeader("X-Auth-Token") String authToken) {
        return orderService.listMyOrders(authToken);
    }

    @PostMapping("/{orderId}/cancel")
    public OrderProcessResponse cancel(@RequestHeader("X-Auth-Token") String authToken, @PathVariable Long orderId) {
        return orderService.cancelMyOrder(authToken, orderId);
    }
}

