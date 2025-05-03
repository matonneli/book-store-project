// BookController.java
package com.example.bookstore.controller;

import com.example.bookstore.dto.BookDto;
import com.example.bookstore.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books")
    public ResponseEntity<List<BookDto>> getBooks(
            @RequestParam(required = false) List<Integer> genres,
            @RequestParam(required = false) List<Integer> categories,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String sort
    ) {
        List<BookDto> books = bookService.getBooks(genres, categories, title, sort);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/books/discounts")
    public ResponseEntity<List<BookDto>> getDiscountedBooks() {
        List<BookDto> books = bookService.getDiscountedBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/books/new")
    public ResponseEntity<List<BookDto>> getNewBooks() {
        List<BookDto> books = bookService.getNewBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/books/bestsellers")
    public ResponseEntity<List<BookDto>> getBestsellers() {
        List<BookDto> books = bookService.getBestsellers();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Integer id) {
        BookDto book = bookService.getBookByIdForCatalog(id);
        if (book != null) {
            return ResponseEntity.ok(book);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}