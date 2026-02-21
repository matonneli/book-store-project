package com.example.bookstore.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class UpdateBookDto {
    private String title;
    private String description;
    private Double purchasePrice;
    private Double rentalPrice;
    private Integer stockQuantity;
    private String status;
    private Integer authorId;
    private BigDecimal discountPercent;
    private LocalDateTime publicationDate;
    private List<Integer> categoryIds;
    private List<Integer> genreIds;
    private List<String> imageUrls;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(Double purchasePrice) { this.purchasePrice = purchasePrice; }

    public Double getRentalPrice() { return rentalPrice; }
    public void setRentalPrice(Double rentalPrice) { this.rentalPrice = rentalPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAuthorId() { return authorId; }
    public void setAuthorId(Integer authorId) { this.authorId = authorId; }

    public BigDecimal getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }

    public LocalDateTime getPublicationDate() { return publicationDate; }
    public void setPublicationDate(LocalDateTime publicationDate) { this.publicationDate = publicationDate; }

    public List<Integer> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Integer> categoryIds) { this.categoryIds = categoryIds; }

    public List<Integer> getGenreIds() { return genreIds; }
    public void setGenreIds(List<Integer> genreIds) { this.genreIds = genreIds; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}