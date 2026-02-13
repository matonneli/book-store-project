package com.example.bookstore.service;

import com.example.bookstore.dto.AuthorDto;
import com.example.bookstore.dto.CreateAuthorDto;
import com.example.bookstore.dto.UpdateAuthorDto;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.model.Author;
import com.example.bookstore.repository.AuthorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @Transactional
    public AuthorDto createAuthor(CreateAuthorDto dto) {
        List<String> errors = new ArrayList<>();
        if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
            errors.add("Author name cannot be empty");
        } else if (dto.getFullName().trim().length() > 255) {
            errors.add("Author name must be less than 256 characters");
        }

        if (dto.getDescription() != null && dto.getDescription().length() > 2000) {
            errors.add("Description must be less than 2001 characters");
        }
        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join("; ", errors));
        }
        Author author = new Author();
        author.setFullName(dto.getFullName().trim());
        author.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        Author saved = authorRepository.save(author);
        return convertToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AuthorDto> searchAuthors(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<Author> authors = authorRepository.findByFullNameContainingIgnoreCase(searchTerm.trim());
        return authors.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuthorDto getAuthorById(Integer authorId) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new NotFoundException("Author not found with id: " + authorId));
        return convertToDto(author);
    }

    @Transactional
    public AuthorDto updateAuthor(Integer authorId, UpdateAuthorDto dto) {
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new NotFoundException("Author not found with id: " + authorId));

        List<String> errors = new ArrayList<>();

        if (dto.getFullName() != null) {
            if (dto.getFullName().trim().isEmpty()) {
                errors.add("Author name cannot be empty");
            } else if (dto.getFullName().trim().length() > 255) {
                errors.add("Author name must be less than 256 characters");
            }
        }

        if (dto.getDescription() != null && dto.getDescription().length() > 2000) {
            errors.add("Description must be less than 2001 characters");
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join("; ", errors));
        }

        if (dto.getFullName() != null) {
            author.setFullName(dto.getFullName().trim());
        }

        if (dto.getDescription() != null) {
            author.setDescription(dto.getDescription().trim());
        }

        Author updated = authorRepository.save(author);
        return convertToDto(updated);
    }

    public List<AuthorDto> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private AuthorDto convertToDto(Author author) {
        AuthorDto dto = new AuthorDto();
        dto.setAuthorId(author.getAuthorId());
        dto.setFullName(author.getFullName());
        dto.setDescription(author.getDescription());
        return dto;
    }
}