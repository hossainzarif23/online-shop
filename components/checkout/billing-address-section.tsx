/**
 * BillingAddressSection Component
 * Renders the billing address form fields
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface BillingAddressSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export function BillingAddressSection({
  register,
  errors,
}: BillingAddressSectionProps) {
  return (
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
              {errors.billingFullName.message as string}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="billingAddressLine1">Address Line 1 *</Label>
          <Input
            id="billingAddressLine1"
            {...register("billingAddressLine1")}
            placeholder="123 Main St"
          />
          {errors.billingAddressLine1 && (
            <p className="text-sm text-destructive mt-1">
              {errors.billingAddressLine1.message as string}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="billingAddressLine2">Address Line 2</Label>
          <Input
            id="billingAddressLine2"
            {...register("billingAddressLine2")}
            placeholder="Apt, Suite, Unit (optional)"
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
              {errors.billingCity.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="billingState">State/Province *</Label>
          <Input
            id="billingState"
            {...register("billingState")}
            placeholder="NY"
          />
          {errors.billingState && (
            <p className="text-sm text-destructive mt-1">
              {errors.billingState.message as string}
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
              {errors.billingPostalCode.message as string}
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
              {errors.billingCountry.message as string}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="billingPhone">Phone Number *</Label>
          <Input
            id="billingPhone"
            {...register("billingPhone")}
            placeholder="+1 (555) 123-4567"
          />
          {errors.billingPhone && (
            <p className="text-sm text-destructive mt-1">
              {errors.billingPhone.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
