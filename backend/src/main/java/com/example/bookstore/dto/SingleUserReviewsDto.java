package com.example.bookstore.dto;

import java.sql.Timestamp;

public class SingleUserReviewsDto {
    private Integer reviewId;
    private String bookTitle;
    private String authorName;
    private Integer rating;
    private String comment;
    private Timestamp createdAt;

    public SingleUserReviewsDto(Integer reviewId, String bookTitle, String authorName,
                         Integer rating, String comment, Timestamp createdAt) {
        this.reviewId = reviewId;
        this.bookTitle = bookTitle;
        this.authorName = authorName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Integer getReviewId() {
        return reviewId;
    }

    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
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
}
