"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
} from "lucide-react";
import { AddressFormDialog } from "@/components/profile/address-form-dialog";

interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  type: string;
}

interface PaymentMethod {
  id: string;
  cardLast4: string;
  cardBrand: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardholderName: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses();
      fetchPaymentMethods();
      fetchOrders();
    }
  }, [status]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/profile/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/profile/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/profile/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      toast.error("Error deleting address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        toast.error("Failed to update default address");
      }
    } catch (error) {
      toast.error("Error updating address");
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?"))
      return;

    try {
      const response = await fetch(`/api/profile/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Payment method deleted successfully");
        fetchPaymentMethods();
      } else {
        toast.error("Failed to delete payment method");
      }
    } catch (error) {
      toast.error("Error deleting payment method");
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/payment-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        toast.success("Default payment method updated");
        fetchPaymentMethods();
      } else {
        toast.error("Failed to update default payment method");
      }
    } catch (error) {
      toast.error("Error updating payment method");
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "text-yellow-600",
      AUTHORIZED: "text-blue-600",
      CAPTURED: "text-green-600",
      FAILED: "text-red-600",
      REFUNDED: "text-gray-600",
    };
    return statusColors[status] || "text-gray-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">
            Manage your profile, addresses, and payment methods
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue={session.user?.name || ""}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={session.user?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">
                    Change Password
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your shipping and billing addresses
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No addresses saved
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add your first address to speed up checkout
                    </p>
                    <Button
                      onClick={() => setShowAddressForm(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`relative border rounded-lg p-4 ${
                          address.isDefault
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        {address.isDefault && (
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              <Check className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          </div>
                        )}

                        <div className="space-y-2 mb-4">
                          <p className="font-semibold text-gray-900">
                            {address.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2 &&
                              `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.country}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.phone}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSetDefaultAddress(address.id)
                              }
                              className="flex-1"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAddress(address);
                              setShowAddressForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No payment methods saved
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Payment methods are saved automatically when you check
                      "Save this card" during checkout
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative border rounded-lg p-4 ${
                          method.isDefault
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        {method.isDefault && (
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              <Check className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          </div>
                        )}

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <p className="font-semibold text-gray-900">
                              {method.cardBrand} •••• {method.cardLast4}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            {method.cardholderName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.cardExpMonth}/{method.cardExpYear}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSetDefaultPaymentMethod(method.id)
                              }
                              className="flex-1"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> For your security, we only store the
                    last 4 digits of your card. You'll need to enter the full
                    card number and CVV when making a purchase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View and track your past orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start shopping to see your orders here
                    </p>
                    <Button onClick={() => router.push("/products")}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Order Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-6">
                              <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">
                                  Order Number
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {order.orderNumber}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">
                                  Order Date
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">
                                  Total
                                </p>
                                <p className="font-semibold text-gray-900">
                                  ${parseFloat(order.total).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/orders/${order.id}`)
                                }
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                              >
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                    {item.product.images &&
                                    item.product.images.length > 0 ? (
                                      <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 mt-1">
                                    ${parseFloat(item.price).toFixed(2)} each
                                  </p>
                                </div>

                                {/* Item Total */}
                                <div className="text-right flex-shrink-0">
                                  <p className="font-semibold text-gray-900">
                                    $
                                    {(
                                      parseFloat(item.price) * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="mt-2 text-blue-600 p-0 h-auto"
                                    onClick={() =>
                                      router.push(
                                        `/products/${item.product.slug}`
                                      )
                                    }
                                  >
                                    View Product
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary */}
                          <div className="mt-6 pt-6 border-t">
                            <div className="flex flex-wrap gap-8">
                              {/* Shipping Address */}
                              <div className="flex-1 min-w-[200px]">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Shipping Address
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p className="font-medium text-gray-900">
                                    {order.shippingAddress.fullName}
                                  </p>
                                  <p>{order.shippingAddress.addressLine1}</p>
                                  {order.shippingAddress.addressLine2 && (
                                    <p>{order.shippingAddress.addressLine2}</p>
                                  )}
                                  <p>
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.postalCode}
                                  </p>
                                  <p>{order.shippingAddress.country}</p>
                                </div>
                              </div>

                              {/* Order Totals */}
                              <div className="flex-1 min-w-[200px]">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                  Order Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Subtotal
                                    </span>
                                    <span className="font-medium">
                                      ${parseFloat(order.subtotal).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Shipping
                                    </span>
                                    <span className="font-medium">
                                      ${parseFloat(order.shipping).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">
                                      ${parseFloat(order.tax).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t">
                                    <span className="font-semibold text-gray-900">
                                      Total
                                    </span>
                                    <span className="font-bold text-gray-900">
                                      ${parseFloat(order.total).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2">
                                    <span className="text-gray-600">
                                      Payment Status
                                    </span>
                                    <span
                                      className={`font-semibold ${getPaymentStatusColor(
                                        order.paymentStatus
                                      )}`}
                                    >
                                      {order.paymentStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={showAddressForm}
        onOpenChange={setShowAddressForm}
        address={editingAddress}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}
