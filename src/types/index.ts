export interface ProductSpecification {
  [key: string]: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  specifications: ProductSpecification;
  stock: number;
  featured: boolean;
  badge?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  contact: {
    email: string;
    phoneDisplay: string;
    phoneHref: string;
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
