package com.example.bookstore.dto;

import java.util.List;


public class CategoryWithGenresDto {
    private Integer categoryId;
    private String categoryName;
    private List<GenreDto> genres;

    public CategoryWithGenresDto(Integer categoryId, String categoryName, List<GenreDto> genres) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.genres = genres;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<GenreDto> getGenres() {
        return genres;
    }

    public void setGenres(List<GenreDto> genres) {
        this.genres = genres;
    }
}


