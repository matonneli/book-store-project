package com.example.bookstore.service;

import com.example.bookstore.dto.CategoryDto;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDto> getTopCategories(int limit) {
        Page<Category> categoryPage = categoryRepository.findAll(PageRequest.of(0, limit));
        List<Category> categories = categoryPage.getContent();

        return categories.stream()
                .map(category -> {
                    CategoryDto categoryDto = new CategoryDto();
                    categoryDto.setCategoryId(category.getCategoryId());
                    categoryDto.setName(category.getName());
                    return categoryDto;
                })
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getAllCategories() {

        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> {
                    CategoryDto categoryDto = new CategoryDto();
                    categoryDto.setCategoryId(category.getCategoryId());
                    categoryDto.setName(category.getName());
                    return categoryDto;
                })
                .collect(Collectors.toList());
    }
}
