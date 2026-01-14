import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInvoices,
  useCreateInvoice,
  useDeleteInvoice,
} from "../../hooks/useInvoices";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { InvoiceFormDialog } from "./InvoiceFormDialog";

export function InvoicesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useInvoices({
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const createMutation = useCreateInvoice();
  const deleteMutation = useDeleteInvoice();

  const invoices = data?.data || [];

  const handleCreate = () => {
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      const result = await createMutation.mutateAsync(formData);
      setDialogOpen(false);
      navigate(`/erp/invoices/${result.data.invoice.id}`);
    } catch (err) {
      console.error("Failed to create invoice:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this invoice?")) {
      try {
        await deleteMutation.mutateAsync(id);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage invoices and billing
          </p>
        </div>
        <Button onClick={handleCreate}>New Invoice</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            <div className="flex gap-4 items-center mt-2">
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error loading invoices</p>}
          {!isLoading && !error && invoices.length === 0 && (
            <p className="text-muted-foreground">No invoices found</p>
          )}
          {!isLoading && !error && invoices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/erp/invoices/${invoice.id}`)}
                  >
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {invoice.customerName || <span className="text-muted-foreground italic">No customer</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.totalCents)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
