package com.example.bookstore.model;

import jakarta.persistence.*;

@Entity
public class CategoryGenre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryGenreId;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;

    public Integer getCategoryGenreId() {
        return categoryGenreId;
    }

    public void setCategoryGenreId(Integer categoryGenreId) {
        this.categoryGenreId = categoryGenreId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Genre getGenre() {
        return genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }
}