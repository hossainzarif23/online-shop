import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      transactionId,
      authorizationCode,
      receiptNumber,
      paymentProvider,
      subtotal,
      tax,
      shipping,
      discount = 0,
      total,
      notes,
      ipAddress,
    } = body;

    console.log("Creating order for user:", session.user.id);
    console.log("Shipping address data:", shippingAddress);

    // Ensure database connection is active
    try {
      await prisma.$connect();
    } catch (connectError) {
      console.error("Database connection error:", connectError);
      // Try to reconnect
      await prisma.$disconnect();
      await prisma.$connect();
    }

    // Create addresses first
    const createdShippingAddress = await prisma.address.create({
      data: {
        fullName: shippingAddress.fullName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "US",
        phone: shippingAddress.phone,
        userId: session.user.id,
        type: "SHIPPING",
      },
    });

    const createdBillingAddress = await prisma.address.create({
      data: {
        fullName: billingAddress.fullName,
        addressLine1: billingAddress.addressLine1,
        addressLine2: billingAddress.addressLine2 || null,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country || "US",
        phone: billingAddress.phone,
        userId: session.user.id,
        type: "BILLING",
      },
    });

    // Determine initial status based on payment
    let orderStatus: OrderStatus = "PENDING";
    let paymentStatus: PaymentStatus = "PENDING";

    if (transactionId && authorizationCode) {
      // Payment was authorized
      orderStatus = "CONFIRMED";
      paymentStatus = "AUTHORIZED";
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: orderStatus,
        fulfillmentStatus: "UNFULFILLED",
        subtotal,
        tax,
        shipping,
        discount,
        total,
        paymentMethod,
        paymentStatus,
        paymentProvider: paymentProvider || null,
        transactionId: transactionId || null,
        authorizationCode: authorizationCode || null,
        receiptNumber: receiptNumber || null,
        shippingAddressId: createdShippingAddress.id,
        billingAddressId: createdBillingAddress.id,
        notes: notes || null,
        ipAddress: ipAddress || null,
        confirmedAt: transactionId ? new Date() : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        timeline: {
          create: [
            {
              status: orderStatus as "PAYMENT_PENDING" | "CONFIRMED",
              message: `Order created by customer`,
              createdBy: session.user.id,
            },
            ...(transactionId
              ? [
                  {
                    status: "CONFIRMED" as const,
                    message: `Payment authorized - Transaction ID: ${transactionId}`,
                    createdBy: "PAYMENT_GATEWAY",
                    metadata: JSON.stringify({
                      transactionId,
                      authorizationCode,
                      paymentProvider,
                    }),
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    // TODO: After migration, add timeline entries:
    // await prisma.orderTimeline.create({
    //   data: {
    //     orderId: order.id,
    //     status: orderStatus,
    //     message: `Order created by customer`,
    //     createdBy: session.user.id,
    //   },
    // });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Server has closed the connection")) {
        return NextResponse.json(
          { error: "Database connection lost. Please try again." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
