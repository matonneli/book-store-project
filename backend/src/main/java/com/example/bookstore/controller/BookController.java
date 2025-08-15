package com.example.bookstore.controller;

import com.example.bookstore.dto.BookDto;
import com.example.bookstore.dto.BookDetailDto;
import com.example.bookstore.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalog")
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books")
    public ResponseEntity<Map<String, Object>> getBooks(
            @RequestParam(required = false) List<Integer> genres,
            @RequestParam(required = false) List<Integer> categories,
            @RequestParam(required = false) String title,
            @RequestParam(required = false, defaultValue = "asc") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "9") int size) {

        if (page < 0) page = 0;
        if (size < 1 || size > 100) size = 9;

        Map<String, Object> result = bookService.getBooks(genres, categories, title, sort, page, size);
        return ResponseEntity.ok(result);
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

    @GetMapping("/books/{id}/details")
    public ResponseEntity<BookDetailDto> getBookDetails(@PathVariable Integer id) {
        BookDetailDto bookDetails = bookService.getBookDetailById(id);
        if (bookDetails != null) {
            return ResponseEntity.ok(bookDetails);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/books/discounts")
    public ResponseEntity<Map<String, Object>> getDiscountedBooks(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "9") int size) {

        if (page < 0) page = 0;
        if (size < 1 || size > 100) size = 9;

        Map<String, Object> result = bookService.getDiscountedBooks(page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/books/new")
    public ResponseEntity<Map<String, Object>> getNewBooks(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "9") int size) {

        if (page < 0) page = 0;
        if (size < 1 || size > 100) size = 9;

        Map<String, Object> result = bookService.getNewBooks(page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/books/bestsellers")
    public ResponseEntity<Map<String, Object>> getBestsellers(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "9") int size) {

        if (page < 0) page = 0;
        if (size < 1 || size > 100) size = 9;

        Map<String, Object> result = bookService.getBestsellers(page, size);
        return ResponseEntity.ok(result);
    }
}