package com.example.bookstore.controller;

import com.example.bookstore.dto.CategoryDto;
import com.example.bookstore.dto.CategoryWithGenresDto;
import com.example.bookstore.service.CategoryGenreService;
import com.example.bookstore.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryGenreService categoryGenreService;

    @Autowired
    public CategoryController(CategoryService categoryService, CategoryGenreService categoryGenreService) {
        this.categoryService = categoryService;
        this.categoryGenreService = categoryGenreService;
    }


    @GetMapping("/top")
    public List<CategoryDto> getTopCategories(@RequestParam(defaultValue = "10") int limit) {
        return categoryService.getTopCategories(limit);
    }

    @GetMapping("/")
    public List<CategoryDto> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/with-genres")
    public List<CategoryWithGenresDto> getCategoriesWithGenres() {
        return categoryGenreService.getCategoriesWithGenres();
    }

}
