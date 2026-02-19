package com.example.bookstore.repository;

import com.example.bookstore.record.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public class AdminAnalyticsRepository {

    private final JdbcTemplate jdbc;

    // Statuses considered as successfully paid/completed
    private static final String PAID_STATUSES =
            "'PAID','DELIVERED_AND_PAID','DELIVERED','READY_FOR_PICKUP','READY_FOR_PICKUP_UNPAID'";

    public AdminAnalyticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ─── OVERALL ───────────────────────────────────────────────────────────────

    public BigDecimal getTotalRevenue() {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0)
            FROM orders
            WHERE status IN (%s)
            """.formatted(PAID_STATUSES);
        return jdbc.queryForObject(sql, BigDecimal.class);
    }

    public BigDecimal getTotalRefunds() {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0)
            FROM orders
            WHERE refunded_at IS NOT NULL
            """;
        return jdbc.queryForObject(sql, BigDecimal.class);
    }

    public BigDecimal getAvgOrderValue() {
        String sql = """
            SELECT COALESCE(AVG(total_price), 0)
            FROM orders
            WHERE status IN (%s)
            """.formatted(PAID_STATUSES);
        return jdbc.queryForObject(sql, BigDecimal.class);
    }

    public Map<String, Long> getOrdersByStatus() {
        String sql = """
            SELECT status, COUNT(*) AS cnt
            FROM orders
            GROUP BY status
            ORDER BY cnt DESC
            """;
        return jdbc.query(sql, rs -> {
            Map<String, Long> map = new java.util.LinkedHashMap<>();
            while (rs.next()) {
                map.put(rs.getString("status"), rs.getLong("cnt"));
            }
            return map;
        });
    }

    public long getTotalBuyItems() {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM order_item WHERE type = 'BUY'", Long.class);
    }

    public long getTotalRentItems() {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM order_item WHERE type = 'RENT'", Long.class);
    }

    public List<BookStatDto> getTopBooksBySales(int limit) {
        String sql = """
            SELECT b.title, COUNT(oi.order_item_id) AS cnt
            FROM order_item oi
            JOIN book b ON b.book_id = oi.book_id
            WHERE oi.type = 'BUY'
            GROUP BY b.book_id, b.title
            ORDER BY cnt DESC
            LIMIT ?
            """;
        return jdbc.query(sql,
                (rs, i) -> new BookStatDto(rs.getString("title"), rs.getLong("cnt")),
                limit);
    }

    public List<BookStatDto> getTopBooksByRentals(int limit) {
        String sql = """
            SELECT b.title, COUNT(oi.order_item_id) AS cnt
            FROM order_item oi
            JOIN book b ON b.book_id = oi.book_id
            WHERE oi.type = 'RENT'
            GROUP BY b.book_id, b.title
            ORDER BY cnt DESC
            LIMIT ?
            """;
        return jdbc.query(sql,
                (rs, i) -> new BookStatDto(rs.getString("title"), rs.getLong("cnt")),
                limit);
    }

    public List<BookRatingDto> getTopRatedBooks(int limit) {
        String sql = """
            SELECT b.title,
                   ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
                   COUNT(r.review_id)               AS review_count
            FROM review r
            JOIN book b ON b.book_id = r.book_id
            GROUP BY b.book_id, b.title
            HAVING COUNT(r.review_id) > 0
            ORDER BY avg_rating DESC, review_count DESC
            LIMIT ?
            """;
        return jdbc.query(sql,
                (rs, i) -> new BookRatingDto(
                        rs.getString("title"),
                        rs.getDouble("avg_rating"),
                        rs.getLong("review_count")),
                limit);
    }

    public long getTotalClients() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM client", Long.class);
    }

    public List<ClientGrowthDto> getClientGrowthMonthly() {
        String sql = """
            SELECT TO_CHAR(month, 'Mon YYYY') AS month,
                   SUM(COUNT(*)) OVER (ORDER BY month) AS total
            FROM (
                SELECT DATE_TRUNC('month', created_at) AS month
                FROM client
                WHERE created_at >= NOW() - INTERVAL '12 months'
            ) sub
            GROUP BY month
            ORDER BY month
            """;
        return jdbc.query(sql,
                (rs, i) -> new ClientGrowthDto(
                        rs.getString("month"),
                        rs.getLong("total")));
    }

    public List<PickupPointStatDto> getOrdersByPickupPoint() {
        String sql = """
            SELECT pp.name, COUNT(o.order_id) AS orders
            FROM pickup_point pp
            LEFT JOIN orders o ON o.pickup_point_id = pp.pickup_point_id
            GROUP BY pp.pickup_point_id, pp.name
            ORDER BY orders DESC
            """;
        return jdbc.query(sql,
                (rs, i) -> new PickupPointStatDto(
                        rs.getString("name"),
                        rs.getLong("orders")));
    }

    // ─── PERIOD ────────────────────────────────────────────────────────────────

    public BigDecimal getRevenueForPeriod(int days) {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0)
            FROM orders
            WHERE status IN (%s)
              AND created_at >= NOW() - INTERVAL '1 day' * ?
            """.formatted(PAID_STATUSES);
        return jdbc.queryForObject(sql, BigDecimal.class, days);
    }

    public BigDecimal getRefundsForPeriod(int days) {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0)
            FROM orders
            WHERE refunded_at IS NOT NULL
              AND refunded_at >= NOW() - INTERVAL '1 day' * ?
            """;
        return jdbc.queryForObject(sql, BigDecimal.class, days);
    }

    public BigDecimal getAvgOrderValueForPeriod(int days) {
        String sql = """
            SELECT COALESCE(AVG(total_price), 0)
            FROM orders
            WHERE status IN (%s)
              AND created_at >= NOW() - INTERVAL '1 day' * ?
            """.formatted(PAID_STATUSES);
        return jdbc.queryForObject(sql, BigDecimal.class, days);
    }

    public long getTotalOrdersForPeriod(int days) {
        String sql = """
            SELECT COUNT(*)
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '1 day' * ?
            """;
        return jdbc.queryForObject(sql, Long.class, days);
    }

    public Map<String, Long> getOrdersByStatusForPeriod(int days) {
        String sql = """
            SELECT status, COUNT(*) AS cnt
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '1 day' * ?
            GROUP BY status
            ORDER BY cnt DESC
            """;
        return jdbc.query(sql, rs -> {
            Map<String, Long> map = new java.util.LinkedHashMap<>();
            while (rs.next()) {
                map.put(rs.getString("status"), rs.getLong("cnt"));
            }
            return map;
        }, days);
    }

    public long getNewClientsForPeriod(int days) {
        String sql = """
            SELECT COUNT(*)
            FROM client
            WHERE created_at >= NOW() - INTERVAL '1 day' * ?
            """;
        return jdbc.queryForObject(sql, Long.class, days);
    }

    public List<BookStatDto> getTopBooksForPeriod(int days, int limit) {
        String sql = """
            SELECT b.title, COUNT(oi.order_item_id) AS cnt
            FROM order_item oi
            JOIN book b ON b.book_id = oi.book_id
            JOIN orders o ON o.order_id = oi.order_id
            WHERE o.created_at >= NOW() - INTERVAL '1 day' * ?
            GROUP BY b.book_id, b.title
            ORDER BY cnt DESC
            LIMIT ?
            """;
        return jdbc.query(sql,
                (rs, i) -> new BookStatDto(rs.getString("title"), rs.getLong("cnt")),
                days, limit);
    }

    public long getBuyItemsForPeriod(int days) {
        String sql = """
            SELECT COUNT(*)
            FROM order_item oi
            JOIN orders o ON o.order_id = oi.order_id
            WHERE oi.type = 'BUY'
              AND o.created_at >= NOW() - INTERVAL '1 day' * ?
            """;
        return jdbc.queryForObject(sql, Long.class, days);
    }

    public long getRentItemsForPeriod(int days) {
        String sql = """
            SELECT COUNT(*)
            FROM order_item oi
            JOIN orders o ON o.order_id = oi.order_id
            WHERE oi.type = 'RENT'
              AND o.created_at >= NOW() - INTERVAL '1 day' * ?
            """;
        return jdbc.queryForObject(sql, Long.class, days);
    }

    public List<RevenuePointDto> getRevenueOverTime(int days) {
        String sql = """
            SELECT gs.day::date AS date,
                   COALESCE(SUM(CASE
                       WHEN o.status IN (%s) THEN o.total_price
                       ELSE 0 END), 0) AS revenue,
                   COALESCE(SUM(CASE
                       WHEN o.refunded_at IS NOT NULL THEN o.total_price
                       ELSE 0 END), 0) AS refunds
            FROM generate_series(
                (NOW() - INTERVAL '1 day' * ?)::date,
                NOW()::date,
                INTERVAL '1 day'
            ) AS gs(day)
            LEFT JOIN orders o
                ON DATE_TRUNC('day', o.created_at) = gs.day
            GROUP BY gs.day
            ORDER BY gs.day
            """.formatted(PAID_STATUSES);
        return jdbc.query(sql,
                (rs, i) -> new RevenuePointDto(
                        rs.getDate("date").toLocalDate(),
                        rs.getBigDecimal("revenue"),
                        rs.getBigDecimal("refunds")),
                days);
    }
}
