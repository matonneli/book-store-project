package com.example.bookstore.repository;

import com.example.bookstore.model.BookCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookCategoryRepository extends JpaRepository<BookCategory, Integer> {
    List<BookCategory> findByBookId(Integer bookId);
    @Modifying
    @Query("DELETE FROM BookCategory bc WHERE bc.bookId = :bookId AND bc.categoryId IN :categoryIds")
    void deleteByBookIdAndCategoryIds(Integer bookId, List<Integer> categoryIds);

}