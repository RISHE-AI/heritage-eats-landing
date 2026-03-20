export interface Product {
  id: string;
  _id?: string;
  nameEn: string;
  nameTa: string;
  category: 'sweets' | 'snacks' | 'pickles' | 'malts' | 'podi';
  price: number;
  descriptionEn: string;
  descriptionTa: string;
  images: string[];
  ingredientsEn: string[];
  ingredientsTa: string[];
  benefitsEn: string[];
  benefitsTa: string[];
  storageEn: string;
  storageTa: string;
  shelfLife: string;
  available?: boolean;
  temporarilyUnavailable?: boolean;
  totalSold?: number;
  weightOptions?: WeightOption[];
  badge?: string | null;
}

export interface WeightOption {
  weight: string;
  price: number;
  unit: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight: string;
  unitPrice: number;
  customMessage?: string;
}

export interface Feedback {
  id: string;
  _id?: string;
  name: string;
  customerName?: string;
  productId?: string;
  rating: number;
  comment: string;
  approved?: boolean;
  createdAt: Date | string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderId?: string;
  items: CartItem[];
  customer: CustomerDetails;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  totalAmount?: number;
  createdAt: Date | string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  canCancel: boolean;
  cancelDeadline: string;
}

// Helper to transform backend product to frontend Product interface
export const transformProduct = (p: any): Product => ({
  id: p.id || p._id,
  _id: p._id,
  nameEn: p.name_en || p.nameEn || '',
  nameTa: p.name_ta || p.nameTa || '',
  category: p.category,
  price: p.basePrice || p.price || 0,
  descriptionEn: p.description_en || p.descriptionEn || '',
  descriptionTa: p.description_ta || p.descriptionTa || '',
  images: Array.isArray(p.images) ? p.images.filter((img: string) => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== '/placeholder.svg') : [],
  ingredientsEn: p.ingredients_en || p.ingredientsEn || [],
  ingredientsTa: p.ingredients_ta || p.ingredientsTa || [],
  benefitsEn: p.benefits_en || p.benefitsEn || [],
  benefitsTa: p.benefits_ta || p.benefitsTa || [],
  storageEn: p.storage_en || p.storageEn || '',
  storageTa: p.storage_ta || p.storageTa || '',
  shelfLife: p.shelfLife || '',
  available: p.available !== false,
  temporarilyUnavailable: p.temporarilyUnavailable || false,
  totalSold: p.totalSold || 0,
  weightOptions: p.weightOptions || [],
  badge: p.badge || null
});

// Helper to transform frontend Product to backend format for saving
export const transformProductToBackend = (p: Product): any => ({
  id: p.id,
  name_en: p.nameEn,
  name_ta: p.nameTa,
  category: p.category,
  basePrice: p.price,
  description_en: p.descriptionEn,
  description_ta: p.descriptionTa,
  images: p.images,
  ingredients_en: p.ingredientsEn,
  ingredients_ta: p.ingredientsTa,
  benefits_en: p.benefitsEn,
  benefits_ta: p.benefitsTa,
  storage_en: p.storageEn,
  storage_ta: p.storageTa,
  shelfLife: p.shelfLife,
  available: p.available,
  weightOptions: p.weightOptions
});
