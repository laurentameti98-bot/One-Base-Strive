import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateInvoiceSchema,
  InvoiceStatus,
  type Invoice,
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
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useInvoiceCustomers } from "../../hooks/useInvoiceCustomers";

type FormData = z.infer<typeof CreateInvoiceSchema>;

interface InvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  initialData?: Invoice & { items: any[] };
  isLoading?: boolean;
}

export function InvoiceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: InvoiceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues: {
      customerId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "draft",
      currency: "EUR",
      notes: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPriceCents: 0,
          taxRateBps: 1900,
          sortOrder: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const { data: customersData } = useInvoiceCustomers({ limit: 100 });
  const customers = customersData?.data || [];

  useEffect(() => {
    if (initialData && open) {
      reset({
        customerId: initialData.customerId,
        issueDate: initialData.issueDate,
        dueDate: initialData.dueDate || "",
        status: initialData.status,
        currency: initialData.currency,
        notes: initialData.notes || "",
        items: initialData.items.map((item, idx) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          taxRateBps: item.taxRateBps,
          sortOrder: item.sortOrder || idx + 1,
        })),
      });
    } else if (!initialData && open) {
      reset({
        customerId: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        status: "draft",
        currency: "EUR",
        notes: "",
        items: [
          {
            description: "",
            quantity: 1,
            unitPriceCents: 0,
            taxRateBps: 1900,
            sortOrder: 1,
          },
        ],
      });
    }
  }, [initialData, reset, open]);

  const customerId = watch("customerId");
  const status = watch("status");
  const items = watch("items");

  const computedSubtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPriceCents || 0),
    0
  );
  const computedTax = items.reduce(
    (sum, item) =>
      sum +
      ((item.quantity || 0) *
        (item.unitPriceCents || 0) *
        (item.taxRateBps || 0)) /
        10000,
    0
  );
  const computedTotal = computedSubtotal + computedTax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Invoice" : "New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                value={customerId}
                onValueChange={(value) => setValue("customerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-500">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
              {errors.issueDate && (
                <p className="text-sm text-red-500">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register("currency")}
                placeholder="EUR"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-lg">Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    description: "",
                    quantity: 1,
                    unitPriceCents: 0,
                    taxRateBps: 1900,
                    sortOrder: fields.length + 1,
                  })
                }
              >
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-start"
                >
                  <div className="col-span-4">
                    <Input
                      placeholder="Description"
                      {...register(`items.${index}.description`)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Price (cents)"
                      {...register(`items.${index}.unitPriceCents`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Tax (bps)"
                      {...register(`items.${index}.taxRateBps`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="col-span-2 flex gap-1">
                    <Input
                      type="number"
                      placeholder="Order"
                      {...register(`items.${index}.sortOrder`, {
                        valueAsNumber: true,
                      })}
                      className="w-16"
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground space-y-1 pt-2">
              <p>Subtotal: €{(computedSubtotal / 100).toFixed(2)}</p>
              <p>Tax: €{(computedTax / 100).toFixed(2)}</p>
              <p className="font-semibold text-foreground">
                Total: €{(computedTotal / 100).toFixed(2)}
              </p>
              <p className="text-xs">
                (Server will recalculate final totals)
              </p>
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
