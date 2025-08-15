package com.example.bookstore.dto;

import java.sql.Timestamp;

public class SingleBookReviewsDto {
    private Integer reviewId;
    private Integer rating;
    private String comment;
    private Timestamp createdAt;
    private String reviewerName;

    public SingleBookReviewsDto(Integer reviewId, Integer rating, String comment, Timestamp createdAt, String reviewerName) {
        this.reviewId = reviewId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.reviewerName = reviewerName;
    }

    public Integer getReviewId() {
        return reviewId;
    }

    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }
}
