export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku?: string | null;
  images: string[];
  featured: boolean;
  published: boolean;
  categoryId: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  stock: number;
}

export interface Address {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number | string;
  tax: number | string;
  shipping: number | string;
  total: number | string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: Omit<Address, "id" | "isDefault">;
  billingAddress: Omit<Address, "id" | "isDefault">;
  paymentMethod: string;
  transactionId?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED";

export type UserRole = "CUSTOMER" | "ADMIN";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string | null;
    image: string | null;
  };
}
