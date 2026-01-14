import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from "../../hooks/useInvoices";
import { UpdateInvoiceSchema, type InvoiceItem } from "@one-base/shared";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { InvoiceFormDialog } from "./InvoiceFormDialog";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useInvoice(id);
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading invoice</div>;
  if (!data) return <div>Invoice not found</div>;

  const invoice = data.data;
  const items = invoice.items || [];

  const handleEdit = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: z.infer<typeof UpdateInvoiceSchema>) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to update invoice:", err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Delete this invoice?")) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate("/erp/invoices");
      } catch (err) {
        console.error("Failed to delete invoice:", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "outline",
      sent: "secondary",
      paid: "default",
      void: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const formatTaxRate = (bps: number) => {
    return `${(bps / 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">Invoice details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/erp/invoices")}>
            Back
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>{" "}
              {getStatusBadge(invoice.status)}
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Invoice Number:
              </span>{" "}
              {invoice.invoiceNumber}
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Issue Date:
              </span>{" "}
              {new Date(invoice.issueDate).toLocaleDateString()}
            </div>
            {invoice.dueDate && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Due Date:
                </span>{" "}
                {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Currency:</span>{" "}
              {invoice.currency}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{invoice.customerName || "-"}</p>
          </CardContent>
        </Card>
      </div>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Invoice line items</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">No items</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax Rate</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: InvoiceItem) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPriceCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTaxRate(item.taxRateBps)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.lineTotalCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(invoice.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax:</span>
            <span>{formatCurrency(invoice.taxCents)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(invoice.totalCents)}</span>
          </div>
        </CardContent>
      </Card>

      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={{ ...invoice, items }}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
