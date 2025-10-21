"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtom, useSetAtom } from "jotai";
import { cartItemsAtom, cartTotalAtom, clearCartAtom } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, CreditCard, Lock } from "lucide-react";
import Link from "next/link";

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
  const [total] = useAtom(cartTotalAtom);
  const clearCart = useSetAtom(clearCartAtom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

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

  const tax = total * 0.1; // 10% tax
  const shipping = total > 50 ? 0 : 9.99;
  const grandTotal = total + tax + shipping;

  // Redirect if not logged in
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
    setIsProcessing(true);

    try {
      // Prepare shipping address
      const shippingAddress = data.sameAsShipping
        ? {
            fullName: data.billingFullName,
            addressLine1: data.billingAddressLine1,
            addressLine2: data.billingAddressLine2,
            city: data.billingCity,
            state: data.billingState,
            postalCode: data.billingPostalCode,
            country: data.billingCountry,
            phone: data.billingPhone,
          }
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

      // Process payment with Authorize.net
      const paymentResponse = await fetch("/api/payment/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: grandTotal,
          cardNumber: data.cardNumber.replace(/\s/g, ""),
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          cvv: data.cvv,
          cardholderName: data.cardholderName,
          billingAddress,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success) {
        throw new Error(paymentResult.error || "Payment processing failed");
      }

      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          billingAddress,
          paymentMethod: "CREDIT_CARD",
          transactionId: paymentResult.transactionId,
          subtotal: total,
          tax,
          shipping,
          total: grandTotal,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      // Clear cart
      clearCart();

      // Show success message
      toast.success("Order placed successfully!", {
        description: `Order #${orderResult.orderNumber} has been created.`,
      });

      // Redirect to order confirmation
      router.push(`/orders/${orderResult.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during checkout. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
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
                {/* Billing Address */}
                <div className="bg-background border rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Billing Address</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="billingFullName">Full Name *</Label>
                      <Input
                        id="billingFullName"
                        {...register("billingFullName")}
                        placeholder="John Doe"
                      />
                      {errors.billingFullName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingFullName.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="billingAddressLine1">
                        Address Line 1 *
                      </Label>
                      <Input
                        id="billingAddressLine1"
                        {...register("billingAddressLine1")}
                        placeholder="123 Main St"
                      />
                      {errors.billingAddressLine1 && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingAddressLine1.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="billingAddressLine2">
                        Address Line 2
                      </Label>
                      <Input
                        id="billingAddressLine2"
                        {...register("billingAddressLine2")}
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div>
                      <Label htmlFor="billingCity">City *</Label>
                      <Input
                        id="billingCity"
                        {...register("billingCity")}
                        placeholder="New York"
                      />
                      {errors.billingCity && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingCity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="billingState">State *</Label>
                      <Input
                        id="billingState"
                        {...register("billingState")}
                        placeholder="NY"
                      />
                      {errors.billingState && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingState.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="billingPostalCode">Postal Code *</Label>
                      <Input
                        id="billingPostalCode"
                        {...register("billingPostalCode")}
                        placeholder="10001"
                      />
                      {errors.billingPostalCode && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingPostalCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="billingCountry">Country *</Label>
                      <Input
                        id="billingCountry"
                        {...register("billingCountry")}
                        placeholder="US"
                      />
                      {errors.billingCountry && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingCountry.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="billingPhone">Phone *</Label>
                      <Input
                        id="billingPhone"
                        {...register("billingPhone")}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.billingPhone && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.billingPhone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping same as billing */}
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="sameAsShipping" className="cursor-pointer">
                      Shipping address same as billing
                    </Label>
                  </div>
                </div>

                {/* Shipping Address */}
                {!sameAsShipping && (
                  <div className="bg-background border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Address</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="shippingFullName">Full Name *</Label>
                        <Input
                          id="shippingFullName"
                          {...register("shippingFullName")}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="shippingAddressLine1">
                          Address Line 1 *
                        </Label>
                        <Input
                          id="shippingAddressLine1"
                          {...register("shippingAddressLine1")}
                          placeholder="123 Main St"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="shippingAddressLine2">
                          Address Line 2
                        </Label>
                        <Input
                          id="shippingAddressLine2"
                          {...register("shippingAddressLine2")}
                          placeholder="Apt 4B"
                        />
                      </div>

                      <div>
                        <Label htmlFor="shippingCity">City *</Label>
                        <Input
                          id="shippingCity"
                          {...register("shippingCity")}
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <Label htmlFor="shippingState">State *</Label>
                        <Input
                          id="shippingState"
                          {...register("shippingState")}
                          placeholder="NY"
                        />
                      </div>

                      <div>
                        <Label htmlFor="shippingPostalCode">
                          Postal Code *
                        </Label>
                        <Input
                          id="shippingPostalCode"
                          {...register("shippingPostalCode")}
                          placeholder="10001"
                        />
                      </div>

                      <div>
                        <Label htmlFor="shippingCountry">Country *</Label>
                        <Input
                          id="shippingCountry"
                          {...register("shippingCountry")}
                          placeholder="US"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="shippingPhone">Phone *</Label>
                        <Input
                          id="shippingPhone"
                          {...register("shippingPhone")}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div className="bg-background border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5" />
                    <h2 className="text-xl font-bold">Payment Information</h2>
                    <Lock className="h-4 w-4 text-green-600 ml-auto" />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Test Mode:</strong> Use card number 4111 1111 1111
                      1111 with any future expiry date and any 3-digit CVV.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input
                        id="cardholderName"
                        {...register("cardholderName")}
                        placeholder="John Doe"
                      />
                      {errors.cardholderName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.cardholderName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        {...register("cardNumber")}
                        placeholder="4111 1111 1111 1111"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.cardNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="expiryMonth">Month *</Label>
                        <Input
                          id="expiryMonth"
                          {...register("expiryMonth")}
                          placeholder="12"
                          maxLength={2}
                        />
                        {errors.expiryMonth && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.expiryMonth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="expiryYear">Year *</Label>
                        <Input
                          id="expiryYear"
                          {...register("expiryYear")}
                          placeholder="2025"
                          maxLength={4}
                        />
                        {errors.expiryYear && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.expiryYear.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          {...register("cvv")}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                        />
                        {errors.cvv && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.cvv.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-background border rounded-lg p-6 sticky top-20">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (10%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "FREE" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Place Order {formatPrice(grandTotal)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By placing this order, you agree to our{" "}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
