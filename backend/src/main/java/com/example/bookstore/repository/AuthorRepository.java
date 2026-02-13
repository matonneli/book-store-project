package com.example.bookstore.repository;

import com.example.bookstore.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Integer> {

    @Query("SELECT a FROM Author a WHERE LOWER(a.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Author> findByFullNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}