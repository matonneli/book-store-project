package com.example.bookstore.service;

import com.example.bookstore.repository.BookRepository;
import org.springframework.stereotype.Service;
import com.example.bookstore.model.Book;

import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
}
