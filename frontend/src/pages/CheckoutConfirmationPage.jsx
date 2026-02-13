import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastSystem";
import bookabeLogo from "../assets/images/bookabe-logo.jpg";

const PAYMENT_METHODS = [
    { id: "online", name: "💳 Online Payment", description: "Pay now with your card" },
    { id: "pickup", name: "💵 Pay on Pickup", description: "Pay in cash or card upon receipt" },
];

const CheckoutPage = () => {
    const [pickupPoint, setPickupPoint] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [cartData, setCartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasShownWarning, setHasShownWarning] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [pickupPoints, setPickupPoints] = useState([]);

    const navigate = useNavigate();
    const { authToken } = useAuth();
    const { warning, success, error: showError } = useToast();

    useEffect(() => {
        if (!authToken) {
            navigate('/login/user');
            return;
        }
        fetchCartContents();
        fetchPickupPoints();
    }, [authToken, navigate]);

    useEffect(() => {
        function handlePaymentMessage(event) {
            if (event.data === 'payment_success') {
                success('Payment confirmed and order placed successfully! Check orders on your page!');
                setOrderPlaced(true);
            }
        }

        window.addEventListener('message', handlePaymentMessage);
        return () => {
            window.removeEventListener('message', handlePaymentMessage);
        };
    }, [success]);

    const fetchPickupPoints = async () => {
        try {
            const response = await fetch('/api/pickup-points/active', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPickupPoints(data);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch pickup points: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching pickup points:', err);
            showError('Failed to load pickup points');
        }
    };

    const fetchCartContents = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/cart/contents', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCartData(data);

                if (!hasShownWarning) {
                    const unavailableItems = data.items?.filter(item => !item.available) || [];
                    if (unavailableItems.length > 0) {
                        warning(
                            `${unavailableItems.length} item${unavailableItems.length > 1 ? 's' : ''} ` +
                            `in your cart ${unavailableItems.length > 1 ? 'are' : 'is'} currently unavailable. ` +
                            'Please return to the cart to remove them.'
                        );
                        setHasShownWarning(true);
                    }
                }
            } else {
                throw new Error(`Failed to fetch cart contents: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching cart contents:', err);
            setError(err.message);
            showError('Failed to load cart contents');
        } finally {
            setLoading(false);
        }
    };

    const validateOrderForm = () => {
        if (!pickupPoint) {
            alert("Please select a pickup point before placing your order.");
            return false;
        }
        if (!paymentMethod) {
            alert("Please select a payment method before placing your order.");
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateOrderForm()) return;

        try {
            const response = await fetch('/api/orders/place', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pickupPointId: pickupPoint })
            });

            if (response.ok) {
                const order = await response.json();

                if (paymentMethod === "online") {
                    window.open(order.paymentUrl || `/payment-mock?orderId=${order.orderId}`, "_blank");
                } else {
                    success("Order placed successfully! You'll pay upon pickup.");
                    setOrderPlaced(true);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }
        } catch (err) {
            console.error('Error placing order:', err);
            showError('Failed to place order');
        }
    };

    const getSelectedPickupPointName = () => {
        const selectedPoint = pickupPoints.find(point => point.pickupPointId === pickupPoint);
        return selectedPoint ? selectedPoint.name : '';
    };

    const renderOrderConfirmation = () => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
                <h1 className="text-3xl font-bold text-[#321d4f] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Order Confirmed!
                </h1>
                <p className="text-gray-600 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Your order has been placed successfully. You can pick it up at {getSelectedPickupPointName()}.
                </p>
                <button
                    onClick={() => navigate("/catalog")}
                    className="bg-[#321d4f] text-white px-6 py-3 rounded-full hover:bg-[#4a2870] transition-colors font-medium"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Return to Catalog
                </button>
            </div>
        </div>
    );

    const renderLoadingState = () => (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-6 py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#321d4f]"></div>
                <p className="mt-2 text-[#4a4a4a]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Loading your cart...
                </p>
            </div>
        </div>
    );

    const renderErrorState = () => (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 py-16 text-center">
                <div className="text-red-600 p-4">
                    Error: {error}
                    <button
                        onClick={fetchCartContents}
                        className="ml-4 text-blue-600 hover:underline"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );

    if (orderPlaced) return renderOrderConfirmation();
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();

    const hasItems = cartData?.items && cartData.items.length > 0;
    const hasUnavailableItems = cartData?.items?.some(item => !item.available);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-6 py-8">
                <h1 className="text-4xl font-semibold text-[#321d4f] mb-8 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Checkout
                </h1>

                {!hasItems ? (
                    <EmptyCart />
                ) : (
                    <>
                        <CartItemsList items={cartData.items} />
                        <OrderSummary cartData={cartData} />
                        <PickupPointSelector
                            pickupPoints={pickupPoints}
                            pickupPoint={pickupPoint}
                            setPickupPoint={setPickupPoint}
                        />
                        <PaymentMethodSelector
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                        />
                        <CheckoutActions
                            hasUnavailableItems={hasUnavailableItems}
                            pickupPoint={pickupPoint}
                            paymentMethod={paymentMethod}
                            onPlaceOrder={handlePlaceOrder}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="pt-8 px-12 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
                <img
                    src={bookabeLogo}
                    alt="bookabe logo"
                    className="w-20 h-20 rounded-full object-cover"
                />
                <span className="text-[#321d4f] text-5xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    bookabe
                </span>
            </div>
        </header>
    );
};

const EmptyCart = () => {
    const navigate = useNavigate();

    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Looks like you haven't added any books to your cart yet.
            </p>
            <button
                onClick={() => navigate("/catalog")}
                className="bg-[#321d4f] text-white px-6 py-3 rounded-full hover:bg-[#4a2870] transition-colors font-medium"
                style={{ fontFamily: "'Poppins', sans-serif" }}
            >
                Start Shopping
            </button>
        </div>
    );
};

const CartItemsList = ({ items }) => (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto mb-8">
        {items.map((item) => (
            <CartItem key={item.cartItemId} item={item} />
        ))}
    </div>
);

const CartItem = ({ item }) => (
    <div className={`flex gap-4 border-b border-gray-200 pb-4 mb-4 last:border-none last:mb-0 last:pb-0 ${!item.available ? 'opacity-60 filter grayscale' : ''}`}>
        <img
            src={item.imageUrls?.[0] || "https://via.placeholder.com/120x180?text=No+Image"}
            alt={item.title}
            className="w-20 h-28 object-contain rounded-lg"
        />
        <div className="flex-1">
            {!item.available && (
                <div className="bg-red-100 text-red-600 text-center py-2 rounded-t-lg mb-2">
                    <span className="text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Currently Unavailable
                    </span>
                </div>
            )}
            <h3 className="text-lg font-semibold text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {item.title}
            </h3>
            <p className="text-sm text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                by {item.authorName}
            </p>
            <ItemType item={item} />
            <ItemPrice item={item} />
        </div>
    </div>
);

const ItemType = ({ item }) => (
    item.type === "BUY" ? (
        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Purchase
        </span>
    ) : (
        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Rent for {item.rentalDays} days
        </span>
    )
);

const ItemPrice = ({ item }) => (
    <div className="mt-2">
        {item.discountPercent > 0 ? (
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.price?.toFixed(2)} zł
                </span>
                <span className="text-sm text-gray-500 line-through" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.originalPrice?.toFixed(2)} zł
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                    -{item.discountPercent}%
                </span>
            </div>
        ) : (
            <span className="text-lg font-bold text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {item.price?.toFixed(2)} zł
            </span>
        )}
    </div>
);

const OrderSummary = ({ cartData }) => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Order Summary
        </h3>
        <div className="space-y-3">
            <SummaryRow label="Items in cart:" value={cartData?.itemsCount || 0} />
            <SummaryRow label="Available slots:" value={cartData?.remainingSlots || 0} />
            {Number(cartData?.totalDiscount) > 0 && (
                <SummaryRow
                    label="Total discount:"
                    value={`-${cartData.totalDiscount.toFixed(2)} zł`}
                    className="text-green-600"
                />
            )}
            <hr className="my-3" />
            <SummaryRow
                label="Total amount:"
                value={`${cartData?.totalAmount?.toFixed(2) || '0.00'} zł`}
                className="text-lg font-bold text-[#321d4f]"
            />
        </div>
    </div>
);

const SummaryRow = ({ label, value, className = "" }) => (
    <div className={`flex justify-between text-sm ${className}`}>
        <span className="text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {label}
        </span>
        <span className="font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {value}
        </span>
    </div>
);

const PickupPointSelector = ({ pickupPoints, pickupPoint, setPickupPoint }) => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Select Pickup Point
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pickupPoints.map((point) => (
                <SelectablePickupPoint
                    key={point.pickupPointId}
                    selected={pickupPoint === point.pickupPointId}
                    onClick={() => setPickupPoint(point.pickupPointId)}
                    point={point}
                />
            ))}
        </div>
    </div>
);

const SelectablePickupPoint = ({ selected, onClick, point }) => (
    <div className="relative group">
        <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selected
                    ? 'border-[#321d4f] bg-[#f1e9ff]'
                    : 'border-gray-200 hover:border-[#4a2870] hover:bg-gray-50'
            }`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selected ? 'bg-[#321d4f] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                    📍
                </div>
                <div>
                    <p className="text-[#321d4f] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {point.name}
                    </p>
                    <p className="text-sm text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {point.address}
                    </p>
                </div>
            </div>
        </div>

        {/* Tooltip on hover */}
        {(point.contactPhone || point.workingHours) && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-md border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 min-w-max">
                {point.contactPhone && (
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">📞</span>
                        <p className="text-[#321d4f] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {point.contactPhone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')}
                        </p>
                    </div>
                )}
                {point.workingHours && (
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🗓</span>
                        <p className="text-[#321d4f] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {point.workingHours}
                        </p>
                    </div>
                )}
            </div>
        )}
    </div>
);

const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod }) => (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-[#321d4f]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Select Payment Method
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAYMENT_METHODS.map((method) => (
                <SelectableOption
                    key={method.id}
                    selected={paymentMethod === method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    icon={method.id === "online" ? '💳' : '💵'}
                    title={method.name}
                    description={method.description}
                />
            ))}
        </div>
    </div>
);

const SelectableOption = ({ selected, onClick, icon, title, description }) => (
    <div
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
            selected
                ? 'border-[#321d4f] bg-[#f1e9ff]'
                : 'border-gray-200 hover:border-[#4a2870] hover:bg-gray-50'
        }`}
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selected ? 'bg-[#321d4f] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
                {icon}
            </div>
            <div>
                <p className="text-[#321d4f] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {title}
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {description}
                </p>
            </div>
        </div>
    </div>
);

const CheckoutActions = ({ hasUnavailableItems, pickupPoint, paymentMethod, onPlaceOrder, loading }) => {
    const navigate = useNavigate();
    const isDisabled = hasUnavailableItems || !pickupPoint || !paymentMethod || loading;

    const getTooltipText = () => {
        if (hasUnavailableItems) return 'Remove unavailable items to proceed';
        if (!pickupPoint) return 'Select a pickup point to proceed';
        if (!paymentMethod) return 'Select a payment method to proceed';
        return '';
    };

    return (
        <div className="max-w-3xl mx-auto flex gap-4">
            <button
                onClick={() => navigate("/cart")}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium"
                style={{ fontFamily: "'Poppins', sans-serif" }}
            >
                Back to Cart
            </button>
            <button
                onClick={onPlaceOrder}
                className={`flex-1 px-6 py-3 rounded-full font-medium ${
                    isDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#321d4f] text-white hover:bg-[#4a2870] transition-colors'
                }`}
                disabled={isDisabled}
                title={getTooltipText()}
                style={{ fontFamily: "'Poppins', sans-serif" }}
            >
                Place Order
            </button>
        </div>
    );
};

export default CheckoutPage;