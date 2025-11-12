# Enhanced Order Schema Migration Guide

## 🎯 What Changed?

### **1. Order Table Enhancements**

#### New Fields Added:
- **fulfillmentStatus** - Track shipping/delivery status separately from order status
- **discount** - Store discount amounts
- **paymentProvider** - Track which payment gateway was used
- **authorizationCode** - Store payment authorization code
- **receiptUrl** - URL to payment receipt from gateway
- **receiptNumber** - Payment receipt number
- **refundAmount** - Amount refunded (if any)
- **refundReason** - Reason for refund
- **refundedAt** - When refund was processed
- **trackingNumber** - Shipment tracking number
- **trackingUrl** - URL to track shipment
- **carrier** - Shipping carrier (USPS, FedEx, UPS, DHL)
- **shippedAt** - When order was shipped
- **deliveredAt** - When order was delivered
- **estimatedDelivery** - Estimated delivery date
- **cancellationReason** - Why order was cancelled
- **cancelledAt** - When order was cancelled
- **cancelledBy** - Who cancelled (user ID, SYSTEM, ADMIN)
- **internalNotes** - Admin/internal notes
- **ipAddress** - Customer IP for fraud prevention
- **confirmedAt** - When payment was confirmed
- **processingAt** - When order processing started

#### Changed Fields:
- **paymentMethod** - Changed from String to PaymentMethodType enum
- **paymentProvider** - New field to track payment gateway

### **2. New OrderTimeline Model**
Tracks all status changes and events for complete order history.

**Fields:**
- id, orderId, status, message, metadata, createdBy, createdAt

**Use Cases:**
- "Order placed by customer"
- "Payment authorized by Authorize.net"
- "Payment captured successfully"
- "Order shipped via FedEx"
- "Order delivered"

### **3. Enhanced Enums**

#### OrderStatus (11 states):
- PENDING - Order created, awaiting payment
- PAYMENT_PENDING - Payment initiated but not confirmed
- CONFIRMED - Payment confirmed, ready to process
- PROCESSING - Order is being prepared
- SHIPPED - Order has been shipped
- OUT_FOR_DELIVERY - Order is out for delivery
- DELIVERED - Order delivered successfully
- CANCELLED - Order cancelled
- REFUNDED - Order refunded
- FAILED - Order failed
- ON_HOLD - Order on hold (review needed)

#### PaymentStatus (11 states):
- PENDING - Payment not yet initiated
- AUTHORIZED - Payment authorized (funds reserved)
- CAPTURED - Payment captured (funds taken)
- PARTIALLY_CAPTURED - Partial payment captured
- FAILED - Payment failed
- DECLINED - Payment declined by gateway
- CANCELLED - Payment cancelled
- REFUNDED - Payment refunded
- PARTIALLY_REFUNDED - Partial refund issued
- EXPIRED - Authorization expired
- PENDING_REVIEW - Payment under review

#### FulfillmentStatus (4 states):
- UNFULFILLED - Not yet fulfilled
- PARTIALLY_FULFILLED - Some items fulfilled
- FULFILLED - All items fulfilled
- RESTOCKED - Items returned to stock

#### PaymentMethodType (7 types):
- CREDIT_CARD
- AUTHORIZE_NET
- STRIPE
- PAYPAL
- BANK_TRANSFER
- CASH_ON_DELIVERY
- STORE_CREDIT

---

## 🔄 Migration Steps

### 1. Generate Migration
```bash
npx prisma migrate dev --name enhanced-order-schema
```

