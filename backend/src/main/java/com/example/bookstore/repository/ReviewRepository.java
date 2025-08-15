package com.example.bookstore.repository;

import com.example.bookstore.dto.SingleBookReviewsDto;
import com.example.bookstore.dto.SingleUserReviewsDto;
import com.example.bookstore.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("SELECT new com.example.bookstore.dto.SingleUserReviewsDto(r.reviewId, b.title, a.fullName, r.rating, r.comment, r.createdAt) " +
            "FROM Review r " +
            "JOIN Book b ON r.bookId = b.bookId " +
            "JOIN Author a ON b.authorId = a.authorId " +
            "WHERE r.userId = :userId " +
            "ORDER BY r.createdAt DESC")
    List<SingleUserReviewsDto> findAllReviewsByUserId(@Param("userId") Integer userId);

    @Query("SELECT new com.example.bookstore.dto.SingleUserReviewsDto(" +
            "r.reviewId, b.title, a.fullName, r.rating, r.comment, r.createdAt) " +
            "FROM Review r " +
            "JOIN Book b ON r.bookId = b.bookId " +
            "JOIN Author a ON b.authorId = a.authorId " +
            "WHERE r.userId = :userId " +
            "ORDER BY r.createdAt DESC")
    Page<SingleUserReviewsDto> findAllReviewsByUserIdPaginated(@Param("userId") Integer userId, Pageable pageable);

    @Query("""
    SELECT new com.example.bookstore.dto.SingleBookReviewsDto(
        r.reviewId, r.rating, r.comment, r.createdAt, 
        CONCAT(c.firstName, ' ', COALESCE(c.lastName, ''))
    )
    FROM Review r 
    JOIN Client c ON r.userId = c.clientId 
    WHERE r.bookId = :bookId 
    ORDER BY r.createdAt DESC
""")
    Page<SingleBookReviewsDto> findReviewsByBookIdPaginated(@Param("bookId") Integer bookId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.reviewId = :reviewId AND r.userId = :userId")
    Optional<Review> findByReviewIdAndUserId(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId);

    @Modifying
    @Query("DELETE FROM Review r WHERE r.reviewId = :reviewId AND r.userId = :userId")
    int deleteByReviewIdAndUserId(@Param("reviewId") Integer reviewId, @Param("userId") Integer userId);
}
