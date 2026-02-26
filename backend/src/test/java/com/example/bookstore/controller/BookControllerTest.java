package com.example.bookstore.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void warmUp() throws Exception {
        mockMvc.perform(get("/api/catalog/books").param("page", "0").param("size", "9"));
        mockMvc.perform(get("/api/catalog/books/discounts").param("page", "0").param("size", "9"));
        mockMvc.perform(get("/api/catalog/books")
                .param("page", "0").param("size", "9")
                .param("genres", "1").param("title", "a"));
    }

    // --- Integration tests ---

    @Test
    void getBooks_returnsOkWithPagedStructure() throws Exception {
        mockMvc.perform(get("/api/catalog/books")
                        .param("page", "0")
                        .param("size", "9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray())
                .andExpect(jsonPath("$.currentPage").value(0))
                .andExpect(jsonPath("$.totalPages").exists())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void getBooks_withInvalidParams_fallsBackToDefaults() throws Exception {
        mockMvc.perform(get("/api/catalog/books")
                        .param("page", "-5")
                        .param("size", "999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray());
    }

    @Test
    void getBooks_withTitleFilter_returnsFilteredResults() throws Exception {
        mockMvc.perform(get("/api/catalog/books")
                        .param("title", "a"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray());
    }

    @Test
    void getBookById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/catalog/books/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getBookDetails_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/catalog/books/999999/details"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getDiscountedBooks_returnsOk() throws Exception {
        mockMvc.perform(get("/api/catalog/books/discounts")
                        .param("page", "0")
                        .param("size", "9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray());
    }

    @Test
    void getNewBooks_returnsOk() throws Exception {
        mockMvc.perform(get("/api/catalog/books/new")
                        .param("page", "0")
                        .param("size", "9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray());
    }

    @Test
    void getBestsellers_returnsOk() throws Exception {
        mockMvc.perform(get("/api/catalog/books/bestsellers")
                        .param("page", "0")
                        .param("size", "9"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books").isArray());
    }

    // --- Performance tests ---

    @Test
    void getBooks_performanceUnderLoad() throws Exception {
        int iterations = 100;
        long totalMs = 0;
        long minMs = Long.MAX_VALUE;
        long maxMs = 0;

        for (int i = 0; i < iterations; i++) {
            long start = System.currentTimeMillis();
            mockMvc.perform(get("/api/catalog/books")
                            .param("page", "0")
                            .param("size", "9"))
                    .andExpect(status().isOk());
            long elapsed = System.currentTimeMillis() - start;
            totalMs += elapsed;
            if (elapsed < minMs) minMs = elapsed;
            if (elapsed > maxMs) maxMs = elapsed;
        }

        double avgMs = (double) totalMs / iterations;
        System.out.printf("Performance [getBooks]: %d requests | total: %dms | avg: %.2fms | min: %dms | max: %dms%n",
                iterations, totalMs, avgMs, minMs, maxMs);
        assertThat(avgMs).isLessThan(200.0);
    }

    @Test
    void getDiscountedBooks_performanceUnderLoad() throws Exception {
        int iterations = 100;
        long totalMs = 0;
        long minMs = Long.MAX_VALUE;
        long maxMs = 0;

        for (int i = 0; i < iterations; i++) {
            long start = System.currentTimeMillis();
            mockMvc.perform(get("/api/catalog/books/discounts")
                            .param("page", "0")
                            .param("size", "9"))
                    .andExpect(status().isOk());
            long elapsed = System.currentTimeMillis() - start;
            totalMs += elapsed;
            if (elapsed < minMs) minMs = elapsed;
            if (elapsed > maxMs) maxMs = elapsed;
        }

        double avgMs = (double) totalMs / iterations;
        System.out.printf("Performance [getDiscountedBooks]: %d requests | total: %dms | avg: %.2fms | min: %dms | max: %dms%n",
                iterations, totalMs, avgMs, minMs, maxMs);
        assertThat(avgMs).isLessThan(200.0);
    }

    @Test
    void getBooks_withFilters_performanceUnderLoad() throws Exception {
        int iterations = 100;
        long totalMs = 0;
        long minMs = Long.MAX_VALUE;
        long maxMs = 0;

        for (int i = 0; i < iterations; i++) {
            long start = System.currentTimeMillis();
            mockMvc.perform(get("/api/catalog/books")
                            .param("page", "0")
                            .param("size", "9")
                            .param("genres", "1")
                            .param("title", "a"))
                    .andExpect(status().isOk());
            long elapsed = System.currentTimeMillis() - start;
            totalMs += elapsed;
            if (elapsed < minMs) minMs = elapsed;
            if (elapsed > maxMs) maxMs = elapsed;
        }

        double avgMs = (double) totalMs / iterations;
        System.out.printf("Performance [getBooks+filters]: %d requests | total: %dms | avg: %.2fms | min: %dms | max: %dms%n",
                iterations, totalMs, avgMs, minMs, maxMs);
        assertThat(avgMs).isLessThan(200.0);
    }
}