package com.example.bookstore.repository;

import com.example.bookstore.model.BookImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookImageRepository extends JpaRepository<BookImage, Integer> {
    List<BookImage> findByBook_BookId(Integer bookId);
    void deleteByBook_BookId(Integer bookId);
}