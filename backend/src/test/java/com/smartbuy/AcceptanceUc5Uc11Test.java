package com.smartbuy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AcceptanceUc5Uc11Test {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void uc5_registerLoginAndDuplicateEmail() throws Exception {
        String email = uniqueEmail("user");
        String password = "secret123";

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name":"Test User","email":"%s","password":"%s"}
                    """.formatted(email, password)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.token").exists());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"%s","password":"%s"}
                    """.formatted(email, password)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.token").exists());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name":"Test User","email":"%s","password":"%s"}
                    """.formatted(email, password)))
            .andExpect(status().isConflict());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"%s","password":"badpass"}
                    """.formatted(email)))
            .andExpect(status().isForbidden());
    }

    @Test
    void uc8_and_uc9_listOwnOrdersAndCancelOwnOrder() throws Exception {
        String email = uniqueEmail("customer");
        String token = registerAndLogin(email, "secret123");

        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", "UC8-SESSION")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":1,"quantity":1}
                    """))
            .andExpect(status().isOk());

        MvcResult checkoutResult = mockMvc.perform(post("/api/checkout/orders")
                .header("X-Session-Id", "UC8-SESSION")
                .header("X-Auth-Token", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "guestEmail":"%s",
                      "shippingMethod":"COURIER",
                      "shippingPrice":10.00,
                      "paymentMethod":"ONLINE_CARD",
                      "address":{
                        "street":"Main 1",
                        "city":"Bratislava",
                        "zipCode":"81101",
                        "country":"SK"
                      }
                    }
                    """.formatted(email)))
            .andExpect(status().isOk())
            .andReturn();

        long orderId = objectMapper.readTree(checkoutResult.getResponse().getContentAsString()).get("orderId").asLong();

        mockMvc.perform(get("/api/me/orders")
                .header("X-Auth-Token", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].ownerEmail").value(email))
            .andExpect(jsonPath("$[0].status").value("WAITING_FOR_PAYMENT"));

        mockMvc.perform(post("/api/me/orders/{orderId}/cancel", orderId)
                .header("X-Auth-Token", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));

        mockMvc.perform(get("/api/me/orders")
                .header("X-Auth-Token", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].status").value("CANCELLED"));

        mockMvc.perform(get("/api/products/{id}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.stockAvailable").value(20));
    }

    @Test
    void uc10_adminCrudAndCustomerForbidden() throws Exception {
        String customerToken = registerAndLogin(uniqueEmail("customer2"), "secret123");
        String adminToken = login("admin@smartbuy.test", "admin123");

        mockMvc.perform(get("/api/admin/products")
                .header("X-Auth-Token", customerToken))
            .andExpect(status().isForbidden());

        MvcResult createResult = mockMvc.perform(post("/api/admin/products")
                .header("X-Auth-Token", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name":"Tablet Pro",
                      "description":"10 inch tablet",
                      "price":499.00,
                      "available":true,
                      "categoryId":1,
                      "stockQuantity":12
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Tablet Pro"))
            .andExpect(jsonPath("$.stockQuantity").value(12))
            .andReturn();

        long productId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/admin/products/{productId}", productId)
                .header("X-Auth-Token", adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name":"Tablet Pro Max",
                      "description":"11 inch tablet",
                      "price":599.00,
                      "available":true,
                      "categoryId":1,
                      "stockQuantity":8
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Tablet Pro Max"))
            .andExpect(jsonPath("$.stockQuantity").value(8));

        mockMvc.perform(delete("/api/admin/products/{productId}", productId)
                .header("X-Auth-Token", adminToken))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/products")
                .header("X-Auth-Token", adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.name == 'Tablet Pro Max')]").isEmpty());
    }

    @Test
    void uc11_warehouseProcessesPaidOrder() throws Exception {
        String email = uniqueEmail("buyer");
        String customerToken = registerAndLogin(email, "secret123");
        String warehouseToken = login("warehouse@smartbuy.test", "warehouse123");
        String adminToken = login("admin@smartbuy.test", "admin123");

        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", "UC11-SESSION")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":2,"quantity":1}
                    """))
            .andExpect(status().isOk());

        MvcResult checkoutResult = mockMvc.perform(post("/api/checkout/orders")
                .header("X-Session-Id", "UC11-SESSION")
                .header("X-Auth-Token", customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "guestEmail":"%s",
                      "shippingMethod":"COURIER",
                      "shippingPrice":10.00,
                      "paymentMethod":"ONLINE_CARD",
                      "address":{
                        "street":"Warehouse 1",
                        "city":"Bratislava",
                        "zipCode":"81101",
                        "country":"SK"
                      }
                    }
                    """.formatted(email)))
            .andExpect(status().isOk())
            .andReturn();

        long orderId = objectMapper.readTree(checkoutResult.getResponse().getContentAsString()).get("orderId").asLong();

        MvcResult initResult = mockMvc.perform(post("/api/payments/{orderId}/initiate", orderId))
            .andExpect(status().isOk())
            .andReturn();

        String externalReference = objectMapper.readTree(initResult.getResponse().getContentAsString()).get("externalReference").asText();

        mockMvc.perform(post("/api/payments/callback")
                .header("X-Payment-Secret", "smartbuy-dev-secret")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"externalReference":"%s","result":"SUCCESS"}
                    """.formatted(externalReference)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/orders/{orderId}/process", orderId)
                .header("X-Auth-Token", warehouseToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PROCESSING"));

        mockMvc.perform(post("/api/admin/orders/{orderId}/ship", orderId)
                .header("X-Auth-Token", adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("SHIPPED"));

        mockMvc.perform(get("/api/me/orders")
                .header("X-Auth-Token", customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status").value("SHIPPED"));
    }

    private String uniqueEmail(String prefix) {
        return prefix + "+" + UUID.randomUUID().toString().substring(0, 8) + "@smartbuy.test";
    }

    private String registerAndLogin(String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name":"%s","email":"%s","password":"%s"}
                    """.formatted(email.split("@")[0], email, password)))
            .andExpect(status().isOk());

        return login(email, password);
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"%s","password":"%s"}
                    """.formatted(email, password)))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }
}

