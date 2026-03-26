// API Service Layer - Centralized backend communication
// Use relative URL so requests go through the Vite proxy (works from any device on the network)
const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');
// Exported for image URL resolution in other components (strips /api suffix)
export const BACKEND_URL = API_BASE.replace(/\/api$/, '') || '';

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

export const uploadOfferImage = async (file: File): Promise<{ path: string }> => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/upload/offer-image`, {
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

export const googleLoginCustomer = async (credential: string) => {
    const res = await fetch(`${API_BASE}/customers/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
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

export const fetchOrders = async (status?: string, paymentFilter?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (paymentFilter) params.set('paymentFilter', paymentFilter);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/orders${query}`, {
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

export const markOrderAsPaid = async (orderId: string) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/mark-paid`, {
        method: 'PUT',
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const fetchCodStats = async () => {
    const res = await fetch(`${API_BASE}/orders/cod-stats`, {
        headers: getAdminHeaders()
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

export const fetchAllReviews = async (productId?: string) => {
    const params = productId ? `?productId=${productId}` : '';
    const res = await fetch(`${API_BASE}/reviews${params}`);
    return handleResponse(res);
};

export const fetchAllReviewsAdmin = async () => {
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

export const adminGetStats = async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/stats${query}`, {
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
    });
    return handleResponse(res);
};

// ========== SITE SETTINGS ==========
export const fetchSiteSettings = async () => {
    const res = await fetch(`${API_BASE}/site-settings`);
    return handleResponse(res);
};

export const updateSiteSettings = async (data: any) => {
    const res = await fetch(`${API_BASE}/site-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchComputedStats = async () => {
    const res = await fetch(`${API_BASE}/site-settings/computed-stats`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== COUNTDOWN TIMER ==========
export const fetchCountdown = async () => {
    const res = await fetch(`${API_BASE}/site-settings/countdown`);
    return handleResponse(res);
};

export const setCountdown = async (data: {
    days: number;
    title?: string;
    titleTa?: string;
    description?: string;
}) => {
    const res = await fetch(`${API_BASE}/site-settings/countdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const disableCountdown = async () => {
    const res = await fetch(`${API_BASE}/site-settings/countdown`, {
        method: 'DELETE',
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== TRACK ORDER & ABOUT ==========
export const trackOrderAPI = async (trackingId: string) => {
    const res = await fetch(`${API_BASE}/tracking/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId })
    });
    return handleResponse(res);
};

export const getAboutInfoAPI = async () => {
    const res = await fetch(`${API_BASE}/about/info`);
    return handleResponse(res);
};

// ========== EMAIL ==========
export const sendBulkOrderEmailAPI = async (data: any) => {
    const res = await fetch(`${API_BASE}/email/bulk-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// ========== NOTES (Admin Only) ==========
export const fetchNotes = async () => {
    const res = await fetch(`${API_BASE}/notes`, {
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

export const createNote = async (data: { title: string, content: string, category?: string }) => {
    const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateNote = async (id: string, data: { title?: string, content?: string, category?: string }) => {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteNote = async (id: string) => {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
    });
    return handleResponse(res);
};

// ========== STOCK ==========
export const updateProductStock = async (id: string, stock: number) => {
    const res = await fetch(`${API_BASE}/products/${id}/stock`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ stock })
    });
    return handleResponse(res);
};

export const createStockRequest = async (data: {
    productId: string;
    productName: string;
    userEmail?: string;
    userName?: string;
    userPhone?: string;
    requestedQty: number;
    availableQty: number;
    selectedWeight?: string;
    preference: 'buy_available' | 'buy_later' | 'bulk';
}) => {
    const res = await fetch(`${API_BASE}/stock/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const checkProductStock = async (productId: string) => {
    const res = await fetch(`${API_BASE}/stock/check/${productId}`);
    return handleResponse(res);
};

