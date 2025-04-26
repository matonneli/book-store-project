// BookService.java
package com.example.bookstore.service;

import com.example.bookstore.dto.BookDto;
import com.example.bookstore.model.Author;
import com.example.bookstore.model.Book;
import com.example.bookstore.model.BookImage;
import com.example.bookstore.repository.AuthorRepository;
import com.example.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;

    @Autowired
    public BookService(BookRepository bookRepository, AuthorRepository authorRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    @Transactional(readOnly = true)
    public List<BookDto> getAllBooksForCatalog() {
        List<Book> books = bookRepository.findAll();
        return books.stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookDto getBookByIdForCatalog(Integer id) {
        Optional<Book> bookOptional = bookRepository.findById(id);
        return bookOptional.map(this::convertToBookDto).orElse(null);
    }

    private BookDto convertToBookDto(Book book) {
        BookDto dto = new BookDto();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());

        // Получение имени автора
        Optional<Author> authorOptional = authorRepository.findById(book.getAuthorId());
        authorOptional.ifPresent(author -> dto.setAuthorName(author.getFullName()));

        dto.setDescription(book.getDescription());
        dto.setPublicationDate(book.getPublicationDate());
        dto.setPurchasePrice(book.getPurchasePrice());
        dto.setRentalPrice(book.getRentalPrice());

        // Извлечение только URL изображений
        List<String> imageUrls = book.getImages().stream()
                .map(BookImage::getImageUrl)
                .collect(Collectors.toList());
        dto.setImageUrls(imageUrls);

        return dto;
    }
}