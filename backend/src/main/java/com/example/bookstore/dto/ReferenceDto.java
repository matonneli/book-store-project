package com.example.bookstore.dto;

import com.example.bookstore.enums.ItemStatus;
import com.example.bookstore.enums.OrderStatus;

import java.util.List;

public class ReferenceDto {
    private List<AuthorDto> authors;
    private List<CategoryDto> allCategories;
    private List<GenreDto> allGenres;
    private List<CategoryWithGenresDto> tree;
    private List<PickUpPointDto> pickUpPoints;
    private List<OrderStatus> orderStatuses;
    private List<ItemStatus> itemStatuses;
    public List<PickUpPointDto> getPickUpPoints() { return pickUpPoints; }
    public void setPickUpPoints(List<PickUpPointDto> pickUpPoints) { this.pickUpPoints = pickUpPoints; }

    public List<OrderStatus> getOrderStatuses() { return orderStatuses; }
    public void setOrderStatuses(List<OrderStatus> orderStatuses) { this.orderStatuses = orderStatuses; }

    public List<AuthorDto> getAuthors() {
        return authors;
    }

    public void setAuthors(List<AuthorDto> authors) {
        this.authors = authors;
    }

    public List<CategoryDto> getAllCategories() {
        return allCategories;
    }

    public void setAllCategories(List<CategoryDto> allCategories) {
        this.allCategories = allCategories;
    }

    public List<GenreDto> getAllGenres() {
        return allGenres;
    }

    public void setAllGenres(List<GenreDto> allGenres) {
        this.allGenres = allGenres;
    }

    public List<CategoryWithGenresDto> getTree() {
        return tree;
    }

    public void setTree(List<CategoryWithGenresDto> tree) {
        this.tree = tree;
    }

    public List<ItemStatus> getItemStatuses() {
        return itemStatuses;
    }

    public void setItemStatuses(List<ItemStatus> itemStatuses) {
        this.itemStatuses = itemStatuses;
    }

}