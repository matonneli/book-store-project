// src/components/EditAuthorModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useToast } from './ToastSystem';
import { useReferences } from '../contexts/AdminReferenceContext';

const API_BASE_URL = 'http://localhost:8081';

const EditAuthorModal = ({ show, onClose }) => {
    const toast = useToast();
    const { authors, updateAuthor } = useReferences();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        description: '',
    });
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const searchResults = useMemo(() => {
        if (!debouncedSearchTerm.trim()) {
            return [];
        }

        const term = debouncedSearchTerm.trim().toLowerCase();

        const isNumeric = /^\d+$/.test(term);

        if (isNumeric) {
            const authorId = parseInt(term, 10);
            return authors.filter(author => author.authorId === authorId);
        } else {
            return authors.filter(author =>
                author.fullName.toLowerCase().includes(term)
            );
        }
    }, [debouncedSearchTerm, authors]);

    const handleSelectAuthor = (author) => {
        setSelectedAuthor(author);
        setFormData({
            fullName: author.fullName || '',
            description: author.description || '',
        });
        setIsEditing(false);
        setValidationErrors({});
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            fullName: selectedAuthor.fullName || '',
            description: selectedAuthor.description || '',
        });
        setValidationErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.fullName || formData.fullName.trim() === '') {
            errors.fullName = 'Author name cannot be empty';
        } else if (formData.fullName.trim().length > 255) {
            errors.fullName = 'Author name must be less than 256 characters';
        }

        if (formData.description && formData.description.length > 2000) {
            errors.description = 'Description must be less than 2001 characters';
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

        try {
            const payload = {
                fullName: formData.fullName.trim(),
                description: formData.description.trim() || null,
            };

            const response = await fetch(`${API_BASE_URL}/api/admin/authors/${selectedAuthor.authorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to update author';
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

            const updatedAuthor = await response.json();

            setSelectedAuthor(updatedAuthor);
            setIsEditing(false);

            updateAuthor(updatedAuthor);

            toast.success(`Author "${updatedAuthor.fullName}" updated successfully!`);

        } catch (err) {
            toast.error('Update failed: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setSelectedAuthor(null);
        setIsEditing(false);
        setFormData({ fullName: '', description: '' });
        setValidationErrors({});
        onClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Author</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <Form.Label className="fw-bold">Search Author</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter author name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    <Form.Text className="text-muted">
                        You can search by author name or ID (results update automatically)
                    </Form.Text>
                </div>

                {searchTerm.trim() && searchResults.length > 0 && !selectedAuthor && (
                    <div className="mb-4">
                        <h6 className="mb-2">Search Results ({searchResults.length})</h6>
                        <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {searchResults.map((author) => (
                                <ListGroup.Item
                                    key={author.authorId}
                                    action
                                    onClick={() => handleSelectAuthor(author)}
                                    className="d-flex justify-content-between align-items-start"
                                >
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{author.fullName}</div>
                                        <small className="text-muted">ID: {author.authorId}</small>
                                        {author.description && (
                                            <div className="mt-1">
                                                <small className="text-muted">
                                                    {author.description.length > 100
                                                        ? author.description.substring(0, 100) + '...'
                                                        : author.description}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    <Badge bg="primary" className="ms-2">Select</Badge>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                )}

                {searchTerm.trim() && searchResults.length === 0 && !selectedAuthor && (
                    <div className="alert alert-info mb-4">
                        No authors found for "{searchTerm}"
                    </div>
                )}

                {selectedAuthor && (
                    <div className="border rounded p-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Author Details</h6>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                    setSelectedAuthor(null);
                                    setIsEditing(false);
                                }}
                            >
                                ← Back to search
                            </Button>
                        </div>

                        {!isEditing ? (
                            <>
                                <div className="mb-2">
                                    <strong>ID:</strong> <Badge bg="secondary">{selectedAuthor.authorId}</Badge>
                                </div>
                                <div className="mb-2">
                                    <strong>Name:</strong> {selectedAuthor.fullName}
                                </div>
                                <div className="mb-3">
                                    <strong>Description:</strong>
                                    <p className="mb-0 mt-1 text-muted">
                                        {selectedAuthor.description || 'No description'}
                                    </p>
                                </div>
                                <Button variant="warning" onClick={handleEditClick}>
                                    ✏️ Edit Author
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="mb-2">
                                    <strong>ID:</strong> <Badge bg="secondary">{selectedAuthor.authorId}</Badge>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label>Author Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        isInvalid={!!validationErrors.fullName}
                                        placeholder="Enter author's full name"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.fullName}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Maximum 255 characters
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        isInvalid={!!validationErrors.description}
                                        placeholder="Enter author description (optional)"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.description}
                                    </Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Maximum 2000 characters ({formData.description.length}/2000)
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="success"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" /> Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditAuthorModal;