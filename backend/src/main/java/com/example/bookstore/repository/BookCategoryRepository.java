package com.example.bookstore.repository;

import com.example.bookstore.model.BookCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookCategoryRepository extends JpaRepository<BookCategory, Integer> {
    List<BookCategory> findByBookId(Integer bookId);
}