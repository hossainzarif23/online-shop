/**
 * PaymentSection Component
 * Renders the payment information form fields
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface PaymentSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export function PaymentSection({ register, errors }: PaymentSectionProps) {
  return (
    <div className="bg-background border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <CreditCard className="h-5 w-5" />
        <h2 className="text-xl font-bold">Payment Information</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Secure Payment</p>
            <p className="text-xs text-blue-700">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
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
              {errors.cardholderName.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="cardNumber">Card Number *</Label>
          <Input
            id="cardNumber"
            {...register("cardNumber")}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
          {errors.cardNumber && (
            <p className="text-sm text-destructive mt-1">
              {errors.cardNumber.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="expiryMonth">Month *</Label>
            <Input
              id="expiryMonth"
              {...register("expiryMonth")}
              placeholder="MM"
              maxLength={2}
            />
            {errors.expiryMonth && (
              <p className="text-sm text-destructive mt-1">
                {errors.expiryMonth.message as string}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="expiryYear">Year *</Label>
            <Input
              id="expiryYear"
              {...register("expiryYear")}
              placeholder="YYYY"
              maxLength={4}
            />
            {errors.expiryYear && (
              <p className="text-sm text-destructive mt-1">
                {errors.expiryYear.message as string}
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
                {errors.cvv.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
