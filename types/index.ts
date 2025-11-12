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

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  message: string;
  metadata?: string | null;
  createdBy?: string | null;
  createdAt: Date | string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  
  // Status
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Financial
  subtotal: number | string;
  tax: number | string;
  shipping: number | string;
  discount: number | string;
  total: number | string;
  
  // Payment
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentProvider?: string | null;
  transactionId?: string | null;
  authorizationCode?: string | null;
  receiptNumber?: string | null;
  
  // Refund
  refundAmount?: number | string | null;
  refundReason?: string | null;
  refundedAt?: Date | string | null;
  
  // Fulfillment
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  shippedAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  estimatedDelivery?: Date | string | null;
  
  // Cancellation
  cancellationReason?: string | null;
  cancelledAt?: Date | string | null;
  cancelledBy?: string | null;
  
  // Items & Addresses
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  
  // Timeline
  timeline?: OrderTimeline[];
  
  // Notes
  notes?: string | null;
  internalNotes?: string | null;
  
  // Timestamps
  confirmedAt?: Date | string | null;
  processingAt?: Date | string | null;
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
  paymentMethod: PaymentMethodType;
  transactionId?: string;
  authorizationCode?: string;
  receiptNumber?: string;
  paymentProvider?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  notes?: string;
  ipAddress?: string;
}

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "FAILED"
  | "ON_HOLD";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "PARTIALLY_CAPTURED"
  | "FAILED"
  | "DECLINED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "EXPIRED"
  | "PENDING_REVIEW";

export type FulfillmentStatus =
  | "UNFULFILLED"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED"
  | "RESTOCKED";

export type PaymentMethodType =
  | "CREDIT_CARD"
  | "AUTHORIZE_NET"
  | "STRIPE"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CASH_ON_DELIVERY"
  | "STORE_CREDIT";

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
