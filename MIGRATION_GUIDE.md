# Database Migration Guide - Enhanced Order Schema

## 🎯 **Overview**

This guide walks through migrating your database to the enhanced order schema with complete order lifecycle tracking, payment details, fulfillment status, and order timeline.

---

## ⚠️ **Breaking Changes**

### 1. **Order.paymentMethod**
- **Before:** `String`
- **After:** `PaymentMethodType` (enum)
- **Action Required:** Existing data needs to be mapped to enum values

### 2. **New Required Fields**
- `fulfillmentStatus` - Defaults to "UNFULFILLED"
- `discount` - Defaults to 0

### 3. **New Enums**
- `FulfillmentStatus`
- `PaymentMethodType`
- Enhanced `OrderStatus` (6 → 11 states)
- Enhanced `PaymentStatus` (5 → 11 states)

---

## 📝 **Step-by-Step Migration**

### **Step 1: Backup Your Database**

```bash
# PostgreSQL backup
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d).sql

# Or use Prisma Studio to export data
npx prisma studio
# Export orders, addresses, and related data
```

---

### **Step 2: Create Migration**

```bash
# This will generate the migration file
npx prisma migrate dev --name enhanced-order-schema --create-only
```

This creates a migration file in `prisma/migrations/`.

---

### **Step 3: Review Generated Migration**

Open the migration file and verify the changes. It should include:

1. ✅ New enums (FulfillmentStatus, PaymentMethodType)
2. ✅ Updated OrderStatus enum (new states)
3. ✅ Updated PaymentStatus enum (new states)
4. ✅ New Order fields
5. ✅ OrderTimeline table creation

---

### **Step 4: Handle Data Migration**

Create a custom migration script to handle existing data:

```sql
-- File: prisma/migrations/[timestamp]_enhanced-order-schema/migration.sql

-- Add this BEFORE the schema changes:

-- Map existing paymentMethod strings to enum values
UPDATE "Order"
SET "paymentMethod" = 'CREDIT_CARD'
WHERE "paymentMethod" IN ('credit_card', 'card', 'CREDIT_CARD');

UPDATE "Order"
SET "paymentMethod" = 'AUTHORIZE_NET'
WHERE "paymentMethod" = 'authorize.net';

UPDATE "Order"
SET "paymentMethod" = 'PAYPAL'
WHERE "paymentMethod" = 'paypal';

UPDATE "Order"
SET "paymentMethod" = 'BANK_TRANSFER'
WHERE "paymentMethod" IN ('bank', 'transfer');

UPDATE "Order"
SET "paymentMethod" = 'CASH_ON_DELIVERY'
WHERE "paymentMethod" IN ('cod', 'cash');

-- Set default for any unknown values
UPDATE "Order"
SET "paymentMethod" = 'CREDIT_CARD'
WHERE "paymentMethod" NOT IN ('CREDIT_CARD', 'AUTHORIZE_NET', 'PAYPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'STRIPE', 'STORE_CREDIT');

-- Then apply the schema changes (Prisma will add these)
```

---

### **Step 5: Apply Migration**

```bash
# Apply the migration to your database
npx prisma migrate deploy
```

---

### **Step 6: Generate Prisma Client**

```bash
# Generate updated Prisma client with new types
npx prisma generate
```

---

### **Step 7: Seed Order Timeline for Existing Orders**

Create a script to populate timeline for existing orders:

```typescript
// scripts/seed-order-timeline.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTimeline() {
  const orders = await prisma.order.findMany({
    include: {
      timeline: true,
    },
  });

  for (const order of orders) {
    // Skip if timeline already exists
    if (order.timeline && order.timeline.length > 0) {
      continue;
    }

    // Create initial timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: order.status,
        message: `Order ${order.orderNumber} created`,
        createdBy: 'SYSTEM',
        createdAt: order.createdAt,
      },
    });

    // Add payment status if confirmed
    if (order.paymentStatus === 'CAPTURED' || order.paymentStatus === 'AUTHORIZED') {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          message: `Payment ${order.paymentStatus.toLowerCase()}`,
          createdBy: 'PAYMENT_GATEWAY',
          createdAt: order.confirmedAt || order.createdAt,
        },
      });
    }

    // Add shipped status if shipped
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          message: order.trackingNumber 
            ? `Order shipped via ${order.carrier} - Tracking: ${order.trackingNumber}`
            : 'Order shipped',
          createdBy: 'SYSTEM',
          createdAt: order.shippedAt || order.createdAt,
        },
      });
    }

    // Add delivered status if delivered
    if (order.status === 'DELIVERED') {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'DELIVERED',
          message: 'Order delivered successfully',
          createdBy: 'SYSTEM',
          createdAt: order.deliveredAt || order.createdAt,
        },
      });
    }

    console.log(`✅ Timeline created for order ${order.orderNumber}`);
  }

  console.log(`\n✨ Timeline seeding complete! Processed ${orders.length} orders.`);
}

seedTimeline()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the script:
```bash
npx ts-node scripts/seed-order-timeline.ts
```

---

### **Step 8: Update API Routes**

The API routes have been updated in:
- ✅ `app/api/orders/route.ts` - Enhanced order creation
- ⏳ `app/api/orders/[id]/route.ts` - Add timeline support
- ⏳ `app/api/orders/[id]/status/route.ts` - Status updates (NEW)
- ⏳ `app/api/orders/[id]/fulfillment/route.ts` - Fulfillment (NEW)
- ⏳ `app/api/orders/[id]/refund/route.ts` - Refunds (NEW)
- ⏳ `app/api/orders/[id]/cancel/route.ts` - Cancellation (NEW)
- ⏳ `app/api/orders/[id]/timeline/route.ts` - Timeline (NEW)

---

### **Step 9: Update Payment Gateway Integration**

Update the Authorize.net payment route to return enhanced payment details:

```typescript
// app/api/payment/authorize/route.ts
// Add to payment response:
{
  success: true,
  transactionId: response.transactionId,
  authCode: response.authCode,           // NEW
  receiptUrl: response.receiptUrl,       // NEW
  receiptNumber: response.receiptNumber, // NEW
}
```

---

### **Step 10: Test the Migration**

Run these tests to verify everything works:

```bash
# 1. Check database schema
npx prisma studio

