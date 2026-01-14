import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContacts, useDeleteContact } from '@/hooks/useContacts';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactFormDialog } from './ContactFormDialog';
import { Plus, Trash2 } from 'lucide-react';

export function ContactsListPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, error } = useContacts();
  const { data: accountsData } = useAccounts();
  const deleteMutation = useDeleteContact();

  const contacts = data?.data || [];
  const accounts = accountsData?.data || [];
  const accountsById = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete contact "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
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
            <p className="text-destructive">Failed to load contacts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your customer contacts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading contacts...</p>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {search ? 'No contacts found matching your search' : 'No contacts yet'}
              </p>
              {!search && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first contact
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Link
                        to={`/crm/contacts/${contact.id}`}
                        className="font-medium hover:underline"
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>{contact.title || '-'}</TableCell>
                    <TableCell>
                      {contact.accountId && accountsById[contact.accountId] ? (
                        <Link
                          to={`/crm/accounts/${contact.accountId}`}
                          className="hover:underline"
                        >
                          {accountsById[contact.accountId].name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`)
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ContactFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