### 2. Apply Migration
```bash
npx prisma migrate deploy
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

---

## 📊 Order Lifecycle Flow

### 1. Order Creation
```
Status: PENDING
PaymentStatus: PENDING
FulfillmentStatus: UNFULFILLED
Timeline: "Order created by customer"
```

### 2. Payment Initiated
```
Status: PAYMENT_PENDING
PaymentStatus: PENDING
Timeline: "Payment initiated via Authorize.net"
```

### 3. Payment Authorized
```
Status: CONFIRMED
PaymentStatus: AUTHORIZED
confirmedAt: now()
transactionId: "12345"
authorizationCode: "ABC123"
Timeline: "Payment authorized - $150.00"
```

### 4. Payment Captured
```
PaymentStatus: CAPTURED
Timeline: "Payment captured successfully"
receiptUrl: "https://gateway.com/receipt/12345"
```

### 5. Order Processing
```
Status: PROCESSING
processingAt: now()
Timeline: "Order processing started"
```

### 6. Order Shipped
```
Status: SHIPPED
FulfillmentStatus: FULFILLED
shippedAt: now()
trackingNumber: "1Z999AA10123456784"
carrier: "UPS"
trackingUrl: "https://ups.com/track/..."
Timeline: "Order shipped via UPS"
```

### 7. Out for Delivery
```
Status: OUT_FOR_DELIVERY
Timeline: "Order out for delivery"
```

### 8. Delivered
```
Status: DELIVERED
deliveredAt: now()
Timeline: "Order delivered successfully"
```

### Alternative Flows:

#### Cancellation
```
Status: CANCELLED
cancelledAt: now()
cancelledBy: userId
cancellationReason: "Customer requested cancellation"
Timeline: "Order cancelled by customer"
```

#### Refund
```
Status: REFUNDED
PaymentStatus: REFUNDED
refundAmount: 150.00
refundReason: "Defective product"
refundedAt: now()
Timeline: "Order refunded - $150.00"
```

---

## 🔍 Use Cases Enabled

### 1. **Order Tracking**
- Customer can see exact status: "Shipped via FedEx - Track: 123456"
- Click tracking URL to see real-time location
- See estimated delivery date

### 2. **Payment Transparency**
- View receipt URL from payment gateway
- See authorization and capture timestamps
- Track refund status and amount

### 3. **Complete History**
- Timeline shows every status change
- See who made changes (customer, admin, system)
- Track payment gateway responses

### 4. **Fraud Prevention**
- Store customer IP address
- Track payment review status
- Flag suspicious orders as ON_HOLD

### 5. **Fulfillment Management**
- Separate order status from fulfillment
- Track partial fulfillments
- Manage restocking on returns

### 6. **Customer Service**
- See internal notes (admin only)
- Track cancellation reasons
- View complete order history

### 7. **Analytics**
- Time from order to delivery
- Payment success/failure rates
- Most common carriers
- Refund reasons analysis

---

## 🎨 orderNumber vs id

### **id (cuid)**
- Technical identifier
- Used in URLs: `/orders/clt1234567890`
- Never changes
- Database foreign keys reference this

### **orderNumber (human-readable)**
- Customer-facing identifier
- Format: "ORD-2024-00001", "ORD-2024-00002"
- Easy to communicate over phone/email
- Can be sequential or custom format
- Printed on receipts and invoices

**Example:**
```typescript
// Customer sees: "Your order ORD-2024-12345 has been shipped"
// URL: /orders/clt1a2b3c4d5e6f7g8h9
// Email: "Order #ORD-2024-12345"
// Receipt: "Order Number: ORD-2024-12345"
```

---

## 💡 Best Practices

### 1. Always Update Timeline
```typescript
await prisma.orderTimeline.create({
  data: {
    orderId: order.id,
    status: "SHIPPED",
    message: `Order shipped via ${carrier}`,
    metadata: JSON.stringify({ trackingNumber, carrier }),
    createdBy: "SYSTEM",
  },
});
```

### 2. Set Timestamps
```typescript
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: "SHIPPED",
    fulfillmentStatus: "FULFILLED",
    shippedAt: new Date(),
    trackingNumber,
    carrier,
  },
});
```

### 3. Handle Payment Status
```typescript
// After Authorize.net authorization
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: "CONFIRMED",
    paymentStatus: "AUTHORIZED",
    confirmedAt: new Date(),
    transactionId: result.transactionId,
    authorizationCode: result.authCode,
    receiptUrl: result.receiptUrl,
    paymentProvider: "authorize.net",
  },
});
```

### 4. Generate Order Numbers
```typescript
// Format: ORD-YYYY-NNNNN
const today = new Date();
const year = today.getFullYear();
const count = await prisma.order.count({
  where: {
    createdAt: {
      gte: new Date(year, 0, 1),
    },
  },
});
const orderNumber = `ORD-${year}-${String(count + 1).padStart(5, "0")}`;
// Result: "ORD-2024-00123"
```

---

## 🚀 Next Steps

1. **Update Order Service** - Add methods for timeline, tracking, refunds
2. **Update Order Types** - Add new fields to TypeScript types
3. **Update Order UI** - Show tracking, timeline, receipt links
4. **Add Timeline Component** - Visual order history
5. **Add Tracking Component** - Show shipping status
6. **Update Admin Panel** - Manage fulfillment, refunds
7. **Add Email Templates** - Send tracking emails
8. **Add Webhooks** - Handle payment gateway updates

---

**Migration Date:** October 26, 2025  
**Status:** ✅ Schema Ready - Needs Migration  
**Breaking Changes:** Yes - paymentMethod changed to enum