# 2. Test order creation
# Navigate to /checkout and create a test order

# 3. Verify timeline entries
# Check OrderTimeline table in Prisma Studio

# 4. Test React Query hooks
# Open React Query DevTools in browser
```

---

## 🧪 **Testing Checklist**

### Database
- [ ] All existing orders migrated successfully
- [ ] New enums created
- [ ] OrderTimeline table created
- [ ] All new fields have proper defaults

### API
- [ ] Order creation works with new fields
- [ ] Timeline entries are created automatically
- [ ] Payment details are stored correctly
- [ ] Enum validation works

### Frontend
- [ ] Orders display correctly with new statuses
- [ ] Payment status shows properly
- [ ] Order helpers work with new statuses
- [ ] No TypeScript errors

### Payment Integration
- [ ] Authorize.net returns all required fields
- [ ] Receipt URL is stored
- [ ] Authorization code is saved
- [ ] Payment provider is tracked

---

## 🔄 **Rollback Plan**

If something goes wrong, you can roll back:

```bash
# 1. Restore from backup
psql -U your_user -d your_database < backup_YYYYMMDD.sql

# 2. Or migrate down
npx prisma migrate resolve --rolled-back enhanced-order-schema

# 3. Regenerate client
npx prisma generate
```

---

## 📊 **What You'll Gain**

### **Before Migration:**
```typescript
{
  id: "abc123",
  orderNumber: "ORD-2024-00001",
  status: "SHIPPED",
  paymentMethod: "credit_card",
  paymentStatus: "CAPTURED",
  transactionId: "12345",
  total: 150.00
}
```

### **After Migration:**
```typescript
{
  id: "abc123",
  orderNumber: "ORD-2024-00001",
  
  // Enhanced Status Tracking
  status: "SHIPPED",
  fulfillmentStatus: "FULFILLED",
  
  // Complete Payment Details
  paymentMethod: "AUTHORIZE_NET",
  paymentStatus: "CAPTURED",
  paymentProvider: "authorize.net",
  transactionId: "12345",
  authorizationCode: "ABC123",
  receiptUrl: "https://gateway.com/receipt/12345",
  receiptNumber: "RCP-2024-00001",
  
  // Fulfillment Tracking
  trackingNumber: "1Z999AA10123456784",
  trackingUrl: "https://ups.com/track/...",
  carrier: "UPS",
  shippedAt: "2024-10-25T10:00:00Z",
  deliveredAt: null,
  estimatedDelivery: "2024-10-28T17:00:00Z",
  
  // Financial Details
  subtotal: 130.00,
  tax: 10.40,
  shipping: 9.60,
  discount: 0.00,
  total: 150.00,
  
  // Timeline (complete history)
  timeline: [
    {
      status: "PENDING",
      message: "Order created by customer",
      createdAt: "2024-10-25T09:00:00Z",
      createdBy: "user_123"
    },
    {
      status: "CONFIRMED",
      message: "Payment authorized - Transaction ID: 12345",
      createdAt: "2024-10-25T09:01:00Z",
      createdBy: "PAYMENT_GATEWAY"
    },
    {
      status: "PROCESSING",
      message: "Order processing started",
      createdAt: "2024-10-25T09:30:00Z",
      createdBy: "SYSTEM"
    },
    {
      status: "SHIPPED",
      message: "Order shipped via UPS - Tracking: 1Z999AA10123456784",
      createdAt: "2024-10-25T10:00:00Z",
      createdBy: "SYSTEM"
    }
  ],
  
  // Timestamps
  confirmedAt: "2024-10-25T09:01:00Z",
  processingAt: "2024-10-25T09:30:00Z",
  createdAt: "2024-10-25T09:00:00Z",
  updatedAt: "2024-10-25T10:00:00Z"
}
```

---

## 🚀 **Next Steps After Migration**

1. **Create New API Endpoints:**
   - `/api/orders/[id]/status` - Update order status
   - `/api/orders/[id]/fulfillment` - Add tracking info
   - `/api/orders/[id]/refund` - Process refunds
   - `/api/orders/[id]/cancel` - Cancel orders
   - `/api/orders/[id]/timeline` - Get order history

2. **Build UI Components:**
   - OrderTimeline component (visual history)
   - TrackingInfo component (shipment tracking)
   - RefundForm component (process refunds)
   - CancelOrderModal (cancellation)

3. **Add Email Notifications:**
   - Order confirmed email
   - Order shipped email (with tracking)
   - Order delivered email
   - Refund processed email

4. **Integrate with Shipping APIs:**
   - UPS tracking API
   - FedEx tracking API
   - USPS tracking API
   - Auto-update delivery status

5. **Analytics & Reporting:**
   - Order fulfillment time
   - Delivery success rate
   - Payment success/failure rates
   - Refund reasons analysis

---

## 📞 **Support**

If you encounter any issues during migration:

1. Check the migration logs
2. Verify backup was created
3. Review `ENHANCED_ORDER_SCHEMA.md` for details
4. Test in development before production

---

**Migration Date:** October 26, 2025  
**Estimated Time:** 15-30 minutes  
**Downtime Required:** 5-10 minutes  
**Risk Level:** Medium (breaking changes in paymentMethod)  
**Status:** Ready to Deploy ✅
