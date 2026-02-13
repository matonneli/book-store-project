package com.example.bookstore.controller;

import com.example.bookstore.dto.AdminBookDto;
import com.example.bookstore.dto.BookDto;
import com.example.bookstore.dto.UpdateBookDto;
import com.example.bookstore.exception.BookUpdateException;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.service.AdminAuthService;
import com.example.bookstore.service.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/books")
public class AdminBookController {

    private final AdminAuthService adminAuthService;
    private final BookService bookService;

    public AdminBookController(AdminAuthService adminAuthService, BookService bookService) {
        this.adminAuthService = adminAuthService;
        this.bookService = bookService;
    }

    @GetMapping()
    public ResponseEntity<Map<String, Object>> getBooksForAdmin(
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false, defaultValue = "updated_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {

        if (!adminAuthService.isAdminLoggedIn(session)) {
            throw new UnauthorizedException("Session expired. Please login again");
        }

        Map<String, Object> books = bookService.getBooksForAdmin(searchQuery, sortBy, sortOrder, page, size);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}/edit")
    public ResponseEntity<AdminBookDto> getBookForEdit(
            @PathVariable Integer id,
            HttpSession session) {

        adminAuthService.requireAdminRole(session);

        return bookService.getBookForEdit(id)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateBook(
            @PathVariable Integer id,
            @RequestBody UpdateBookDto updateDto,
            HttpSession session) {

        try {
            adminAuthService.requireAdminRole(session);
            AdminBookDto updated = bookService.updateBook(id, updateDto);
            return ResponseEntity.ok(updated);

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error during book update"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBook(
            @RequestBody UpdateBookDto createDto,
            HttpSession session) {

        try {
            adminAuthService.requireAdminRole(session);
            AdminBookDto created = bookService.createBook(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error during book creation"));
        }
    }
}