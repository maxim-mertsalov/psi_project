package com.smartbuy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AcceptanceUc1Uc4Test {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void uc1_searchFilterDetailAndUnavailableAlternative() throws Exception {
        mockMvc.perform(get("/api/products")
                .param("q", "Phone")
                .param("available", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("Phone X1"))
            .andExpect(jsonPath("$[0].available").value(true))
            .andExpect(jsonPath("$[1].name").value("Phone X2 Pro"))
            .andExpect(jsonPath("$[1].available").value(true));

        mockMvc.perform(get("/api/products")
                .param("minPrice", "800")
                .param("maxPrice", "1000"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].name").value("Phone X2 Pro"))
            .andExpect(jsonPath("$[0].price").value(899.00));

        mockMvc.perform(get("/api/products").param("q", "NoSuchProduct"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/products").param("minPrice", "999").param("maxPrice", "100"))
            .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/products/{id}", 4L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(4L))
            .andExpect(jsonPath("$.name").value("Laptop Basic 15"))
            .andExpect(jsonPath("$.available").value(false))
            .andExpect(jsonPath("$.stockAvailable").value(0))
            .andExpect(jsonPath("$.similarProducts.length()").value(1));
    }

    @Test
    void uc2_cartAddUpdateRemoveAndStockAlternative() throws Exception {
        String session = "UC2-SESSION";

        MvcResult addResult = mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":1,"quantity":2}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andReturn();

        JsonNode addJson = objectMapper.readTree(addResult.getResponse().getContentAsString());
        long itemId = addJson.get("items").get(0).get("itemId").asLong();

        mockMvc.perform(patch("/api/cart/items/{itemId}", itemId)
                .header("X-Session-Id", session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"quantity":3}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].quantity").value(3));

        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":2,"quantity":999}
                    """))
            .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/cart/items/{itemId}", itemId)
                .header("X-Session-Id", session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void uc3_checkoutSuccessAndUnavailableDuringCheckout() throws Exception {
        String sessionSuccess = "UC3-SESSION-SUCCESS";

        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", sessionSuccess)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":1,"quantity":1}
                    """))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/checkout/orders")
                .header("X-Session-Id", sessionSuccess)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "guestEmail":"guest@example.com",
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
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("WAITING_FOR_PAYMENT"));

        String sessionUnavailable = "UC3-SESSION-UNAVAILABLE";
        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", sessionUnavailable)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":2,"quantity":1}
                    """))
            .andExpect(status().isOk());

        // Reserve all stock via another checkout to emulate product becoming unavailable.
        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", "UC3-SESSION-OTHER")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":2,"quantity":5}
                    """))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/checkout/orders")
                .header("X-Session-Id", "UC3-SESSION-OTHER")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "guestEmail":"bulk@example.com",
                      "shippingMethod":"COURIER",
                      "shippingPrice":10.00,
                      "paymentMethod":"ONLINE_CARD",
                      "address":{
                        "street":"Bulk 1",
                        "city":"Bratislava",
                        "zipCode":"81101",
                        "country":"SK"
                      }
                    }
                    """))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/checkout/orders")
                .header("X-Session-Id", sessionUnavailable)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "guestEmail":"guest2@example.com",
                      "shippingMethod":"COURIER",
                      "shippingPrice":10.00,
                      "paymentMethod":"ONLINE_CARD",
                      "address":{
                        "street":"Main 2",
                        "city":"Bratislava",
                        "zipCode":"81101",
                        "country":"SK"
                      }
                    }
                    """))
            .andExpect(status().isConflict());
    }

    @Test
    void uc4_paymentSuccessFailedAndDuplicateCallback() throws Exception {
        String session = "UC4-SESSION";

        mockMvc.perform(post("/api/cart/items")
                .header("X-Session-Id", session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"productId":1,"quantity":1}
                    """))
            .andExpect(status().isOk());

        MvcResult checkoutResult = mockMvc.perform(post("/api/checkout/orders")
                .header("X-Session-Id", session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "guestEmail":"pay@example.com",
                      "shippingMethod":"COURIER",
                      "shippingPrice":10.00,
                      "paymentMethod":"ONLINE_CARD",
                      "address":{
                        "street":"Pay 1",
                        "city":"Bratislava",
                        "zipCode":"81101",
                        "country":"SK"
                      }
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        long orderId = objectMapper.readTree(checkoutResult.getResponse().getContentAsString()).get("orderId").asLong();

        MvcResult initResult = mockMvc.perform(post("/api/payments/{orderId}/initiate", orderId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("INITIATED"))
            .andReturn();

        String externalReference = objectMapper.readTree(initResult.getResponse().getContentAsString()).get("externalReference").asText();

        mockMvc.perform(post("/api/payments/callback")
                .header("X-Payment-Secret", "smartbuy-dev-secret")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"externalReference":"%s","result":"SUCCESS"}
                    """.formatted(externalReference)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("OK"));

        mockMvc.perform(post("/api/payments/callback")
                .header("X-Payment-Secret", "smartbuy-dev-secret")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"externalReference":"%s","result":"SUCCESS"}
                    """.formatted(externalReference)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IGNORED_DUPLICATE"));
    }
}




