package com.example.bookstore.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.example.bookstore.model.Book;
import com.example.bookstore.service.BookService;

import java.util.List;
@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;

    }
    @GetMapping
    public List<Book> getBooks() {
        return bookService.getAllBooks();
    }
}