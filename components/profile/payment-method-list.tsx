/**
 * PaymentMethodList Component
 * Displays a list of saved payment methods
 */

import { Button } from "@/components/ui/button";
import { CreditCard, Trash2 } from "lucide-react";
import type { PaymentMethod } from "@/lib/services/payment.service";

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function PaymentMethodList({
  paymentMethods,
  isLoading,
  onDelete,
  onSetDefault,
}: PaymentMethodListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No payment methods saved
        </h3>
        <p className="text-gray-600 mb-4">
          Payment methods will be saved during checkout
        </p>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> For your security, we only store the last 4
            digits of your card. You'll need to enter the full card number and
            CVV when making a purchase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="border rounded-lg p-4 hover:border-gray-400 transition-colors relative"
          >
            {method.isDefault && (
              <div className="absolute top-2 right-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
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
              <p className="text-sm text-gray-600">{method.cardholderName}</p>
              <p className="text-sm text-gray-600">
                Expires {method.cardExpMonth}/{method.cardExpYear}
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {!method.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetDefault(method.id)}
                  className="flex-1"
                >
                  Set Default
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(method.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> For your security, we only store the last 4
          digits of your card. You'll need to enter the full card number and CVV
          when making a purchase.
        </p>
      </div>
    </>
  );
}
