import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
    } = body;

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
        ...shippingAddress,
        userId: session.user.id,
      },
    });

    const createdBillingAddress = await prisma.address.create({
      data: {
        ...billingAddress,
        userId: session.user.id,
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: "PENDING",
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        paymentStatus: "PENDING",
        shippingAddressId: createdShippingAddress.id,
        billingAddressId: createdBillingAddress.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
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
