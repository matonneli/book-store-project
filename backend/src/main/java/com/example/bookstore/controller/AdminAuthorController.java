package com.example.bookstore.controller;

import com.example.bookstore.dto.AuthorDto;
import com.example.bookstore.dto.CreateAuthorDto;
import com.example.bookstore.dto.UpdateAuthorDto;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.exception.UnauthorizedException;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.service.AdminAuthService;
import com.example.bookstore.service.AuthorService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/authors")
public class AdminAuthorController {

    private final AdminAuthService adminAuthService;
    private final AuthorService authorService;

    public AdminAuthorController(AdminAuthService adminAuthService, AuthorService authorService) {
        this.adminAuthService = adminAuthService;
        this.authorService = authorService;
    }

    @PostMapping
    public ResponseEntity<?> createAuthor(
            @RequestBody CreateAuthorDto createDto,
            HttpSession session) {

        try {
            adminAuthService.requireAdminRole(session);

            AuthorDto created = authorService.createAuthor(createDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error during author creation"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchAuthors(
            @RequestParam(required = false) String searchTerm,
            HttpSession session) {

        try {
            adminAuthService.requireAdminRole(session);

            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Search term is required"));
            }

            List<AuthorDto> authors = authorService.searchAuthors(searchTerm);
            return ResponseEntity.ok(authors);

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error during author search"));
        }
    }

    @GetMapping("/{authorId}")
    public ResponseEntity<?> getAuthorById(
            @PathVariable Integer authorId,
            HttpSession session) {

        try {
            adminAuthService.requireAdminRole(session);

            AuthorDto author = authorService.getAuthorById(authorId);
            return ResponseEntity.ok(author);

        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error during author retrieval"));
        }
    }

    @PutMapping("/{authorId}")
    public ResponseEntity<?> updateAuthor(
            @PathVariable Integer authorId,
            @RequestBody UpdateAuthorDto updateDto,
            HttpSession session) {

        try {
            adminAuthService.requireAdminRole(session);

            AuthorDto updated = authorService.updateAuthor(authorId, updateDto);
            return ResponseEntity.ok(updated);

        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error during author update"));
        }
    }
}