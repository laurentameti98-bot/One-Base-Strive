import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { useContacts } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccountFormDialog } from './AccountFormDialog';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, error } = useAccount(id);
  const { data: contactsData } = useContacts(id);
  const { data: dealsData } = useDeals();
  const deleteMutation = useDeleteAccount();

  const account = data?.data;
  const contacts = contactsData?.data || [];
  const deals = (dealsData?.data || []).filter((deal) => deal.accountId === id);

  const handleDelete = async () => {
    if (!account) return;
    if (window.confirm(`Delete account "${account.name}"?`)) {
      await deleteMutation.mutateAsync(account.id);
      navigate('/crm/accounts');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Failed to load account</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !account) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/crm/accounts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">{account.industry || 'No industry'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Website</p>
              {account.website ? (
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {account.website}
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{account.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="whitespace-pre-wrap">{account.notes || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Contacts</CardTitle>
            <CardDescription>{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex justify-between items-center">
                    <Link
                      to={`/crm/contacts/${contact.id}`}
                      className="hover:underline"
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>
                    <span className="text-sm text-muted-foreground">{contact.title || '-'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related Deals</CardTitle>
          <CardDescription>{deals.length} deal{deals.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deals yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Expected Close</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Link to={`/crm/deals/${deal.id}`} className="hover:underline">
                        {deal.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {deal.currency} {(deal.amountCents / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>{deal.expectedCloseDate || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editOpen && (
        <AccountFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          account={account}
        />
      )}
    </div>
  );
}
