package com.example.bookstore.repository;

import com.example.bookstore.model.CategoryGenre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryGenreRepository extends JpaRepository<CategoryGenre, Integer> {

    @Query("SELECT cg FROM CategoryGenre cg JOIN FETCH cg.category c JOIN FETCH cg.genre g")
    List<CategoryGenre> findAllWithCategoryAndGenre();
}
