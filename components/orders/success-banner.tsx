/**
 * SuccessBanner Component
 * Displays order confirmation success message
 */

import { CheckCircle } from "lucide-react";

interface SuccessBannerProps {
  orderNumber: string;
}

export function SuccessBanner({ orderNumber }: SuccessBannerProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start gap-4">
      <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-green-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-green-800 mb-1">
          Thank you for your order. Your order number is{" "}
          <strong>#{orderNumber}</strong>
        </p>
        <p className="text-green-700 text-sm">
          We&apos;ve sent a confirmation email to your registered email address.
        </p>
      </div>
    </div>
  );
}
