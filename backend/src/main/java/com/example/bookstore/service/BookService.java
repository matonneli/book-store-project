package com.example.bookstore.service;

import com.example.bookstore.dto.BookDto;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final CategoryRepository categoryRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookCategoryRepository bookCategoryRepository;

    @Autowired
    public BookService(BookRepository bookRepository,
                       AuthorRepository authorRepository,
                       GenreRepository genreRepository,
                       CategoryRepository categoryRepository,
                       BookGenreRepository bookGenreRepository,
                       BookCategoryRepository bookCategoryRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.genreRepository = genreRepository;
        this.categoryRepository = categoryRepository;
        this.bookGenreRepository = bookGenreRepository;
        this.bookCategoryRepository = bookCategoryRepository;
    }

    @Transactional(readOnly = true)
    public List<BookDto> getBooks(List<Integer> genreIds, List<Integer> categoryIds, String title, String sortOrder) {
        genreIds = (genreIds == null || genreIds.isEmpty()) ? null : genreIds;
        categoryIds = (categoryIds == null || categoryIds.isEmpty()) ? null : categoryIds;
        String pattern = null;
        if (title != null && !title.isBlank()) {
            pattern = "%" + title.trim() + "%";
        }
        boolean desc = "desc".equalsIgnoreCase(sortOrder);
        List<Book> books = desc
                ? bookRepository.findFilteredSortedDesc(genreIds, categoryIds, pattern)
                : bookRepository.findFilteredSortedAsc (genreIds, categoryIds, pattern);

        return books.stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookDto getBookByIdForCatalog(Integer id) {
        Optional<Book> bookOptional = bookRepository.findById(id);
        return bookOptional.map(this::convertToBookDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<BookDto> getDiscountedBooks() {
        List<Book> books = bookRepository.findDiscountedBooks();
        return books.stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookDto> getNewBooks() {
        // Books updated within the last month
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        List<Book> books = bookRepository.findNewBooks(oneMonthAgo);
        return books.stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookDto> getBestsellers() {
        List<Book> books = bookRepository.findBestsellers();
        return books.stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());
    }

    private BookDto convertToBookDto(Book book) {
        BookDto dto = new BookDto();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        Optional<Author> authorOptional = authorRepository.findById(book.getAuthorId());
        authorOptional.ifPresent(author -> dto.setAuthorName(author.getFullName()));
        dto.setDescription(book.getDescription());
        dto.setPublicationDate(book.getPublicationDate());
        dto.setPurchasePrice(book.getPurchasePrice());
        dto.setRentalPrice(book.getRentalPrice());

        List<String> imageUrls = book.getImages().stream()
                .map(BookImage::getImageUrl)
                .collect(Collectors.toList());
        dto.setImageUrls(imageUrls);

        List<BookGenre> bookGenres = bookGenreRepository.findByBookId(book.getBookId());
        List<String> genres = bookGenres.stream()
                .map(bookGenre -> {
                    Optional<Genre> genreOptional = genreRepository.findById(bookGenre.getGenreId());
                    return genreOptional.map(Genre::getName).orElse(null);
                })
                .filter(text -> text != null)
                .collect(Collectors.toList());
        dto.setGenres(genres);

        List<BookCategory> bookCategories = bookCategoryRepository.findByBookId(book.getBookId());
        List<String> categories = bookCategories.stream()
                .map(bookCategory -> {
                    Optional<Category> categoryOptional = categoryRepository.findById(bookCategory.getCategoryId());
                    return categoryOptional.map(Category::getName).orElse(null);
                })
                .filter(text -> text != null)
                .collect(Collectors.toList());
        dto.setCategories(categories);
        dto.setDiscountPercent(book.getDiscountPercent());
        return dto;
    }
}