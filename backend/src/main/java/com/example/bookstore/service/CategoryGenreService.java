package com.example.bookstore.service;

import com.example.bookstore.dto.CategoryWithGenresDto;
import com.example.bookstore.dto.GenreDto;
import com.example.bookstore.model.CategoryGenre;
import com.example.bookstore.repository.CategoryGenreRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategoryGenreService {

    private final CategoryGenreRepository categoryGenreRepository;

    public CategoryGenreService(CategoryGenreRepository categoryGenreRepository) {
        this.categoryGenreRepository = categoryGenreRepository;
    }

    public List<CategoryWithGenresDto> getCategoriesWithGenres() {
        List<CategoryGenre> categoryGenres = categoryGenreRepository.findAll();

        Map<Integer, CategoryWithGenresDto> categoryMap = new LinkedHashMap<>();

        for (CategoryGenre cg : categoryGenres) {
            Integer categoryId = cg.getCategory().getCategoryId();

            if (!categoryMap.containsKey(categoryId)) {
                CategoryWithGenresDto dto = new CategoryWithGenresDto(
                        categoryId,
                        cg.getCategory().getName(),
                        new ArrayList<>()
                );
                categoryMap.put(categoryId, dto);
            }

            CategoryWithGenresDto dto = categoryMap.get(categoryId);
            dto.getGenres().add(new GenreDto(
                    cg.getGenre().getGenreId(),
                    cg.getGenre().getName()
            ));
        }

        return new ArrayList<>(categoryMap.values());
    }
}