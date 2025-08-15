package com.example.bookstore.controller;

import com.example.bookstore.dto.SingleUserReviewsDto;
import com.example.bookstore.dto.UpdateReviewDto;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.model.Review;
import com.example.bookstore.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }


    @GetMapping("/api/user/reviews")
    public ResponseEntity<?> getMyReviews(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size > 50) {
                size = 50;
            }

            Map<String, Object> result = reviewService.getReviewsByUserIdPaginated(token, page, size);
            return ResponseEntity.ok(result);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Unexpected error"));
        }
    }

    @PutMapping("/api/user/reviews/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Integer reviewId,
            @RequestBody UpdateReviewDto updateReviewDto,
            @RequestHeader("Authorization") String token) {
        try {
            Review updatedReview = reviewService.updateReview(reviewId, updateReviewDto, token);
            return ResponseEntity.ok(Map.of(
                    "message", "Review updated successfully",
                    "reviewId", updatedReview.getReviewId(),
                    "rating", updatedReview.getRating(),
                    "comment", updatedReview.getComment(),
                    "createdAt", updatedReview.getCreatedAt()
            ));
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error"));
        }
    }

    @DeleteMapping("/api/user/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer reviewId,
            @RequestHeader("Authorization") String token) {
        try {
            reviewService.deleteReview(reviewId, token);
            return ResponseEntity.ok(Map.of(
                    "message", "Review deleted successfully",
                    "reviewId", reviewId
            ));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error"));
        }
    }

    @GetMapping("/api/catalog/books/{id}/reviews")
    public ResponseEntity<Map<String, Object>> getBookReviews(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        Map<String, Object> reviews = reviewService.getReviewsByBookIdPaginated(id, page, size, sort);
        return ResponseEntity.ok(reviews);
    }

}
