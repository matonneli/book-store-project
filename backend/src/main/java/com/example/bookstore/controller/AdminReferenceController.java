package com.example.bookstore.controller;

import com.example.bookstore.dto.ReferenceDto;
import com.example.bookstore.enums.ItemStatus;
import com.example.bookstore.service.*;
import com.example.bookstore.enums.OrderStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/api/admin/references")
public class AdminReferenceController {

    private final CategoryGenreService categoryGenreService;
    private final CategoryService categoryService;
    private final GenreService genreService;
    private final AuthorService authorService;
    private final PickUpPointService pickUpPointService;

    public AdminReferenceController(CategoryGenreService categoryGenreService,
                                    CategoryService categoryService,
                                    GenreService genreService,
                                    AuthorService authorService,
                                    PickUpPointService pickUpPointService) {
        this.categoryGenreService = categoryGenreService;
        this.categoryService = categoryService;
        this.genreService = genreService;
        this.authorService = authorService;
        this.pickUpPointService = pickUpPointService;
    }

    @GetMapping
    public ResponseEntity<ReferenceDto> getReferences() {
        ReferenceDto dto = new ReferenceDto();
        dto.setAuthors(authorService.getAllAuthors());
        dto.setAllCategories(categoryService.getAllCategories());
        dto.setAllGenres(genreService.getAllGenres());
        dto.setTree(categoryGenreService.getCategoriesWithGenres());
        dto.setPickUpPoints(pickUpPointService.getAllPickUpPoints());
        dto.setOrderStatuses(Arrays.asList(OrderStatus.values()));
        dto.setItemStatuses(Arrays.asList(ItemStatus.values()));
        return ResponseEntity.ok(dto);
    }
}