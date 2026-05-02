package com.smartbuy.order.web;

import com.smartbuy.order.service.OrderService;
import com.smartbuy.order.web.dto.OrderProcessResponse;
import com.smartbuy.order.web.dto.OrderSummaryResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{orderId}/process")
    public OrderProcessResponse process(@RequestHeader("X-Auth-Token") String authToken, @PathVariable Long orderId) {
        return orderService.processOrder(authToken, orderId);
    }

    @PostMapping("/{orderId}/ship")
    public OrderProcessResponse ship(@RequestHeader("X-Auth-Token") String authToken, @PathVariable Long orderId) {
        return orderService.shipOrder(authToken, orderId);
    }

    @GetMapping("/")
    public List<OrderSummaryResponse> listAllOrders(@RequestHeader("X-Auth-Token") String authToken) {
        return orderService.listAllOrders(authToken);
    }
}

