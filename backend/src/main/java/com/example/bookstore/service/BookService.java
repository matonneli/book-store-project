package com.example.bookstore.service;

import com.example.bookstore.dto.AdminBookDto;
import com.example.bookstore.dto.BookDto;
import com.example.bookstore.dto.BookDetailDto;
import com.example.bookstore.dto.UpdateBookDto;
import com.example.bookstore.exception.BookUpdateException;
import com.example.bookstore.exception.NotFoundException;
import com.example.bookstore.exception.ValidationException;
import com.example.bookstore.model.*;
import com.example.bookstore.repository.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final GenreRepository genreRepository;
    private final CategoryRepository categoryRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookCategoryRepository bookCategoryRepository;
    private final BookImageRepository bookImageRepository;

    @Autowired
    public BookService(BookRepository bookRepository,
                       AuthorRepository authorRepository,
                       GenreRepository genreRepository,
                       CategoryRepository categoryRepository,
                       BookGenreRepository bookGenreRepository,
                       BookCategoryRepository bookCategoryRepository,
                       BookImageRepository bookImageRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.genreRepository = genreRepository;
        this.categoryRepository = categoryRepository;
        this.bookGenreRepository = bookGenreRepository;
        this.bookCategoryRepository = bookCategoryRepository;
        this.bookImageRepository = bookImageRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBooks(List<Integer> genreIds, List<Integer> categoryIds,
                                        String title, String sortOrder, int page, int size) {
        genreIds = (genreIds == null || genreIds.isEmpty()) ? null : genreIds;
        categoryIds = (categoryIds == null || categoryIds.isEmpty()) ? null : categoryIds;
        String pattern = null;
        if (title != null && !title.isBlank()) {
            pattern = "%" + title.trim() + "%";
        }
        boolean desc = "desc".equalsIgnoreCase(sortOrder);

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = desc
                ? bookRepository.findFilteredSortedDesc(genreIds, categoryIds, pattern, pageable)
                : bookRepository.findFilteredSortedAsc(genreIds, categoryIds, pattern, pageable);

        return getStringObjectMap(bookPage);
    }

    @Transactional(readOnly = true)
    public BookDto getBookByIdForCatalog(Integer id) {
        Optional<Book> bookOptional = bookRepository.findById(id);
        return bookOptional.map(this::convertToBookDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDiscountedBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findDiscountedBooks(pageable);

        return getStringObjectMap(bookPage);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNewBooks(int page, int size) {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findNewBooks(oneMonthAgo, pageable);

        return getStringObjectMap(bookPage);
    }

    private Map<String, Object> getStringObjectMap(Page<Book> bookPage) {
        List<BookDto> bookDtos = bookPage.getContent().stream()
                .map(this::convertToBookDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("books", bookDtos);
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("totalElements", bookPage.getTotalElements());
        response.put("hasNext", bookPage.hasNext());
        response.put("hasPrevious", bookPage.hasPrevious());

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBestsellers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.findBestsellers(pageable);

        return getStringObjectMap(bookPage);
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
        dto.setStockQuantity(book.getStockQuantity());

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

    @Transactional(readOnly = true)
    public Map<String, Object> getBooksForAdmin(String searchQuery, String sortBy, String sortOrder, int page, int size) {
        String pattern = null;
        if (searchQuery != null && !searchQuery.isBlank()) {
            pattern = "%" + searchQuery.trim() + "%";
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage;

        switch (sortBy.toLowerCase()) {
            case "created_at":
                bookPage = "desc".equalsIgnoreCase(sortOrder)
                        ? bookRepository.findForAdminSortedByCreatedAtDesc(pattern, pageable)
                        : bookRepository.findForAdminSortedByCreatedAtAsc(pattern, pageable);
                break;
            case "updated_at":
                bookPage = "desc".equalsIgnoreCase(sortOrder)
                        ? bookRepository.findForAdminSortedByUpdatedAtDesc(pattern, pageable)
                        : bookRepository.findForAdminSortedByUpdatedAtAsc(pattern, pageable);
                break;
            default:
                bookPage = bookRepository.findForAdminSortedByUpdatedAtDesc(pattern, pageable);
                break;
        }

        List<AdminBookDto> adminBookDtos = bookPage.getContent().stream()
                .map(this::convertToAdminBookDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("books", adminBookDtos);
        response.put("currentPage", bookPage.getNumber());
        response.put("totalPages", bookPage.getTotalPages());
        response.put("totalElements", bookPage.getTotalElements());

        return response;
    }

    @Transactional(readOnly = true)
    public Optional<AdminBookDto> getBookForEdit(Integer id) {
        return bookRepository.findById(id)
                .map(this::convertToAdminBookDto);
    }

    @Transactional(readOnly = true)
    public BookDetailDto getBookDetailById(Integer id) {
        BookDto basicBook = getBookByIdForCatalog(id);
        if (basicBook == null) {
            return null;
        }
        BookDetailDto detailDto = new BookDetailDto();
        BeanUtils.copyProperties(basicBook, detailDto);
        detailDto.setAverageRating(bookRepository.getAverageRatingByBookId(id));
        detailDto.setTotalReviews(bookRepository.getTotalReviewsByBookId(id));
        return detailDto;
    }

    @Transactional
    public AdminBookDto createBook(UpdateBookDto dto) {
        validateBookData(dto);
        Book book = new Book();
        book.setTitle(dto.getTitle().trim());
        book.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        book.setAuthorId(dto.getAuthorId());
        book.setPurchasePrice(dto.getPurchasePrice());
        book.setRentalPrice(dto.getRentalPrice());
        book.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0);
        book.setStatus(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE");
        book.setDiscountPercent(dto.getDiscountPercent() != null ? dto.getDiscountPercent() : BigDecimal.ZERO);
        book.setPublicationDate(dto.getPublicationDate());
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());
        book = bookRepository.save(book);
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            updateBookCategories(book.getBookId(), dto.getCategoryIds());
        }

        if (dto.getGenreIds() != null && !dto.getGenreIds().isEmpty()) {
            updateBookGenres(book.getBookId(), dto.getGenreIds());
        }

        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            updateBookImages(book, dto.getImageUrls());
        }

        return convertToAdminBookDto(book);
    }

    @Transactional
    public AdminBookDto updateBook(Integer bookId, UpdateBookDto dto) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Book not found with id: " + bookId));

        validateBookData(dto);
        book.setTitle(dto.getTitle().trim());
        book.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        book.setAuthorId(dto.getAuthorId());
        book.setPurchasePrice(dto.getPurchasePrice());
        book.setRentalPrice(dto.getRentalPrice());
        book.setStockQuantity(dto.getStockQuantity());
        book.setStatus(dto.getStatus());
        book.setDiscountPercent(dto.getDiscountPercent());
        book.setPublicationDate(dto.getPublicationDate());
        updateBookCategories(bookId, dto.getCategoryIds());
        updateBookGenres(bookId, dto.getGenreIds());
        updateBookImages(book, dto.getImageUrls());

        book.setUpdatedAt(LocalDateTime.now());

        return convertToAdminBookDto(book);
    }

    private void validateBookData(UpdateBookDto dto) {
        List<String> errors = new ArrayList<>();

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            errors.add("Title is required");
        } else if (dto.getTitle().trim().length() > 255) {
            errors.add("Title must be less than 256 characters");
        }

        if (dto.getAuthorId() == null) {
            errors.add("Author is required");
        } else if (!authorRepository.existsById(dto.getAuthorId())) {
            errors.add("Author with id " + dto.getAuthorId() + " does not exist");
        }

        if (dto.getPurchasePrice() == null) {
            errors.add("Purchase price is required");
        } else if (dto.getPurchasePrice() < 0) {
            errors.add("Purchase price cannot be negative");
        }

        if (dto.getRentalPrice() == null) {
            errors.add("Rental price is required");
        } else if (dto.getRentalPrice() < 0) {
            errors.add("Rental price cannot be negative");
        }

        if (dto.getPublicationDate() == null) {
            errors.add("Publication date is required");
        }

        if (dto.getDescription() != null && dto.getDescription().length() > 2000) {
            errors.add("Description must be less than 2001 characters");
        }

        if (dto.getStockQuantity() != null && dto.getStockQuantity() < 0) {
            errors.add("Stock quantity cannot be negative");
        }

        if (dto.getStatus() != null) {
            Set<String> allowed = Set.of("AVAILABLE", "NOT_AVAILABLE");
            if (!allowed.contains(dto.getStatus())) {
                errors.add("Invalid status. Allowed values: " + String.join(", ", allowed));
            }
        }

        if (dto.getDiscountPercent() != null) {
            if (dto.getDiscountPercent().compareTo(BigDecimal.ZERO) < 0 ||
                    dto.getDiscountPercent().compareTo(new BigDecimal("100")) > 0) {
                errors.add("Discount percent must be between 0 and 100");
            }
        }

        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            for (Integer categoryId : dto.getCategoryIds()) {
                if (!categoryRepository.existsById(categoryId)) {
                    errors.add("Category with id " + categoryId + " does not exist");
                }
            }
        }

        if (dto.getGenreIds() != null && !dto.getGenreIds().isEmpty()) {
            for (Integer genreId : dto.getGenreIds()) {
                if (!genreRepository.existsById(genreId)) {
                    errors.add("Genre with id " + genreId + " does not exist");
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join("; ", errors));
        }
    }

    private void updateBookCategories(Integer bookId, List<Integer> newIds) {
        if (newIds == null) return;
        Set<Integer> distinctNewIds = newIds.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<BookCategory> current = bookCategoryRepository.findByBookId(bookId);
        List<BookCategory> toDelete = current.stream()
                .filter(bc -> !distinctNewIds.contains(bc.getCategoryId()))
                .collect(Collectors.toList());
        bookCategoryRepository.deleteAll(toDelete);
        Set<Integer> currentIds = current.stream()
                .map(BookCategory::getCategoryId)
                .collect(Collectors.toSet());
        List<BookCategory> toAdd = distinctNewIds.stream()
                .filter(id -> !currentIds.contains(id))
                .map(id -> {
                    BookCategory bc = new BookCategory();
                    bc.setBookId(bookId);
                    bc.setCategoryId(id);
                    return bc;
                }).collect(Collectors.toList());
        bookCategoryRepository.saveAll(toAdd);
    }

    private void updateBookGenres(Integer bookId, List<Integer> newIds) {
        if (newIds == null) return;
        Set<Integer> distinctNewIds = newIds.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<BookGenre> current = bookGenreRepository.findByBookId(bookId);
        List<BookGenre> toDelete = current.stream()
                .filter(bg -> !distinctNewIds.contains(bg.getGenreId()))
                .collect(Collectors.toList());
        bookGenreRepository.deleteAll(toDelete);
        Set<Integer> currentIds = current.stream()
                .map(BookGenre::getGenreId)
                .collect(Collectors.toSet());
        List<BookGenre> toAdd = distinctNewIds.stream()
                .filter(id -> !currentIds.contains(id))
                .map(id -> {
                    BookGenre bg = new BookGenre();
                    bg.setBookId(bookId);
                    bg.setGenreId(id);
                    return bg;
                }).collect(Collectors.toList());
        bookGenreRepository.saveAll(toAdd);
    }

    private void updateBookImages(Book book, List<String> urls) {
        bookImageRepository.deleteByBook_BookId(book.getBookId());
        List<BookImage> newImages = urls.stream()
                .filter(url -> url != null && !url.isBlank())
                .map(url -> {
                    BookImage bi = new BookImage();
                    bi.setBook(book);
                    bi.setImageUrl(url.trim());
                    return bi;
                }).collect(Collectors.toList());
        bookImageRepository.saveAll(newImages);
    }

    @Transactional
    public void incrementBookStock(Integer bookId, Integer quantity) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Book not found: " + bookId));

        Integer currentStock = book.getStockQuantity();
        book.setStockQuantity(currentStock + quantity);
        bookRepository.save(book);
    }

    private AdminBookDto convertToAdminBookDto(Book book) {
        AdminBookDto dto = new AdminBookDto();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setAuthorId(book.getAuthorId());
        dto.setPurchasePrice(book.getPurchasePrice());
        dto.setRentalPrice(book.getRentalPrice());
        dto.setStockQuantity(book.getStockQuantity());
        dto.setStatus(book.getStatus());
        dto.setDiscountPercent(book.getDiscountPercent());
        dto.setPublicationDate(book.getPublicationDate());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());

        if (book.getImages() != null) {
            dto.setImageUrls(book.getImages().stream()
                    .map(BookImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        dto.setGenreIds(bookGenreRepository.findByBookId(book.getBookId())
                .stream()
                .map(BookGenre::getGenreId)
                .collect(Collectors.toList()));

        dto.setCategoryIds(bookCategoryRepository.findByBookId(book.getBookId())
                .stream()
                .map(BookCategory::getCategoryId)
                .collect(Collectors.toList()));

        return dto;
    }
}