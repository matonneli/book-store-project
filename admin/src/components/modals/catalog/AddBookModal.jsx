import React, { useState, useMemo } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useToast } from '../../shared/ToastSystem';
import { useReferences } from '../../../contexts/AdminReferenceContext';
import { useBookAdmin } from '../../../contexts/BookAdminContext';

const API_BASE_URL = 'http://localhost:8081';

const AddBookModal = ({ show, onClose, onBookAdded }) => {
    const toast = useToast();
    const { authors, allCategories, allGenres, tree } = useReferences();
    const { fetchBooks } = useBookAdmin();

    const [loading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        authorId: '',
        publicationDate: '',
        description: '',
        purchasePrice: '',
        rentalPrice: '',
        discountPercent: '',
        stockQuantity: '',
        status: 'AVAILABLE',
        imageUrl: '',
        genreIds: [],
        categoryIds: [],
    });

    const categorizedData = useMemo(() => {
        const categoryIdsInTree = new Set(tree.map(item => item.categoryId));
        const categoriesWithGenres = tree.map(item => ({
            categoryId: item.categoryId,
            categoryName: item.categoryName || item.name,
            genres: item.genres || []
        }));

        const standaloneCategories = allCategories.filter(
            cat => !categoryIdsInTree.has(cat.categoryId)
        );

        return {
            categoriesWithGenres,
            standaloneCategories
        };
    }, [tree, allCategories]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
        }));

        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleGenreToggle = (genreId, categoryId) => {
        setFormData((prev) => {
            const isSelected = prev.genreIds.includes(genreId);

            let newGenreIds;
            let newCategoryIds = [...prev.categoryIds];

            if (isSelected) {
                newGenreIds = prev.genreIds.filter(id => id !== genreId);
                const categoryGenres = categorizedData.categoriesWithGenres
                    .find(cat => cat.categoryId === categoryId)?.genres || [];
                const hasOtherGenresFromCategory = categoryGenres.some(
                    g => g.genreId !== genreId && newGenreIds.includes(g.genreId)
                );
                if (!hasOtherGenresFromCategory) {
                    newCategoryIds = newCategoryIds.filter(id => id !== categoryId);
                }
            } else {
                newGenreIds = [...prev.genreIds, genreId];
                if (!newCategoryIds.includes(categoryId)) {
                    newCategoryIds.push(categoryId);
                }
            }

            return {
                ...prev,
                genreIds: newGenreIds,
                categoryIds: newCategoryIds
            };
        });
    };

    const handleStandaloneCategoryToggle = (categoryId) => {
        if (categoryId === 2) {
            const discount = parseFloat(formData.discountPercent) || 0;
            if (discount <= 0) {
                toast.warning('Discounts category requires discount percentage > 0');
                return;
            }
        }

        setFormData((prev) => {
            const isSelected = prev.categoryIds.includes(categoryId);
            const newCategoryIds = isSelected
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId];

            return {
                ...prev,
                categoryIds: newCategoryIds
            };
        });
    };

    const canSelectDiscounts = useMemo(() => {
        const discount = parseFloat(formData.discountPercent) || 0;
        return discount > 0;
    }, [formData.discountPercent]);

    const validateForm = () => {
        const errors = {};

        if (!formData.title || formData.title.trim() === '') {
            errors.title = 'Title is required';
        }

        if (!formData.authorId) {
            errors.authorId = 'Author is required';
        }

        if (!formData.publicationDate) {
            errors.publicationDate = 'Publication date is required';
        }

        if (formData.purchasePrice === '' || formData.purchasePrice < 0) {
            errors.purchasePrice = 'Purchase price must be >= 0';
        }

        if (formData.rentalPrice === '' || formData.rentalPrice < 0) {
            errors.rentalPrice = 'Rental price must be >= 0';
        }

        if (formData.discountPercent !== '' && (formData.discountPercent < 0 || formData.discountPercent > 100)) {
            errors.discountPercent = 'Discount must be between 0 and 100';
        }

        if (formData.stockQuantity === '' || formData.stockQuantity < 0) {
            errors.stockQuantity = 'Stock quantity must be >= 0';
        }

        const hasDiscountCategory = formData.categoryIds.includes(2);
        const discount = parseFloat(formData.discountPercent) || 0;
        if (hasDiscountCategory && discount <= 0) {
            errors.discountPercent = 'Discount percentage required for Discounts category';
        }

        return errors;
    };

    const handleSave = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                title: formData.title.trim(),
                authorId: parseInt(formData.authorId, 10),
                publicationDate: formData.publicationDate
                    ? `${formData.publicationDate}T00:00:00`
                    : null,
                description: formData.description.trim() || null,
                purchasePrice: parseFloat(formData.purchasePrice),
                rentalPrice: parseFloat(formData.rentalPrice),
                discountPercent: formData.discountPercent !== '' ? parseFloat(formData.discountPercent) : 0,
                stockQuantity: parseInt(formData.stockQuantity, 10),
                status: formData.status,
                imageUrls: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
                genreIds: formData.genreIds,
                categoryIds: formData.categoryIds,
            };

            const response = await fetch(`${API_BASE_URL}/api/admin/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to create book';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                }
                if (response.status === 401) {
                    errorMessage = 'Session expired. Please login again.';
                }
                throw new Error(errorMessage);
            }

            await fetchBooks();

            toast.success('Book created successfully');

            if (onBookAdded) {
                onBookAdded();
            }

            handleClose();

        } catch (err) {
            setError(err.message);
            toast.error('Creation failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            authorId: '',
            publicationDate: '',
            description: '',
            purchasePrice: '',
            rentalPrice: '',
            discountPercent: '',
            stockQuantity: '',
            status: 'AVAILABLE',
            imageUrl: '',
            genreIds: [],
            categoryIds: [],
        });
        setValidationErrors({});
        setError(null);
        onClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Add New Book</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                        <p className="mt-2">Loading book data...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="mb-4">{error}</Alert>
                ) : (
                    <Form>
                        <div className="border rounded p-3 mb-4 bg-light">
                            <h6 className="mb-3">Basic Information</h6>

                            <Form.Group className="mb-3">
                                <Form.Label>Title *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    isInvalid={!!validationErrors.title}
                                    placeholder="Enter book title"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.title}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Author *</Form.Label>
                                <Form.Select
                                    name="authorId"
                                    value={formData.authorId}
                                    onChange={handleChange}
                                    isInvalid={!!validationErrors.authorId}
                                >
                                    <option value="">-- Select Author --</option>
                                    {authors.map((author) => (
                                        <option key={author.authorId} value={author.authorId}>
                                            {author.fullName}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.authorId}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Publication Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="publicationDate"
                                    value={formData.publicationDate}
                                    onChange={handleChange}
                                    isInvalid={!!validationErrors.publicationDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.publicationDate}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-0">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter book description (optional)"
                                />
                            </Form.Group>
                        </div>

                        <div className="border rounded p-3 mb-4 bg-light">
                            <h6 className="mb-3">Pricing & Stock</h6>

                            <div className="row">
                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Purchase Price (zł) *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            name="purchasePrice"
                                            value={formData.purchasePrice}
                                            onChange={handleChange}
                                            isInvalid={!!validationErrors.purchasePrice}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.purchasePrice}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Rental Price (zł) *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            name="rentalPrice"
                                            value={formData.rentalPrice}
                                            onChange={handleChange}
                                            isInvalid={!!validationErrors.rentalPrice}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.rentalPrice}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

                                <div className="col-md-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Discount (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="1"
                                            name="discountPercent"
                                            value={formData.discountPercent}
                                            onChange={handleChange}
                                            isInvalid={!!validationErrors.discountPercent}
                                            placeholder="0"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.discountPercent}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

                                <div className="col-md-3">
                                    <Form.Group className="mb-0">
                                        <Form.Label>Stock Quantity *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="stockQuantity"
                                            value={formData.stockQuantity}
                                            onChange={handleChange}
                                            isInvalid={!!validationErrors.stockQuantity}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.stockQuantity}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded p-3 mb-4 bg-light">
                            <h6 className="mb-3">Image & Status</h6>

                            <div className="row">
                                <div className="col-md-9">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Image URL</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            placeholder="https://example.com/book-cover.jpg"
                                        />
                                        <Form.Text className="text-muted">
                                            Enter the URL of the book cover image
                                        </Form.Text>
                                    </Form.Group>
                                </div>

                                <div className="col-md-3">
                                    <Form.Group className="mb-0">
                                        <Form.Label>Availability Status</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            id="status-switch-add"
                                            label={formData.status === 'AVAILABLE' ? 'Available' : 'Not Available'}
                                            checked={formData.status === 'AVAILABLE'}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                status: e.target.checked ? 'AVAILABLE' : 'NOT_AVAILABLE'
                                            }))}
                                            className="mt-2"
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            {formData.imageUrl && (
                                <div className="mt-3">
                                    <Form.Label>Image Preview</Form.Label>
                                    <div
                                        className="border rounded bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: '160px', height: '220px', overflow: 'hidden' }}
                                    >
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => {
                                                e.target.src = 'https://via.placeholder.com/160x220?text=Image+not+found';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border rounded p-3 mb-0 bg-light">
                            <h6 className="mb-3">Categories & Genres</h6>

                            {categorizedData.categoriesWithGenres.length > 0 && (
                                <div className="mb-4">
                                    <div className="fw-bold mb-2 text-primary">Categories with Genres:</div>
                                    {categorizedData.categoriesWithGenres.map((category) => (
                                        <div key={category.categoryId} className="mb-3 ps-2">
                                            <div className="fw-semibold text-secondary mb-2">
                                                📂 {category.categoryName}
                                            </div>
                                            <div className="d-flex flex-wrap gap-2 ps-3">
                                                {category.genres.map((genre) => (
                                                    <Form.Check
                                                        key={genre.genreId}
                                                        type="checkbox"
                                                        id={`genre-${genre.genreId}`}
                                                        label={genre.name}
                                                        checked={formData.genreIds.includes(genre.genreId)}
                                                        onChange={() => handleGenreToggle(genre.genreId, category.categoryId)}
                                                        className="user-select-none"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {categorizedData.standaloneCategories.length > 0 && (
                                <div>
                                    <div className="fw-bold mb-2 text-primary">Standalone Categories:</div>
                                    <div className="d-flex flex-wrap gap-3 ps-2">
                                        {categorizedData.standaloneCategories.map((category) => {
                                            const isDiscountCategory = category.categoryId === 2;
                                            const isDisabled = isDiscountCategory && !canSelectDiscounts;

                                            return (
                                                <div key={category.categoryId} className="position-relative">
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`category-${category.categoryId}`}
                                                        label={
                                                            <span>
                                                                {category.name}
                                                                {isDiscountCategory && !canSelectDiscounts && (
                                                                    <small className="text-muted ms-1">(requires discount)</small>
                                                                )}
                                                            </span>
                                                        }
                                                        checked={formData.categoryIds.includes(category.categoryId)}
                                                        onChange={() => handleStandaloneCategoryToggle(category.categoryId)}
                                                        disabled={isDisabled}
                                                        className="user-select-none"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-top">
                                <small className="text-muted">
                                    <strong>Selected:</strong>{' '}
                                    {formData.categoryIds.length} categories, {formData.genreIds.length} genres
                                </small>
                            </div>
                        </div>
                    </Form>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving || loading}
                >
                    {saving ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" /> Creating...
                        </>
                    ) : (
                        'Create Book'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddBookModal;