package com.example.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookstore.model.Book;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, Integer>{
    @Query("""
  SELECT DISTINCT b
    FROM Book b
    LEFT JOIN BookGenre bg ON b.bookId = bg.bookId
    LEFT JOIN BookCategory bc ON b.bookId = bc.bookId
    JOIN Author a ON a.authorId = b.authorId
  WHERE (:genreIds IS NULL OR bg.genreId IN :genreIds)
    AND (:categoryIds IS NULL OR bc.categoryId IN :categoryIds)
    AND (
         :pattern IS NULL
      OR b.title ILIKE :pattern
      OR a.fullName ILIKE :pattern
    )
  ORDER BY b.purchasePrice ASC
""")
    List<Book> findFilteredSortedAsc(
            @Param("genreIds")   List<Integer> genreIds,
            @Param("categoryIds")List<Integer> categoryIds,
            @Param("pattern")    String pattern
    );

    @Query("""
  SELECT DISTINCT b
    FROM Book b
    LEFT JOIN BookGenre bg ON b.bookId = bg.bookId
    LEFT JOIN BookCategory bc ON b.bookId = bc.bookId
    JOIN Author a ON a.authorId = b.authorId
  WHERE (:genreIds IS NULL OR bg.genreId IN :genreIds)
    AND (:categoryIds IS NULL OR bc.categoryId IN :categoryIds)
    AND (
         :pattern IS NULL
      OR b.title ILIKE :pattern
      OR a.fullName ILIKE :pattern
    )
  ORDER BY b.purchasePrice DESC
""")
    List<Book> findFilteredSortedDesc(
            @Param("genreIds")   List<Integer> genreIds,
            @Param("categoryIds")List<Integer> categoryIds,
            @Param("pattern")    String pattern
    );

    @Query("""
  SELECT DISTINCT b
    FROM Book b
  WHERE b.discountPercent > 0
  ORDER BY b.purchasePrice DESC
""")
    List<Book> findDiscountedBooks();

    @Query("""
  SELECT DISTINCT b
    FROM Book b
  WHERE b.updatedAt >= :oneMonthAgo
  ORDER BY b.updatedAt DESC
""")
    List<Book> findNewBooks(@Param("oneMonthAgo") LocalDateTime oneMonthAgo);

    @Query("""
  SELECT DISTINCT b
    FROM Book b
    JOIN BookCategory bc ON b.bookId = bc.bookId
  WHERE bc.categoryId = 3
  ORDER BY b.purchasePrice DESC
""")
    List<Book> findBestsellers();
}