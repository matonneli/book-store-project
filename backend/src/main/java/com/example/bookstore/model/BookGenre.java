package com.example.bookstore.model;

import jakarta.persistence.*;
@Entity
public class BookGenre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookGenreId;
    private Integer bookId;
    private Integer genreId;


    public BookGenre() {

    }

    public Integer getBookGenreId() {
        return bookGenreId;
    }

    public void setBookGenreId(Integer bookGenreId) {
        this.bookGenreId = bookGenreId;
    }

    public Integer getBookId() {
        return bookId;
    }

    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }

    public Integer getGenreId() {
        return genreId;
    }

    public void setGenreId(Integer genreId) {
        this.genreId = genreId;
    }
}
