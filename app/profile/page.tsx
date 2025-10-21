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
import {
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

// Import custom hooks
import { useAddresses } from "@/hooks/useAddresses";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useOrders } from "@/hooks/useOrders";

// Import components
import { AddressFormDialog } from "@/components/profile/address-form-dialog";
import { AddressList } from "@/components/profile/address-list";
import { PaymentMethodList } from "@/components/profile/payment-method-list";
import { OrderList } from "@/components/profile/order-list";
import { ProfileInfo } from "@/components/profile/profile-info";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Use custom hooks for data management
  const {
    addresses,
    isLoading: addressesLoading,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const {
    paymentMethods,
    isLoading: paymentsLoading,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentMethods();

  const { orders, isLoading: ordersLoading } = useOrders();

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Loading state
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

  if (!session) return null;

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Profile Info Tab */}
          <TabsContent value="profile">
            <ProfileInfo session={session} />
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>
                      Manage your shipping and billing addresses
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddNewAddress}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AddressList
                  addresses={addresses}
                  isLoading={addressesLoading}
                  onEdit={handleEditAddress}
                  onDelete={deleteAddress}
                  onSetDefault={setDefaultAddress}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your saved payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodList
                  paymentMethods={paymentMethods}
                  isLoading={paymentsLoading}
                  onDelete={deletePaymentMethod}
                  onSetDefault={setDefaultPaymentMethod}
                />
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
                <OrderList orders={orders} isLoading={ordersLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={showAddressForm}
        onOpenChange={(open) => {
          setShowAddressForm(open);
          if (!open) setEditingAddress(null);
        }}
        address={editingAddress}
      />
    </div>
  );
}
