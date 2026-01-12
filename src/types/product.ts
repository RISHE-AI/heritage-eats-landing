export interface Product {
  id: string;
  nameEn: string;
  nameTa: string;
  category: 'sweets' | 'snacks' | 'pickles';
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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Feedback {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'completed';
}
