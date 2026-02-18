// API Service Layer - Centralized backend communication
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const getAdminHeaders = (): HeadersInit => {
    const token = localStorage.getItem('admin_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (res: Response) => {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || data.error || 'API request failed');
    }
    return data;
};

// ========== PRODUCTS ==========
export const fetchProducts = async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
};

export const fetchProductById = async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res);
};

export const createProduct = async (product: any) => {
    const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(product)
    });
    return handleResponse(res);
};

export const updateProduct = async (id: string, product: any) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(product)
    });
    return handleResponse(res);
};

export const deleteProduct = async (id: string) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const uploadProductImage = async (file: File): Promise<{ path: string }> => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/upload/product-image`, {
        method: 'POST',
        headers,
        body: formData
    });
    const data = await handleResponse(res);
    return data.data;
};

// ========== CUSTOMERS / AUTH ==========
export const signupCustomer = async (name: string, phone: string, password: string, email?: string) => {
    const res = await fetch(`${API_BASE}/customers/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, email })
    });
    return handleResponse(res);
};

export const loginCustomer = async (phone: string, password: string) => {
    const res = await fetch(`${API_BASE}/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    });
    return handleResponse(res);
};

export const getProfile = async () => {
    const res = await fetch(`${API_BASE}/customers/profile`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const updateProfile = async (updates: any) => {
    const res = await fetch(`${API_BASE}/customers/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });
    return handleResponse(res);
};

// ========== ORDERS ==========
export const createOrder = async (orderData: any) => {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
    });
    return handleResponse(res);
};

export const fetchMyOrders = async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchOrders = async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/orders${params}`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const updateOrderStatus = async (id: string, status: any) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(status)
    });
    return handleResponse(res);
};

// ========== REVIEWS ==========
export const fetchReviews = async (productId?: string) => {
    const params = productId ? `?productId=${productId}` : '';
    const res = await fetch(`${API_BASE}/reviews${params}`);
    return handleResponse(res);
};

export const submitReview = async (review: {
    customerName: string;
    rating: number;
    comment: string;
    type?: string;
    productId?: string;
    productName?: string;
    reviewImage?: File | null;
}) => {
    const { reviewImage, ...rest } = review;
    if (reviewImage) {
        const formData = new FormData();
        Object.entries(rest).forEach(([k, v]) => { if (v !== undefined) formData.append(k, String(v)); });
        formData.append('reviewImage', reviewImage);
        const res = await fetch(`${API_BASE}/reviews`, { method: 'POST', body: formData });
        return handleResponse(res);
    }
    const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest)
    });
    return handleResponse(res);
};

export const fetchAllReviews = async () => {
    const res = await fetch(`${API_BASE}/reviews/all`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const deleteReview = async (id: string) => {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const approveReview = async (id: string) => {
    const res = await fetch(`${API_BASE}/reviews/${id}/approve`, {
        method: 'PUT',
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== PAYMENTS ==========
export const createPayment = async (paymentData: any) => {
    const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData)
    });
    return handleResponse(res);
};

export const fetchPayments = async () => {
    const res = await fetch(`${API_BASE}/payments`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== ADMIN ==========
export const adminLogin = async (password: string) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    return handleResponse(res);
};

export const adminGetStats = async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const adminGetReviewSummary = async () => {
    const res = await fetch(`${API_BASE}/admin/reviews/summary`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const adminGetReviewsGrouped = async () => {
    const res = await fetch(`${API_BASE}/admin/reviews/grouped`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== ADMIN CUSTOMERS ==========
export const adminGetCustomers = async () => {
    const res = await fetch(`${API_BASE}/customers`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== RAZORPAY PAYMENT ==========
export const createRazorpayOrder = async (amount: number) => {
    const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });
    return handleResponse(res);
};

export const verifyRazorpayPayment = async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderData: any;
}) => {
    const res = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// ========== REVIEW STATS ==========
export const fetchReviewStats = async (productId: string) => {
    const res = await fetch(`${API_BASE}/reviews/stats/${productId}`);
    return handleResponse(res);
};


export const fetchCart = async () => {
    const res = await fetch(`${API_BASE}/cart`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const syncCartAPI = async (items: any[]) => {
    const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items })
    });
    return handleResponse(res);
};

export const clearCartAPI = async () => {
    const res = await fetch(`${API_BASE}/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

// ========== WISHLIST (user-scoped) ==========
export const fetchWishlistAPI = async () => {
    const res = await fetch(`${API_BASE}/wishlist`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const addToWishlistAPI = async (productId: string) => {
    const res = await fetch(`${API_BASE}/wishlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId })
    });
    return handleResponse(res);
};

export const removeFromWishlistAPI = async (productId: string) => {
    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const syncWishlistAPI = async (productIds: string[]) => {
    const res = await fetch(`${API_BASE}/wishlist`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productIds })
    });
    return handleResponse(res);
};

// ========== CHAT ==========
export const sendChatMessage = async (message: string) => {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    return handleResponse(res);
};
