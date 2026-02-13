import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastSystem';
import { useNavigate } from 'react-router-dom';
import OrderItemList from './OrderItemList';

function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const [totalElements, setTotalElements] = useState(0);

    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [orderDetails, setOrderDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(new Set());

    const { authToken } = useAuth();
    const { info } = useToast();
    const navigate = useNavigate();
    const observerRef = useRef(null);

    const fetchUserOrders = useCallback(async (page = 0, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await fetch(`/api/orders/my-orders?page=${page}&size=5`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();

            if (append) {
                setOrders(prev => [...prev, ...data.content]);
            } else {
                setOrders(data.content);
            }

            setCurrentPage(data.pageable.pageNumber);
            setHasNext(!data.last);
            setTotalElements(data.totalElements);

        } catch (err) {
            setError('Failed to load orders');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [authToken]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasNext) {
            fetchUserOrders(currentPage + 1, true);
        }
    }, [loadingMore, hasNext, currentPage, fetchUserOrders]);

    const lastOrderElementRef = useCallback((node) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNext && !loadingMore) {
                loadMore();
            }
        }, {
            threshold: 0.1
        });

        if (node) observerRef.current.observe(node);
    }, [loadingMore, hasNext, loadMore]);

    useEffect(() => {
        if (authToken) {
            fetchUserOrders();
        }
    }, [authToken, fetchUserOrders]);

    const loadOrderDetails = useCallback(async (orderId) => {
        setLoadingDetails(prev => new Set([...prev, orderId]));
        try {
            const response = await fetch(`/api/orders/${orderId}/details`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();
            setOrderDetails(prev => ({ ...prev, [orderId]: data }));
        } catch (err) {
            info('Failed to load order details');
            console.error(err);
        } finally {
            setLoadingDetails(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, [authToken, info]);

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

    const getStatusBadge = (status) => {
        const statusConfig = {
            'CREATED': {
                color: 'bg-yellow-100 text-yellow-800',
                text: 'Created'
            },
            'PAID': {
                color: 'bg-orange-100 text-orange-800',
                text: 'Paid'
            },
            'READY_FOR_PICKUP': {
                color: 'bg-blue-100 text-blue-800',
                text: 'Ready for Pickup'
            },
            'READY_FOR_PICKUP_UNPAID': {
                color: 'bg-purple-100 text-purple-800',
                text: 'Ready (Unpaid)'
            },
            'DELIVERED': {
                color: 'bg-green-100 text-green-800',
                text: 'Delivered'
            },
            'RETURNED': {
                color: 'bg-gray-100 text-gray-800',
                text: 'Returned'
            },
            'CANCELLED': {
                color: 'bg-red-100 text-red-800',
                text: 'Cancelled'
            }
        };

        const config = statusConfig[status] || {
            color: 'bg-gray-100 text-gray-800',
            text: status
        };

        return (
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (!price) return '0.00';
        return parseFloat(price).toFixed(2);
    };

    const renderPickupPointInfo = (pickUpPoint) => {
        if (!pickUpPoint) {
            return (
                <span
                    className="font-medium text-gray-500"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    Not specified
                </span>
            );
        }

        return (
            <div className="relative group inline-block">
                <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-lg">📍</span>
                    <span
                        className="font-medium text-[#321d4f] hover:text-[#4a2870] transition-colors"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        {pickUpPoint.name}
                    </span>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 min-w-max max-w-xs">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5">🏢</span>
                            <div>
                                <p className="text-[#321d4f] font-semibold text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {pickUpPoint.name}
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                    {pickUpPoint.address}
                                </p>
                            </div>
                        </div>

                        {pickUpPoint.contactPhone && (
                            <div className="flex items-center gap-3">
                                <span className="text-lg">📞</span>
                                <p className="text-[#321d4f] font-medium text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                    {pickUpPoint.contactPhone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}
                                </p>
                            </div>
                        )}

                        {pickUpPoint.workingHours && (
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🕒</span>
                                <p className="text-[#321d4f] font-medium text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                    {pickUpPoint.workingHours}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <p className="text-center text-lg">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <p className="text-center text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2
                        className="text-3xl font-semibold text-[#321d4f]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Order History
                    </h2>
                    {totalElements > 0 && (
                        <p
                            className="text-gray-600 mt-2"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Total: {totalElements} order{totalElements !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p
                            className="text-lg text-gray-600 mb-4"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            You haven't placed any orders yet.
                        </p>
                        <p
                            className="text-sm text-gray-500"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Start shopping and your order history will appear here!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <div
                                key={order.orderId}
                                ref={index === orders.length - 1 ? lastOrderElementRef : null}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3
                                                className="text-xl font-semibold text-[#321d4f]"
                                                style={{ fontFamily: "'Poppins', sans-serif" }}
                                            >
                                                Order #{order.orderId}
                                            </h3>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                                            </span>
                                            <span>•</span>
                                            <span
                                                className="font-semibold text-[#321d4f]"
                                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                            >
                                                {formatPrice(order.totalPrice)} zł
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleOrderExpansion(order.orderId)}
                                        className="px-4 py-2 text-sm bg-[#ffbdb1] text-gray-800 rounded-full hover:bg-[#ff9c8b] transition font-medium"
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    >
                                        {expandedOrders.has(order.orderId) ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4
                                            className="text-sm font-medium text-gray-700 mb-2"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            Order Information
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Created:</span>
                                                <span
                                                    className="font-medium"
                                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                >
                                                    {formatDateTime(order.createdAt)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment:</span>
                                                <span
                                                    className="font-medium"
                                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                >
                                                    {order.paidAt
                                                        ? `Paid ${formatDateTime(order.paidAt)}`
                                                        : 'Cash on Delivery'}
                                                </span>
                                            </div>

                                            {order.deliveredAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Delivered:</span>
                                                    <span
                                                        className="font-medium text-green-600"
                                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                    >
                                                        {formatDateTime(order.deliveredAt)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4
                                            className="text-sm font-medium text-gray-700 mb-2"
                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            Pickup Information
                                        </h4>
                                        <div className="text-sm">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-gray-600">Location:</span>
                                                <div className="font-medium text-sm leading-relaxed">
                                                    {renderPickupPointInfo(order.pickUpPoint)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {expandedOrders.has(order.orderId) && (
                                    <OrderItemList
                                        orderId={order.orderId}
                                        orderDetails={orderDetails[order.orderId]}
                                        loadingDetails={loadingDetails.has(order.orderId)}
                                        onBookClick={navigate}
                                    />
                                )}

                                <div className="border-t pt-3 text-xs text-gray-500 text-center mt-4">
                                    <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        Order placed on {formatDateTime(order.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {loadingMore && (
                            <div className="flex justify-center items-center py-8">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        Loading more orders...
                                    </span>
                                </div>
                            </div>
                        )}

                        {!hasNext && orders.length > 0 && (
                            <div className="text-center py-8">
                                <p
                                    className="text-gray-500 text-sm"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    You've seen all your orders
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default OrdersTab;