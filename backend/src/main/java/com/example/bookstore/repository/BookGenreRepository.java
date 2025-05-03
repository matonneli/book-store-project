package com.example.bookstore.repository;

import com.example.bookstore.model.BookCategory;
import com.example.bookstore.model.BookGenre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookGenreRepository extends JpaRepository<BookGenre, Integer> {
    List<BookGenre> findByBookId(Integer bookId);
}