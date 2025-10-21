"use client";

/**
 * Refactored Checkout Page
 * Uses component composition and hooks for clean, maintainable code
 * Reduced from 623 lines to ~180 lines
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BillingAddressSection } from "@/components/checkout/billing-address-section";
import { ShippingAddressSection } from "@/components/checkout/shipping-address-section";
import { PaymentSection } from "@/components/checkout/payment-section";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { cartItemsAtom, cartTotalAtom } from "@/stores/cart";
import { useCheckout } from "@/hooks/useCheckout";
import { priceHelpers } from "@/lib/helpers";

const checkoutSchema = z.object({
  // Billing Address
  billingFullName: z.string().min(2, "Full name is required"),
  billingAddressLine1: z.string().min(5, "Address is required"),
  billingAddressLine2: z.string().optional(),
  billingCity: z.string().min(2, "City is required"),
  billingState: z.string().min(2, "State is required"),
  billingPostalCode: z.string().min(3, "Postal code is required"),
  billingCountry: z.string().min(2, "Country is required"),
  billingPhone: z.string().min(10, "Phone number is required"),

  // Shipping Address
  sameAsShipping: z.boolean().default(true),
  shippingFullName: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingPhone: z.string().optional(),

  // Payment Information
  cardNumber: z.string().min(13, "Card number is required").max(19),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  expiryMonth: z.string().min(2, "Expiry month is required"),
  expiryYear: z.string().min(4, "Expiry year is required"),
  cvv: z.string().min(3, "CVV is required").max(4),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items] = useAtom(cartItemsAtom);
  const [subtotal] = useAtom(cartTotalAtom);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const tax = priceHelpers.calculateTax(subtotal);
  const shipping = priceHelpers.calculateShipping(subtotal);
  const total = priceHelpers.calculateTotal(subtotal, tax, shipping);

  const { isProcessing, processCheckout } = useCheckout(items, {
    subtotal,
    tax,
    shipping,
    total,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsShipping: true,
      billingCountry: "US",
      shippingCountry: "US",
    },
  });

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/login?callbackUrl=/checkout");
    return null;
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    // Prepare addresses
    const billingAddress = {
      fullName: data.billingFullName,
      addressLine1: data.billingAddressLine1,
      addressLine2: data.billingAddressLine2,
      city: data.billingCity,
      state: data.billingState,
      postalCode: data.billingPostalCode,
      country: data.billingCountry,
      phone: data.billingPhone,
    };

    const shippingAddress = data.sameAsShipping
      ? billingAddress
      : {
          fullName: data.shippingFullName!,
          addressLine1: data.shippingAddressLine1!,
          addressLine2: data.shippingAddressLine2,
          city: data.shippingCity!,
          state: data.shippingState!,
          postalCode: data.shippingPostalCode!,
          country: data.shippingCountry!,
          phone: data.shippingPhone!,
        };

    const paymentData = {
      cardNumber: data.cardNumber,
      cardholderName: data.cardholderName,
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear,
      cvv: data.cvv,
    };

    await processCheckout({
      billingAddress,
      shippingAddress,
      paymentData,
      sameAsShipping: data.sameAsShipping,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                <BillingAddressSection register={register} errors={errors} />

                <ShippingAddressSection
                  register={register}
                  errors={errors}
                  sameAsShipping={sameAsShipping}
                  onSameAsShippingChange={setSameAsShipping}
                />

                <PaymentSection register={register} errors={errors} />
              </div>

              {/* Order Summary */}
              <div>
                <CheckoutSummary
                  items={items}
                  subtotal={subtotal}
                  tax={tax}
                  shipping={shipping}
                  total={total}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
