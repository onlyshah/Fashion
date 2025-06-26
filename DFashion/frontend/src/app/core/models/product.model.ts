export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: 'men' | 'women' | 'children';
  subcategory: string;
  brand: string;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  vendor: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  tags: string[];
  features: string[];
  material?: string;
  careInstructions?: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: {
    average: number;
    count: number;
  };
  reviews: ProductReview[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
  };
  analytics: {
    views: number;
    likes: number;
    shares: number;
    purchases: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  code: string;
  images?: string[];
}

export interface ProductReview {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  rating: number;
  comment?: string;
  images: string[];
  createdAt: Date;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}
