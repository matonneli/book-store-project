package com.example.bookstore.repository;

import com.example.bookstore.model.BookGenre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookGenreRepository extends JpaRepository<BookGenre, Integer> {
    List<BookGenre> findByBookId(Integer bookId);
    @Modifying
    @Query("DELETE FROM BookGenre bg WHERE bg.bookId = :bookId AND bg.genreId IN :genreIds")
    void deleteByBookIdAndGenreIds(Integer bookId, List<Integer> genreIds);
}