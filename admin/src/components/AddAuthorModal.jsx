// src/components/AddAuthorModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useToast } from './ToastSystem';
import { useReferences } from '../contexts/AdminReferenceContext';

const API_BASE_URL = 'http://localhost:8081';

const AddAuthorModal = ({ show, onClose, onAuthorAdded }) => {
    const toast = useToast();
    const { addAuthor } = useReferences();

    const [formData, setFormData] = useState({
        fullName: '',
        description: '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setSaving(true);
        setError(null);
        setValidationErrors({});

        try {
            const payload = {
                fullName: formData.fullName.trim(),
                description: formData.description.trim() || null,
            };

            const response = await fetch(`${API_BASE_URL}/api/admin/authors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to create author';
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

            const createdAuthor = await response.json();

            setFormData({
                fullName: '',
                description: '',
            });

            addAuthor(createdAuthor);

            if (onAuthorAdded) {
                onAuthorAdded(createdAuthor);
            }

            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setFormData({
            fullName: '',
            description: '',
        });
        setError(null);
        setValidationErrors({});
        onClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Add New Author</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Author Name *</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.fullName}
                            placeholder="Enter author's full name"
                            required
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
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" /> Creating...
                        </>
                    ) : (
                        'Create Author'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddAuthorModal;