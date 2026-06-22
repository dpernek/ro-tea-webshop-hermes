export interface ProductSpecification {
  [key: string]: string;
}

export interface ProductAttribute {
  name: string;
  options: string[];
}

export interface ProductPriceRange {
  min: number;
  max: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku?: string | null;
  brand?: string | null;
  category: string;
  categorySlug: string;
  categories?: { slug: string; name: string }[];
  price: number;
  regularPrice?: number | null;
  oldPrice?: number | null;
  salePrice?: number | null;
  priceRange?: ProductPriceRange;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  specifications?: ProductSpecification;
  attributes?: ProductAttribute[];
  stock?: number | null;
  stockStatus: "instock" | "outofstock" | "onbackorder" | "unknown";
  featured: boolean;
  badge?: string | null;
  type: "simple" | "variable" | "grouped" | "external" | "unknown";
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  count: number;
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
  heroImage?: string;
  contact: {
    address: string;
    city: string;
    company: string;
    phoneDisplay: string;
    phoneHref?: string;
    email: string;
    oib: string;
    iban?: string;
    pdvId?: string;
    sudUpisa?: string;
    temeljniKapital?: string;
    uprava?: string;
    osnivac?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedAttributes?: Record<string, string>;
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
