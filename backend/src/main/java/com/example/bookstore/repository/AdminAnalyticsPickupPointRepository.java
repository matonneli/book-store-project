package com.example.bookstore.repository;

import com.example.bookstore.dto.AnalyticsPickupPointDto;
import com.example.bookstore.record.BookStatDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AdminAnalyticsPickupPointRepository {

    private static final String PAID_STATUSES =
            "'PAID','DELIVERED_AND_PAID','DELIVERED','READY_FOR_PICKUP','READY_FOR_PICKUP_UNPAID'";

    private static final int TOP_BOOKS_LIMIT = 5;

    private final JdbcTemplate jdbc;

    public AdminAnalyticsPickupPointRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String getPickupPointName(int pickupPointId) {
        String sql = """
            SELECT name FROM pickup_point WHERE pickup_point_id = ?
            """;
        return jdbc.queryForObject(sql, String.class, pickupPointId);
    }

    public long getTotalOrders(int pickupPointId) {
        String sql = """
            SELECT COUNT(*)
            FROM orders
            WHERE pickup_point_id = ?
            """;
        return jdbc.queryForObject(sql, Long.class, pickupPointId);
    }

    public Map<String, Long> getOrdersByStatus(int pickupPointId) {
        String sql = """
            SELECT status, COUNT(*) AS cnt
            FROM orders
            WHERE pickup_point_id = ?
            GROUP BY status
            ORDER BY cnt DESC
            """;
        return jdbc.query(sql, rs -> {
            Map<String, Long> map = new LinkedHashMap<>();
            while (rs.next()) {
                map.put(rs.getString("status"), rs.getLong("cnt"));
            }
            return map;
        }, pickupPointId);
    }

    public BigDecimal getTotalRevenue(int pickupPointId) {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0)
            FROM orders
            WHERE pickup_point_id = ?
              AND status IN (%s)
            """.formatted(PAID_STATUSES);
        return jdbc.queryForObject(sql, BigDecimal.class, pickupPointId);
    }

    public BigDecimal getTotalRefunds(int pickupPointId) {
        String sql = """
            SELECT COALESCE(SUM(total_price), 0)
            FROM orders
            WHERE pickup_point_id = ?
              AND refunded_at IS NOT NULL
            """;
        return jdbc.queryForObject(sql, BigDecimal.class, pickupPointId);
    }

    public BigDecimal getAvgOrderValue(int pickupPointId) {
        String sql = """
            SELECT COALESCE(AVG(total_price), 0)
            FROM orders
            WHERE pickup_point_id = ?
              AND status IN (%s)
            """.formatted(PAID_STATUSES);
        return jdbc.queryForObject(sql, BigDecimal.class, pickupPointId);
    }

    public List<BookStatDto> getTopBooks(int pickupPointId) {
        String sql = """
            SELECT b.title, COUNT(oi.order_item_id) AS cnt
            FROM order_item oi
            JOIN book b ON b.book_id = oi.book_id
            JOIN orders o ON o.order_id = oi.order_id
            WHERE o.pickup_point_id = ?
            GROUP BY b.book_id, b.title
            ORDER BY cnt DESC
            LIMIT ?
            """;
        return jdbc.query(sql,
                (rs, i) -> new BookStatDto(rs.getString("title"), rs.getLong("cnt")),
                pickupPointId, TOP_BOOKS_LIMIT);
    }

    /**
     * Average time in hours between paid_at and delivered_at.
     * Only for orders that are DELIVERED or DELIVERED_AND_PAID
     * and have both timestamps filled.
     */
    public Double getAvgDeliveryHours(int pickupPointId) {
        String sql = """
            SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - paid_at)) / 3600)
            FROM orders
            WHERE pickup_point_id = ?
              AND status IN ('DELIVERED', 'DELIVERED_AND_PAID')
              AND paid_at IS NOT NULL
              AND delivered_at IS NOT NULL
            """;
        return jdbc.queryForObject(sql, Double.class, pickupPointId);
    }
}