/**
 * ShippingAddressSection Component
 * Renders the shipping address form fields with option to use billing address
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface ShippingAddressSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  sameAsShipping: boolean;
  onSameAsShippingChange: (value: boolean) => void;
}

export function ShippingAddressSection({
  register,
  errors,
  sameAsShipping,
  onSameAsShippingChange,
}: ShippingAddressSectionProps) {
  return (
    <div className="bg-background border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="sameAsShipping"
          checked={sameAsShipping}
          onChange={(e) => onSameAsShippingChange(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="sameAsShipping" className="cursor-pointer">
          Shipping address same as billing
        </Label>
      </div>

      {!sameAsShipping && (
        <>
          <h2 className="text-xl font-bold mb-4">Shipping Address</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="shippingFullName">Full Name *</Label>
              <Input
                id="shippingFullName"
                {...register("shippingFullName")}
                placeholder="John Doe"
              />
              {errors.shippingFullName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingFullName.message as string}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="shippingAddressLine1">Address Line 1 *</Label>
              <Input
                id="shippingAddressLine1"
                {...register("shippingAddressLine1")}
                placeholder="123 Main St"
              />
              {errors.shippingAddressLine1 && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingAddressLine1.message as string}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="shippingAddressLine2">Address Line 2</Label>
              <Input
                id="shippingAddressLine2"
                {...register("shippingAddressLine2")}
                placeholder="Apt, Suite, Unit (optional)"
              />
            </div>

            <div>
              <Label htmlFor="shippingCity">City *</Label>
              <Input
                id="shippingCity"
                {...register("shippingCity")}
                placeholder="New York"
              />
              {errors.shippingCity && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingCity.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="shippingState">State/Province *</Label>
              <Input
                id="shippingState"
                {...register("shippingState")}
                placeholder="NY"
              />
              {errors.shippingState && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingState.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="shippingPostalCode">Postal Code *</Label>
              <Input
                id="shippingPostalCode"
                {...register("shippingPostalCode")}
                placeholder="10001"
              />
              {errors.shippingPostalCode && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingPostalCode.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="shippingCountry">Country *</Label>
              <Input
                id="shippingCountry"
                {...register("shippingCountry")}
                placeholder="US"
              />
              {errors.shippingCountry && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingCountry.message as string}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="shippingPhone">Phone Number *</Label>
              <Input
                id="shippingPhone"
                {...register("shippingPhone")}
                placeholder="+1 (555) 123-4567"
              />
              {errors.shippingPhone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.shippingPhone.message as string}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
