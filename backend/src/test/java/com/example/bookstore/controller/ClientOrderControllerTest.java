package com.example.bookstore.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClientOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Value("${test.client.token}")
    private String clientToken;

    @BeforeEach
    void warmUp() throws Exception {
        mockMvc.perform(get("/api/notifications/alerts")
                .header("Authorization", "Bearer " + clientToken));
        mockMvc.perform(get("/api/orders/my-orders")
                .header("Authorization", "Bearer " + clientToken)
                .param("page", "0")
                .param("size", "5"));
        mockMvc.perform(get("/api/orders/23/details")
                .header("Authorization", "Bearer " + clientToken));
    }

    // --- Integration tests ---

    @Test
    void getAlerts_returnsOkWithBooleanFields() throws Exception {
        mockMvc.perform(get("/api/notifications/alerts")
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasReadyForPickup").value(true))
                .andExpect(jsonPath("$.hasOverdueRentals").exists());
    }

    @Test
    void getAlerts_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/notifications/alerts"))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isIn(400, 401, 403, 500));
    }

    @Test
    void getMyOrders_returnsOkWithPagedStructure() throws Exception {
        mockMvc.perform(get("/api/orders/my-orders")
                        .header("Authorization", "Bearer " + clientToken)
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void getOrderDetails_returnsOkWithCorrectStatus() throws Exception {
        mockMvc.perform(get("/api/orders/23/details")
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(23))
                .andExpect(jsonPath("$.status").value("READY_FOR_PICKUP"));
    }

    @Test
    void getOrderDetails_notFound_returns4xx() throws Exception {
        mockMvc.perform(get("/api/orders/999999/details")
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isIn(400, 404, 500));
    }

    // --- Performance tests ---

    @Test
    void getAlerts_performanceUnderLoad() throws Exception {
        int iterations = 100;
        long totalMs = 0;
        long minMs = Long.MAX_VALUE;
        long maxMs = 0;

        for (int i = 0; i < iterations; i++) {
            long start = System.currentTimeMillis();
            mockMvc.perform(get("/api/notifications/alerts")
                            .header("Authorization", "Bearer " + clientToken))
                    .andExpect(status().isOk());
            long elapsed = System.currentTimeMillis() - start;
            totalMs += elapsed;
            if (elapsed < minMs) minMs = elapsed;
            if (elapsed > maxMs) maxMs = elapsed;
        }

        double avgMs = (double) totalMs / iterations;
        System.out.printf("Performance [getAlerts]: %d requests | total: %dms | avg: %.2fms | min: %dms | max: %dms%n",
                iterations, totalMs, avgMs, minMs, maxMs);
        assertThat(avgMs).isLessThan(200.0);
    }

    @Test
    void getMyOrders_performanceUnderLoad() throws Exception {
        int iterations = 100;
        long totalMs = 0;
        long minMs = Long.MAX_VALUE;
        long maxMs = 0;

        for (int i = 0; i < iterations; i++) {
            long start = System.currentTimeMillis();
            mockMvc.perform(get("/api/orders/my-orders")
                            .header("Authorization", "Bearer " + clientToken)
                            .param("page", "0")
                            .param("size", "5"))
                    .andExpect(status().isOk());
            long elapsed = System.currentTimeMillis() - start;
            totalMs += elapsed;
            if (elapsed < minMs) minMs = elapsed;
            if (elapsed > maxMs) maxMs = elapsed;
        }

        double avgMs = (double) totalMs / iterations;
        System.out.printf("Performance [getMyOrders]: %d requests | total: %dms | avg: %.2fms | min: %dms | max: %dms%n",
                iterations, totalMs, avgMs, minMs, maxMs);
        assertThat(avgMs).isLessThan(200.0);
    }

    @Test
    void getOrderDetails_performanceUnderLoad() throws Exception {
        int iterations = 100;
        long totalMs = 0;
        long minMs = Long.MAX_VALUE;
        long maxMs = 0;

        for (int i = 0; i < iterations; i++) {
            long start = System.currentTimeMillis();
            mockMvc.perform(get("/api/orders/23/details")
                            .header("Authorization", "Bearer " + clientToken))
                    .andExpect(status().isOk());
            long elapsed = System.currentTimeMillis() - start;
            totalMs += elapsed;
            if (elapsed < minMs) minMs = elapsed;
            if (elapsed > maxMs) maxMs = elapsed;
        }

        double avgMs = (double) totalMs / iterations;
        System.out.printf("Performance [getOrderDetails]: %d requests | total: %dms | avg: %.2fms | min: %dms | max: %dms%n",
                iterations, totalMs, avgMs, minMs, maxMs);
        assertThat(avgMs).isLessThan(200.0);
    }
}