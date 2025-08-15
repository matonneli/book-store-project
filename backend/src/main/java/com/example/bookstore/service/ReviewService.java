package com.example.bookstore.service;

import com.example.bookstore.dto.SingleBookReviewsDto;
import com.example.bookstore.dto.SingleUserReviewsDto;
import com.example.bookstore.dto.UpdateReviewDto;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.model.Client;
import com.example.bookstore.model.Review;
import com.example.bookstore.repository.ClientRepository;
import com.example.bookstore.repository.ReviewRepository;
import com.example.bookstore.security.JwtUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AuthService authService;

    public ReviewService(ReviewRepository reviewRepository, AuthService authService) {
        this.reviewRepository = reviewRepository;
        this.authService = authService;
    }

    public List<SingleUserReviewsDto> getReviewsByUserId(String token) {
        Client client = authService.getClientFromToken(token);
        return reviewRepository.findAllReviewsByUserId(client.getUserId());
    }

    public Map<String, Object> getReviewsByBookIdPaginated(Integer bookId, int page, int size, String sortBy) {
        Sort sort = getSortByCriteria(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SingleBookReviewsDto> reviewPage = reviewRepository.findReviewsByBookIdPaginated(bookId, pageable);

        return Map.of(
                "reviews", reviewPage.getContent(),
                "totalElements", reviewPage.getTotalElements(),
                "totalPages", reviewPage.getTotalPages(),
                "currentPage", reviewPage.getNumber(),
                "hasNext", reviewPage.hasNext(),
                "hasPrevious", reviewPage.hasPrevious()
        );
    }

    private Sort getSortByCriteria(String sortBy) {
        return switch (sortBy.toLowerCase()) {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "rating_desc" -> Sort.by("rating").descending();
            case "rating_asc" -> Sort.by("rating").ascending();
            default -> Sort.by("createdAt").descending();
        };
    }

    public Map<String, Object> getReviewsByUserIdPaginated(String token, int page, int size) {
        Client client = authService.getClientFromToken(token);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SingleUserReviewsDto> reviewPage = reviewRepository.findAllReviewsByUserIdPaginated(client.getUserId(), pageable);
        return Map.of(
                "reviews", reviewPage.getContent(),
                "totalElements", reviewPage.getTotalElements(),
                "totalPages", reviewPage.getTotalPages(),
                "currentPage", reviewPage.getNumber(),
                "hasNext", reviewPage.hasNext(),
                "hasPrevious", reviewPage.hasPrevious()
        );
    }

    @Transactional
    public Review updateReview(Integer reviewId, UpdateReviewDto updateReviewDto, String token) {
        validateUpdateReviewDto(updateReviewDto);
        Client client = authService.getClientFromToken(token);
        Review review = reviewRepository.findByReviewIdAndUserId(reviewId, client.getUserId())
                .orElseThrow(() -> new NotFoundException("Review not found or you don't have permission to edit it"));
        review.setRating(updateReviewDto.getRating());
        review.setComment(updateReviewDto.getComment());
        review.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Integer reviewId, String token) {
        Client client = authService.getClientFromToken(token);
        if (!reviewRepository.findByReviewIdAndUserId(reviewId, client.getUserId()).isPresent()) {
            throw new NotFoundException("Review not found or you don't have permission to delete it");
        }
        int deletedCount = reviewRepository.deleteByReviewIdAndUserId(reviewId, client.getUserId());
        if (deletedCount == 0) {
            throw new NotFoundException("Review not found or could not be deleted");
        }
    }

    private void validateUpdateReviewDto(UpdateReviewDto dto) {
        if (dto == null) {
            throw new ValidationException("Review data cannot be null");
        }

        if (dto.getRating() == null) {
            throw new ValidationException("Rating is required");
        }

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }

        if (dto.getComment() != null && dto.getComment().trim().length() > 1000) {
            throw new ValidationException("Comment cannot exceed 1000 characters");
        }

        if (dto.getComment() != null) {
            dto.setComment(dto.getComment().trim());
        }
    }

}
