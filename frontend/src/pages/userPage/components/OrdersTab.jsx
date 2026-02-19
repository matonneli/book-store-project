import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastSystem';
import { useNavigate } from 'react-router-dom';
import OrderItemList from './OrderItemList';
import CancelOrderModal from './CancelOrderModal';

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

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancellingOrder, setCancellingOrder] = useState(false);

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

    // --- ДОБАВЛЕНО: Автоматическое обновление при возврате на вкладку ---
    useEffect(() => {
        const handleFocus = () => {
            if (authToken) {
                fetchUserOrders(0, false);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [authToken, fetchUserOrders]);

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
            'CREATED': { color: 'bg-yellow-100 text-yellow-800', text: 'Created' },
            'PAID': { color: 'bg-orange-100 text-orange-800', text: 'Paid' },
            'READY_FOR_PICKUP': { color: 'bg-blue-100 text-blue-800', text: 'Ready for Pickup' },
            'READY_FOR_PICKUP_UNPAID': { color: 'bg-purple-100 text-purple-800', text: 'Ready (Unpaid)' },
            'DELIVERED': { color: 'bg-green-100 text-green-800', text: 'Delivered' },
            'RETURNED': { color: 'bg-gray-100 text-gray-800', text: 'Returned' },
            'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
            'CANCELLED_BY_USER_PAID': { color: 'bg-red-100 text-red-800', text: 'Cancelled (Paid)' },
            'CANCELLED_BY_USER_UNPAID': { color: 'bg-red-100 text-red-800', text: 'Cancelled (Unpaid)' },
            'CANCELLED_BY_DEADLINE_PAID': { color: 'bg-red-100 text-red-800', text: 'Cancelled (Deadline - Paid)' },
            'CANCELLED_BY_DEADLINE_UNPAID': { color: 'bg-red-100 text-red-800', text: 'Cancelled (Deadline - Unpaid)' }
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

        return (
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (!price) return '0.00';
        return parseFloat(price).toFixed(2);
    };

    // --- ИСПРАВЛЕНО: Более строгая проверка на рефанд ---
    const isRefundEligible = (order) => {
        const eligibleStatuses = ['CANCELLED', 'CANCELLED_BY_USER_PAID', 'CANCELLED_BY_DEADLINE_PAID'];
        const hasBeenRefunded = order.refundedAt !== null && order.refundedAt !== undefined;
        return eligibleStatuses.includes(order.status) && order.paidAt && !hasBeenRefunded;
    };

    const canCancelOrder = (order) => {
        const cancellableStatuses = ['CREATED', 'PAID', 'READY_FOR_PICKUP', 'READY_FOR_PICKUP_UNPAID'];
        return cancellableStatuses.includes(order.status);
    };

    const openCancelModal = (order) => {
        setOrderToCancel(order);
        setCancelModalOpen(true);
    };

    const closeCancelModal = () => {
        if (!cancellingOrder) {
            setCancelModalOpen(false);
            setOrderToCancel(null);
        }
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;
        setCancellingOrder(true);
        try {
            const response = await fetch(`/api/orders/${orderToCancel.orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to cancel order');
            }
            info('Order cancelled successfully!');
            closeCancelModal();
            fetchUserOrders(0, false);
        } catch (err) {
            console.error('Failed to cancel order:', err);
            info(err.message || 'Failed to cancel order');
        } finally {
            setCancellingOrder(false);
        }
    };

    // --- ИСПРАВЛЕНО: Открытие в новой вкладке (без параметров размера) ---
    const handleRequestRefund = (orderId) => {
        // Убрали window.resize и specs, теперь откроется просто как новая вкладка браузера
        window.open(`/refund-mock?orderId=${orderId}`, '_blank');
    };

    const renderPickupPointInfo = (pickUpPoint) => {
        if (!pickUpPoint) return <span className="font-medium text-gray-500">Not specified</span>;
        return (
            <div className="relative group inline-block">
                <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-lg">📍</span>
                    <span className="font-medium text-[#321d4f] hover:text-[#4a2870] transition-colors">
                        {pickUpPoint.name}
                    </span>
                </div>
                <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 min-w-max max-w-xs">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5">🏢</span>
                            <div>
                                <p className="text-[#321d4f] font-semibold text-sm">{pickUpPoint.name}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{pickUpPoint.address}</p>
                            </div>
                        </div>
                        {pickUpPoint.contactPhone && (
                            <div className="flex items-center gap-3">
                                <span className="text-lg">📞</span>
                                <p className="text-[#321d4f] font-medium text-sm">
                                    {pickUpPoint.contactPhone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto"><p className="text-center text-lg">Loading your orders...</p></div>;
    if (error) return <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto"><p className="text-center text-red-600 text-lg">{error}</p></div>;

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>Order History</h2>
                    {totalElements > 0 && <p className="text-gray-600 mt-2">Total: {totalElements} order{totalElements !== 1 ? 's' : ''}</p>}
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12"><p className="text-lg text-gray-600 mb-4">You haven't placed any orders yet.</p></div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <div key={order.orderId} ref={index === orders.length - 1 ? lastOrderElementRef : null} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-xl font-semibold text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>Order #{order.orderId}</h3>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <span>{order.itemCount} items</span>
                                            <span>•</span>
                                            <span className="font-semibold text-[#321d4f]">{formatPrice(order.totalPrice)} zł</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleOrderExpansion(order.orderId)} className="px-4 py-2 text-sm bg-[#ffbdb1] text-gray-800 rounded-full hover:bg-[#ff9c8b] transition font-medium">
                                            {expandedOrders.has(order.orderId) ? 'Hide Details' : 'View Details'}
                                        </button>
                                        {canCancelOrder(order) && (
                                            <button onClick={() => openCancelModal(order)} className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition font-medium">❌ Cancel Order</button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Information</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-600">Created:</span><span className="font-medium">{formatDateTime(order.createdAt)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-600">Payment:</span><span className="font-medium">{order.paidAt ? `Paid ${formatDateTime(order.paidAt)}` : 'Cash on Pickup'}</span></div>
                                            {order.deliveredAt && <div className="flex justify-between"><span className="text-gray-600">Delivered:</span><span className="font-medium text-green-600">{formatDateTime(order.deliveredAt)}</span></div>}
                                            {order.refundedAt && <div className="flex justify-between"><span className="text-gray-600">Refunded:</span><span className="font-medium text-blue-600">✓ {formatDateTime(order.refundedAt)}</span></div>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pickup Information</h4>
                                        <div className="text-sm"><div className="flex flex-col space-y-1"><span className="text-gray-600">Location:</span><div className="font-medium">{renderPickupPointInfo(order.pickUpPoint)}</div></div></div>
                                    </div>
                                </div>

                                {/* --- ИСПРАВЛЕНО: Секция Refund с проверкой --- */}
                                {isRefundEligible(order) ? (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-yellow-600 text-lg">⚠️</span>
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-800">Refund Available</p>
                                                    <p className="text-xs text-yellow-700">Your payment of {formatPrice(order.totalPrice)} zł can be refunded</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRequestRefund(order.orderId)}
                                                className="px-4 py-2 text-sm bg-[#321d4f] text-white rounded-full hover:bg-[#4a2870] transition font-medium whitespace-nowrap"
                                            >
                                                💰 Request Refund
                                            </button>
                                        </div>
                                    </div>
                                ) : order.refundedAt ? (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 text-lg">✓</span>
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Refund Processed</p>
                                                <p className="text-xs text-blue-700">The amount was returned to your account on {formatDateTime(order.refundedAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {expandedOrders.has(order.orderId) && (
                                    <OrderItemList
                                        orderId={order.orderId}
                                        orderDetails={orderDetails[order.orderId]}
                                        loadingDetails={loadingDetails.has(order.orderId)}
                                        onBookClick={navigate}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CancelOrderModal
                isOpen={cancelModalOpen}
                order={orderToCancel}
                onConfirm={handleCancelOrder}
                onCancel={closeCancelModal}
                isLoading={cancellingOrder}
            />
        </>
    );
}

export default OrdersTab;