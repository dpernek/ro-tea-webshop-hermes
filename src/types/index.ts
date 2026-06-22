export interface ProductSpecification {
  [key: string]: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku?: string | null;
  brand?: string | null;
  category: string;
  categorySlug: string;
  categories: string[];
  price: number;
  regularPrice?: number | null;
  oldPrice?: number | null;
  salePrice?: number | null;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  specifications: ProductSpecification;
  stock?: number | null;
  stockStatus: "instock" | "outofstock" | "onbackorder" | "unknown";
  featured: boolean;
  badge?: string | null;
  type: "simple" | "variable" | "grouped" | "external" | string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  contact: {
    email: string;
    phoneDisplay: string;
    address: string;
    company: string;
    oib: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  note: string;
}
