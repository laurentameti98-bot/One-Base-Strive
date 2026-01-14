import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountFormDialog } from './AccountFormDialog';
import { Plus, Trash2 } from 'lucide-react';

export function AccountsListPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, error } = useAccounts();
  const deleteMutation = useDeleteAccount();

  const accounts = data?.data || [];
  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete account "${name}"?`)) {
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
            <p className="text-destructive">Failed to load accounts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading accounts...</p>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {search ? 'No accounts found matching your search' : 'No accounts yet'}
              </p>
              {!search && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first account
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Link
                        to={`/crm/accounts/${account.id}`}
                        className="font-medium hover:underline"
                      >
                        {account.name}
                      </Link>
                    </TableCell>
                    <TableCell>{account.industry || '-'}</TableCell>
                    <TableCell>
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
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{account.phone || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id, account.name)}
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

      <AccountFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
