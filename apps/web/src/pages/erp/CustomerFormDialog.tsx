import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateInvoiceCustomerSchema,
  type InvoiceCustomer,
} from "@one-base/shared";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAccounts } from "../../hooks/useAccounts";

type FormData = z.infer<typeof CreateInvoiceCustomerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  initialData?: InvoiceCustomer;
  isLoading?: boolean;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: CustomerFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(CreateInvoiceCustomerSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          accountId: initialData.accountId || undefined,
          email: initialData.email || undefined,
          phone: initialData.phone || undefined,
          vatId: initialData.vatId || undefined,
          billingAddressLine1: initialData.billingAddressLine1 || undefined,
          billingAddressLine2: initialData.billingAddressLine2 || undefined,
          billingPostalCode: initialData.billingPostalCode || undefined,
          billingCity: initialData.billingCity || undefined,
          billingCountry: initialData.billingCountry || undefined,
        }
      : {},
  });

  const { data: accountsData } = useAccounts();
  const accounts = accountsData?.data || [];

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        accountId: initialData.accountId || undefined,
        email: initialData.email || undefined,
        phone: initialData.phone || undefined,
        vatId: initialData.vatId || undefined,
        billingAddressLine1: initialData.billingAddressLine1 || undefined,
        billingAddressLine2: initialData.billingAddressLine2 || undefined,
        billingPostalCode: initialData.billingPostalCode || undefined,
        billingCity: initialData.billingCity || undefined,
        billingCountry: initialData.billingCountry || undefined,
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [initialData, reset, open]);

  const accountId = watch("accountId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Customer" : "New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vatId">VAT ID</Label>
              <Input id="vatId" {...register("vatId")} />
              {errors.vatId && (
                <p className="text-sm text-red-500">{errors.vatId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="accountId">Linked CRM Account (optional)</Label>
              <Select
                value={accountId || "none"}
                onValueChange={(value) => setValue("accountId", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Billing Address</Label>
            <Input
              placeholder="Address Line 1"
              {...register("billingAddressLine1")}
            />
            <Input
              placeholder="Address Line 2"
              {...register("billingAddressLine2")}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Postal Code"
                {...register("billingPostalCode")}
              />
              <Input placeholder="City" {...register("billingCity")} />
              <Input placeholder="Country" {...register("billingCountry")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
