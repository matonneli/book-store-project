package com.example.bookstore.service;

import com.example.bookstore.dto.BookDto;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.dto.UpdateBookDto;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private AuthorRepository authorRepository;
    @Mock
    private BookGenreRepository bookGenreRepository;
    @Mock
    private BookCategoryRepository bookCategoryRepository;

    @InjectMocks
    private BookService bookService;


    @Test
    void getBookByIdForCatalog_found_returnsDto() {
        Book book = new Book();
        book.setBookId(1);
        book.setTitle("Test Book");
        book.setPurchasePrice(29.99);
        book.setImages(List.of());

        when(bookRepository.findById(1)).thenReturn(Optional.of(book));
        when(authorRepository.findById(any())).thenReturn(Optional.empty());
        when(bookGenreRepository.findByBookId(1)).thenReturn(List.of());
        when(bookCategoryRepository.findByBookId(1)).thenReturn(List.of());

        BookDto result = bookService.getBookByIdForCatalog(1);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Book");
    }

    @Test
    void getBookByIdForCatalog_notFound_returnsNull() {
        when(bookRepository.findById(999)).thenReturn(Optional.empty());

        BookDto result = bookService.getBookByIdForCatalog(999);

        assertThat(result).isNull();
    }


    @Test
    void incrementBookStock_increasesStockCorrectly() {
        Book book = new Book();
        book.setBookId(1);
        book.setStockQuantity(5);

        when(bookRepository.findById(1)).thenReturn(Optional.of(book));
        when(bookRepository.save(any())).thenReturn(book);

        bookService.incrementBookStock(1, 3);

        assertThat(book.getStockQuantity()).isEqualTo(8);
        verify(bookRepository).save(book);
    }

    @Test
    void incrementBookStock_bookNotFound_throwsNotFoundException() {
        when(bookRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.incrementBookStock(999, 1))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Book not found");
    }


    @Test
    void validateBookData_negativePurchasePrice_throwsValidationException() {
        UpdateBookDto dto = new UpdateBookDto();
        dto.setTitle("Valid Title");
        dto.setAuthorId(1);
        dto.setPurchasePrice(-10.0);
        dto.setRentalPrice(5.0);
        dto.setPublicationDate(LocalDateTime.now());
        Book book = new Book();
        book.setBookId(1);
        when(bookRepository.findById(1)).thenReturn(Optional.of(book));
        when(authorRepository.existsById(1)).thenReturn(true);
        assertThatThrownBy(() -> bookService.updateBook(1, dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Purchase price cannot be negative");
    }

    @Test
    void updateBook_authorNotFound_throwsValidationException() {
        UpdateBookDto dto = new UpdateBookDto();
        dto.setAuthorId(999);
        Book book = new Book();
        book.setBookId(1);
        when(bookRepository.findById(1)).thenReturn(Optional.of(book));
        when(authorRepository.existsById(999)).thenReturn(false);

        assertThatThrownBy(() -> bookService.updateBook(1, dto))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Author with id 999 does not exist");

        verify(bookRepository, never()).save(any());
    }
}