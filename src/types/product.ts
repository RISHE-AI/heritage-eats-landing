export interface Product {
  id: string;
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
  weightOptions?: WeightOption[];
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
}

export interface Feedback {
  id: string;
  name: string;
  rating: number;
  comment: string;
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
  items: CartItem[];
  customer: CustomerDetails;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  createdAt: Date | string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  canCancel: boolean;
  cancelDeadline: string;
}
