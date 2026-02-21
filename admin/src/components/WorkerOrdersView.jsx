import React, { useState, useEffect, useRef } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useReferences } from '../contexts/AdminReferenceContext';
import { useToast } from '../components/ToastSystem';

const WorkerOrdersView = ({ pickUpPoint }) => {
    const { orders, loading, pagination, fetchOrders, fetchOrderDetails, updateOrderStatus, updateOrderItemStatus } = useOrders();
    const { orderStatuses, itemStatuses, formatOrderStatus, formatItemStatus, isReady } = useReferences();
    const { showToast } = useToast();

    const [filters, setFilters] = useState({
        orderId: '',
        email: '',
        status: '',
        sortDirection: 'desc',
        page: 0
    });
    const [searchInput, setSearchInput] = useState({
        orderId: '',
        email: ''
    });

    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [orderDetails, setOrderDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(new Set());

    const [openDropdown, setOpenDropdown] = useState(null);
    const [openItemDropdown, setOpenItemDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const itemDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
            if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
                setOpenItemDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isReady) return;

        fetchOrders({
            ...filters
        });
    }, [filters, isReady]);

    const loadOrderDetails = async (orderId) => {
        setLoadingDetails(prev => new Set([...prev, orderId]));
        try {
            const result = await fetchOrderDetails(orderId);
            if (result.success) {
                setOrderDetails(prev => ({ ...prev, [orderId]: result.data }));
            } else {
                showToast('Failed to load order details', 'error');
            }
        } catch (err) {
            showToast('Failed to load order details', 'error');
            console.error(err);
        } finally {
            setLoadingDetails(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(orderId)) {
                newExpanded.delete(orderId);
            } else {
                newExpanded.add(orderId);
                if (!orderDetails[orderId] && !loadingDetails.has(orderId)) {
                    loadOrderDetails(orderId);
                }
            }
            return newExpanded;
        });
    };

    const toggleDropdown = (orderId) => {
        setOpenDropdown(openDropdown === orderId ? null : orderId);
    };

    const toggleItemDropdown = (orderItemId) => {
        setOpenItemDropdown(openItemDropdown === orderItemId ? null : orderItemId);
    };

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            orderId: searchInput.orderId || '',
            email: searchInput.email || '',
            page: 0
        }));
    };

    const handleClearSearch = () => {
        setSearchInput({ orderId: '', email: '' });
        setFilters(prev => ({
            ...prev,
            orderId: '',
            email: '',
            page: 0
        }));
    };

    const handleStatusFilter = (status) => {
        setFilters(prev => ({
            ...prev,
            status: status === prev.status ? '' : status,
            page: 0
        }));
    };

    const handleSortToggle = () => {
        setFilters(prev => ({
            ...prev,
            sortDirection: prev.sortDirection === 'desc' ? 'asc' : 'desc',
            page: 0
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleStatusUpdate = async (orderId, currentStatus, newStatus) => {
        console.log('handleStatusUpdate called:', { orderId, currentStatus, newStatus });

        setOpenDropdown(null);

        // Check if order is already cancelled
        const cancelledStatuses = ['CANCELLED', 'CANCELLED_BY_USER_PAID', 'CANCELLED_BY_USER_UNPAID',
            'CANCELLED_BY_DEADLINE_PAID', 'CANCELLED_BY_DEADLINE_UNPAID'];
        if (cancelledStatuses.includes(currentStatus)) {
            showToast('Cannot change status of cancelled order', 'error');
            return;
        }

        if (currentStatus === newStatus) {
            showToast('Status is already ' + formatOrderStatus(newStatus), 'info');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to change order #${orderId} status from ${formatOrderStatus(currentStatus)} to ${formatOrderStatus(newStatus)}?`
        );

        if (!confirmed) return;

        console.log('Calling updateOrderStatus...');
        const result = await updateOrderStatus(orderId, newStatus);
        console.log('updateOrderStatus result:', result);

        if (result.success) {
            showToast(`Order #${orderId} status updated to ${formatOrderStatus(newStatus)}`, 'success');
            await fetchOrders({
                ...filters
            });
            if (expandedOrders.has(orderId)) {
                setOrderDetails(prev => {
                    const newDetails = { ...prev };
                    delete newDetails[orderId];
                    return newDetails;
                });
                loadOrderDetails(orderId);
            }
        } else {
            showToast(`Failed to update order status: ${result.error}`, 'error');
        }
    };

    const handleItemStatusUpdate = async (orderId, orderItemId, currentStatus, newStatus, orderStatus) => {
        console.log('handleItemStatusUpdate called:', { orderItemId, currentStatus, newStatus });
        setOpenItemDropdown(null);
        if (orderStatus === 'CANCELLED') {
            showToast('Cannot change status of items in cancelled order', 'error');
            return;
        }
        if (currentStatus === newStatus) {
            showToast('Item status is already ' + formatItemStatus(newStatus), 'info');
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to change item #${orderItemId} status from ${formatItemStatus(currentStatus)} to ${formatItemStatus(newStatus)}?`
        );

        if (!confirmed) return;
        console.log('Calling updateOrderItemStatus...');
        const result = await updateOrderItemStatus(orderItemId, newStatus);
        console.log('updateOrderItemStatus result:', result);

        if (result.success) {
            showToast(`Order item #${orderItemId} status updated to ${formatItemStatus(newStatus)}`, 'success');
            setOrderDetails(prev => {
                const newDetails = { ...prev };
                delete newDetails[orderId];
                return newDetails;
            });
            loadOrderDetails(orderId);
        } else {
            showToast(`Failed to update item status: ${result.error}`, 'error');
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'CREATED': 'bg-secondary',
            'PAID': 'bg-info',
            'PROCESSING': 'bg-primary',
            'READY_FOR_PICKUP': 'bg-warning text-dark',
            'READY_FOR_PICKUP_UNPAID': 'bg-warning text-dark',
            'PICKED_UP': 'bg-success',
            'COMPLETED': 'bg-success',
            'DELIVERED': 'bg-success',
            'DELIVERED_AND_PAID': 'bg-success',
            'CANCELLED': 'bg-danger',
            'CANCELLED_BY_USER_PAID': 'bg-danger',
            'CANCELLED_BY_USER_UNPAID': 'bg-danger',
            'CANCELLED_BY_DEADLINE_PAID': 'bg-danger',
            'CANCELLED_BY_DEADLINE_UNPAID': 'bg-danger',
            'REFUNDED': 'bg-danger',
            'RETURNED': 'bg-secondary'
        };
        return statusMap[status] || 'bg-secondary';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isCancelledStatus = (status) => {
        const cancelledStatuses = ['CANCELLED', 'CANCELLED_BY_USER_PAID', 'CANCELLED_BY_USER_UNPAID',
            'CANCELLED_BY_DEADLINE_PAID', 'CANCELLED_BY_DEADLINE_UNPAID'];
        return cancelledStatuses.includes(status);
    };

    const renderOrderDetails = (orderId) => {
        const isLoading = loadingDetails.has(orderId);
        const details = orderDetails[orderId];

        if (isLoading) {
            return (
                <tr>
                    <td colSpan="12" className="text-center p-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <span className="ms-2 text-muted">Loading order details...</span>
                    </td>
                </tr>
            );
        }

        if (!details || !details.items || details.items.length === 0) {
            return (
                <tr>
                    <td colSpan="12" className="text-center p-4 text-muted">
                        No items found
                    </td>
                </tr>
            );
        }

        return (
            <tr>
                <td colSpan="12" className="p-0">
                    <div className="bg-light p-4">
                        <h6 className="mb-3">Order Items</h6>
                        <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0 bg-white">
                                <thead className="table-secondary">
                                <tr>
                                    <th style={{ width: '80px' }}>Image</th>
                                    <th>Book ID</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Type</th>
                                    <th>Rental Days</th>
                                    <th>Rental Start</th>
                                    <th>Rental End</th>
                                    <th>Item Status</th>
                                    <th style={{ width: '150px' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {details.items.map(item => (
                                    <tr key={item.orderItemId}>
                                        <td>
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.bookTitle}
                                                    style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                                                    className="rounded"
                                                />
                                            ) : (
                                                <div
                                                    className="bg-secondary d-flex align-items-center justify-content-center rounded"
                                                    style={{ width: '50px', height: '75px' }}
                                                >
                                                    <small className="text-white">No img</small>
                                                </div>
                                            )}
                                        </td>
                                        <td><strong>#{item.bookId}</strong></td>
                                        <td>
                                            <strong>{item.bookTitle}</strong>
                                        </td>
                                        <td>
                                            <small className="text-muted">{item.authorFullName}</small>
                                        </td>
                                        <td>
                                                <span className={`badge ${item.type === 'RENT' ? 'bg-info' : 'bg-success'}`}>
                                                    {item.type}
                                                </span>
                                        </td>
                                        <td className="text-center">
                                            {item.rentalDays ? (
                                                <span className="badge bg-primary">{item.rentalDays} days</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <small>{formatDate(item.rentalStartAt)}</small>
                                        </td>
                                        <td>
                                            <small>{formatDate(item.rentalEndAt)}</small>
                                        </td>
                                        <td>
                                                <span className={`badge ${getItemStatusBadge(item.itemStatus)}`}>
                                                    {formatItemStatus(item.itemStatus)}
                                                </span>
                                        </td>
                                        <td>
                                            <div className="position-relative" ref={openItemDropdown === item.orderItemId ? itemDropdownRef : null}>
                                                <button
                                                    className={`btn btn-sm ${details.status === 'CANCELLED' ? 'btn-outline-secondary' : 'btn-primary'}`}
                                                    onClick={() => details.status === 'CANCELLED' ? handleItemStatusUpdate(details.orderId, item.orderItemId, item.itemStatus, null, details.status) : toggleItemDropdown(item.orderItemId)}
                                                    type="button"
                                                >
                                                    Change Status ▾
                                                </button>
                                                {openItemDropdown === item.orderItemId && details.status !== 'CANCELLED' && (
                                                    <div
                                                        className="position-absolute bg-white border rounded shadow-sm"
                                                        style={{
                                                            top: '100%',
                                                            right: 0,
                                                            zIndex: 1000,
                                                            minWidth: '180px',
                                                            maxHeight: '300px',
                                                            overflowY: 'auto'
                                                        }}
                                                    >
                                                        <ul className="list-unstyled mb-0">
                                                            {itemStatuses.map(status => (
                                                                <li key={status}>
                                                                    <button
                                                                        className={`dropdown-item w-100 text-start px-3 py-2 border-0 ${item.itemStatus === status ? 'active bg-primary text-white' : 'bg-white'}`}
                                                                        onClick={() => handleItemStatusUpdate(details.orderId, item.orderItemId, item.itemStatus, status, details.status)}
                                                                        disabled={item.itemStatus === status}
                                                                        style={{
                                                                            cursor: item.itemStatus === status ? 'default' : 'pointer',
                                                                            transition: 'background-color 0.15s ease-in-out'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (item.itemStatus !== status) {
                                                                                e.target.style.backgroundColor = '#f8f9fa';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (item.itemStatus !== status) {
                                                                                e.target.style.backgroundColor = 'white';
                                                                            }
                                                                        }}
                                                                    >
                                                                        {formatItemStatus(status)}
                                                                        {item.itemStatus === status && ' ✓'}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    const getItemStatusBadge = (status) => {
        const statusMap = {
            'PENDING': 'bg-warning text-dark',
            'DELIVERED': 'bg-success',
            'RENTED': 'bg-info',
            'RETURNED': 'bg-secondary',
            'OVERDUE': 'bg-danger',
            'CANCELLED': 'bg-secondary'
        };
        return statusMap[status] || 'bg-secondary';
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <li key={i} className={`page-item ${i === pagination.currentPage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>
                        {i + 1}
                    </button>
                </li>
            );
        }

        return (
            <nav>
                <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${pagination.currentPage === 0 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(0)}>
                            «
                        </button>
                    </li>
                    <li className={`page-item ${pagination.currentPage === 0 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                            ‹
                        </button>
                    </li>
                    {pages}
                    <li className={`page-item ${pagination.currentPage >= pagination.totalPages - 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                            ›
                        </button>
                    </li>
                    <li className={`page-item ${pagination.currentPage >= pagination.totalPages - 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(pagination.totalPages - 1)}>
                            »
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    if (!isReady) {
        return (
            <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading references...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {pickUpPoint && (
                <div className="alert alert-info mb-3">
                    <div className="d-flex align-items-center">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        <div>
                            <strong>Your Pickup Point:</strong> {pickUpPoint.name}
                            <br />
                            <small className="text-muted">{pickUpPoint.address}</small>
                        </div>
                    </div>
                </div>
            )}

            <div className="card mb-3">
                <div className="card-header">
                    <h6 className="mb-0">Search & Filters</h6>
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <label className="form-label">Order ID</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by order ID..."
                                value={searchInput.orderId}
                                onChange={(e) => setSearchInput(prev => ({ ...prev, orderId: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Email</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by email..."
                                value={searchInput.email}
                                onChange={(e) => setSearchInput(prev => ({ ...prev, email: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button className="btn btn-primary me-2" onClick={handleSearch}>
                                Search
                            </button>
                            <button className="btn btn-outline-secondary" onClick={handleClearSearch}>
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Filter by Status:</label>
                        <div className="d-flex flex-wrap gap-2">
                            {orderStatuses.map(status => (
                                <button
                                    key={status}
                                    className={`btn btn-sm ${filters.status === status ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => handleStatusFilter(status)}
                                >
                                    {formatOrderStatus(status)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Sort by Date:</label>
                        <button className="btn btn-sm btn-outline-secondary" onClick={handleSortToggle}>
                            {filters.sortDirection === 'desc' ? '↓ Newest First' : '↑ Oldest First'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        📦 Orders
                    </h5>
                    <span className="badge bg-secondary">
                        {pagination.totalElements} total
                    </span>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <p>No orders found</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th style={{ width: '30px' }}></th>
                                    <th>Order ID</th>
                                    <th>User ID</th>
                                    <th>Email</th>
                                    <th>Pickup Point</th>
                                    <th>Items</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Paid At</th>
                                    <th>Delivered At</th>
                                    <th>Refunded At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map(order => (
                                    <React.Fragment key={order.orderId}>
                                        <tr style={{ backgroundColor: isCancelledStatus(order.status) ? '#f8f9fa' : 'transparent' }}>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-link p-0 text-decoration-none"
                                                    onClick={() => toggleOrderExpansion(order.orderId)}
                                                    title={expandedOrders.has(order.orderId) ? 'Hide details' : 'Show details'}
                                                    style={{ fontSize: '1.2rem' }}
                                                >
                                                    {expandedOrders.has(order.orderId) ? '▼' : '▶'}
                                                </button>
                                            </td>
                                            <td>
                                                <strong className="text-primary">#{order.orderId}</strong>
                                            </td>
                                            <td>
                                                <small className="text-muted">#{order.userId}</small>
                                            </td>
                                            <td>
                                                <small>{order.email}</small>
                                            </td>
                                            <td>
                                                {order.pickUpPoint ? (
                                                    <div>
                                                        <div><strong>{order.pickUpPoint.name}</strong></div>
                                                        <small className="text-muted">{order.pickUpPoint.address}</small>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge bg-info">{order.itemCount} items</span>
                                            </td>
                                            <td>
                                                <strong className="text-success">${order.totalPrice?.toFixed(2)}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                    {formatOrderStatus(order.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <small>{formatDate(order.createdAt)}</small>
                                            </td>
                                            <td>
                                                <small className={order.paidAt ? 'text-success' : 'text-muted'}>
                                                    {formatDate(order.paidAt)}
                                                </small>
                                            </td>
                                            <td>
                                                <small className={order.deliveredAt ? 'text-success' : 'text-muted'}>
                                                    {formatDate(order.deliveredAt)}
                                                </small>
                                            </td>
                                            <td>
                                                <small className={order.refundedAt ? 'text-info' : 'text-muted'}>
                                                    {formatDate(order.refundedAt)}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="position-relative" ref={openDropdown === order.orderId ? dropdownRef : null}>
                                                    <button
                                                        className={`btn btn-sm ${isCancelledStatus(order.status) ? 'btn-outline-secondary' : 'btn-primary'}`}
                                                        onClick={() => isCancelledStatus(order.status) ? handleStatusUpdate(order.orderId, order.status, null) : toggleDropdown(order.orderId)}
                                                        type="button"
                                                    >
                                                        Change Status ▾
                                                    </button>
                                                    {openDropdown === order.orderId && !isCancelledStatus(order.status) && (
                                                        <div
                                                            className="position-absolute bg-white border rounded shadow-sm"
                                                            style={{
                                                                top: '100%',
                                                                right: 0,
                                                                zIndex: 1000,
                                                                minWidth: '220px',
                                                                maxHeight: '300px',
                                                                overflowY: 'auto'
                                                            }}
                                                        >
                                                            <ul className="list-unstyled mb-0">
                                                                {orderStatuses.map(status => (
                                                                    <li key={status}>
                                                                        <button
                                                                            className={`dropdown-item w-100 text-start px-3 py-2 border-0 ${order.status === status ? 'active bg-primary text-white' : 'bg-white'}`}
                                                                            onClick={() => handleStatusUpdate(order.orderId, order.status, status)}
                                                                            disabled={order.status === status}
                                                                            style={{
                                                                                cursor: order.status === status ? 'default' : 'pointer',
                                                                                transition: 'background-color 0.15s ease-in-out'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                if (order.status !== status) {
                                                                                    e.target.style.backgroundColor = '#f8f9fa';
                                                                                }
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                if (order.status !== status) {
                                                                                    e.target.style.backgroundColor = 'white';
                                                                                }
                                                                            }}
                                                                        >
                                                                            {formatOrderStatus(status)}
                                                                            {order.status === status && ' ✓'}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOrders.has(order.orderId) && renderOrderDetails(order.orderId)}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {!loading && orders.length > 0 && (
                    <div className="card-footer">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">
                                Showing {pagination.currentPage * pagination.pageSize + 1} - {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)} of {pagination.totalElements}
                            </span>
                            {renderPagination()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerOrdersView;