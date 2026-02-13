import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within OrderProvider');
    }
    return context;
};

export const OrderProvider = ({ children }) => {
    const { updateLastActivity } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });

    const fetchOrders = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filters.orderId) params.append('orderId', filters.orderId);
            if (filters.email) params.append('email', filters.email);
            if (filters.status) params.append('status', filters.status);
            if (filters.pickupPointId) params.append('pickupPointId', filters.pickupPointId);

            params.append('page', filters.page || 0);
            params.append('size', filters.size || 20);
            params.append('sortDirection', filters.sortDirection || 'desc');

            const response = await fetch(
                `http://localhost:8081/api/admin/orders?${params.toString()}`,
                { credentials: 'include' }
            );

            if (response.ok) {
                const data = await response.json();
                setOrders(data.content || []);
                setPagination({
                    currentPage: data.number || 0,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0,
                    pageSize: data.size || 20
                });
                updateLastActivity('fetchOrders');
                return { success: true, data };
            } else {
                console.error('Failed to fetch orders:', response.status);
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [updateLastActivity]);


    const fetchOrderDetails = useCallback(async (orderId) => {
        try {
            const response = await fetch(
                `http://localhost:8081/api/admin/orders/${orderId}`,
                { credentials: 'include' }
            );

            if (response.ok) {
                const data = await response.json();
                updateLastActivity('fetchOrderDetails');
                return { success: true, data };
            } else {
                console.error('Failed to fetch order details:', response.status);
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (err) {
            console.error('Failed to fetch order details:', err);
            return { success: false, error: err.message };
        }
    }, [updateLastActivity]);


    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            const response = await fetch(
                `http://localhost:8081/api/admin/orders/${orderId}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.ok) {
                const updatedOrder = await response.json();

                setOrders(prev => prev.map(order =>
                    order.orderId === orderId ? { ...order, status: newStatus } : order
                ));

                updateLastActivity('updateOrderStatus');
                return { success: true, data: updatedOrder };
            } else {
                const errorText = await response.text();
                console.error('Failed to update order status:', response.status, errorText);
                return { success: false, error: errorText || `HTTP ${response.status}` };
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
            return { success: false, error: err.message };
        }
    }, [updateLastActivity]);


    const updateLocalOrder = useCallback((orderId, updates) => {
        setOrders(prev => prev.map(order =>
            order.orderId === orderId ? { ...order, ...updates } : order
        ));
    }, []);

    const updateOrderItemStatus = useCallback(async (orderItemId, newStatus) => {
        try {
            const response = await fetch(
                `http://localhost:8081/api/admin/orders/items/${orderItemId}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.ok) {
                updateLastActivity('updateOrderItemStatus');
                return { success: true };
            } else {
                const errorText = await response.text();
                console.error('Failed to update order item status:', response.status, errorText);
                return { success: false, error: errorText || `HTTP ${response.status}` };
            }
        } catch (err) {
            console.error('Failed to update order item status:', err);
            return { success: false, error: err.message };
        }
    }, [updateLastActivity]);

    const value = {
        orders,
        loading,
        pagination,
        fetchOrders,
        fetchOrderDetails,
        updateOrderStatus,
        updateOrderItemStatus,
        updateLocalOrder
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};