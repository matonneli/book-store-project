package com.example.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookstore.model.Book;
public interface BookRepository extends JpaRepository<Book, Integer>{

}