import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInvoiceCustomers,
  useCreateInvoiceCustomer,
  useUpdateInvoiceCustomer,
  useDeleteInvoiceCustomer,
} from "../../hooks/useInvoiceCustomers";
import type { InvoiceCustomer } from "@one-base/shared";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { CustomerFormDialog } from "./CustomerFormDialog";

export function CustomersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<
    InvoiceCustomer | undefined
  >();

  const { data, isLoading, error } = useInvoiceCustomers({ search });
  const createMutation = useCreateInvoiceCustomer();
  const updateMutation = useUpdateInvoiceCustomer();
  const deleteMutation = useDeleteInvoiceCustomer();

  const customers = data?.data || [];

  const handleCreate = () => {
    setEditingCustomer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customer: InvoiceCustomer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          id: editingCustomer.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setDialogOpen(false);
      setEditingCustomer(undefined);
    } catch (err) {
      console.error("Failed to save customer:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this customer?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error("Failed to delete customer:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage invoice customers and billing information
          </p>
        </div>
        <Button onClick={handleCreate}>New Customer</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            <div className="flex gap-4 items-center mt-2">
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error loading customers</p>}
          {!isLoading && !error && customers.length === 0 && (
            <p className="text-muted-foreground">No customers found</p>
          )}
          {!isLoading && !error && customers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>VAT ID</TableHead>
                  <TableHead>Linked Account</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.vatId || "-"}</TableCell>
                    <TableCell>
                      {customer.accountId ? (
                        <span className="text-sm text-muted-foreground">
                          Linked
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
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

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingCustomer}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
