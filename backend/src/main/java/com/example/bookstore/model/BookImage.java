package com.example.bookstore.model;

import jakarta.persistence.*;

@Entity
public class BookImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer imageId;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private String imageUrl;

    public BookImage() {
    }

    public Integer getImageId() {
        return imageId;
    }

    public void setImageId(Integer imageId) {
        this.imageId = imageId;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book bookId) {
        this.book= book;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
