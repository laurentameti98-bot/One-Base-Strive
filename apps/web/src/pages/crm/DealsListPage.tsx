import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeals, useDeleteDeal, useDealStages } from '@/hooks/useDeals';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealFormDialog } from './DealFormDialog';
import { Plus, Trash2 } from 'lucide-react';

export function DealsListPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, error } = useDeals();
  const { data: stagesData } = useDealStages();
  const { data: accountsData } = useAccounts();
  const deleteMutation = useDeleteDeal();

  const deals = data?.data || [];
  const stages = stagesData?.data || [];
  const accounts = accountsData?.data || [];
  
  const stagesById = Object.fromEntries(stages.map((s) => [s.id, s]));
  const accountsById = Object.fromEntries(accounts.map((a) => [a.id, a]));

  const filteredDeals = deals.filter((deal) =>
    deal.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete deal "${name}"?`)) {
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
            <p className="text-destructive">Failed to load deals</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">Manage your sales opportunities</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
          <CardDescription>
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading deals...</p>
          ) : filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {search ? 'No deals found matching your search' : 'No deals yet'}
              </p>
              {!search && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first deal
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => {
                  const stage = stagesById[deal.stageId];
                  const account = accountsById[deal.accountId];
                  
                  return (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <Link
                          to={`/crm/deals/${deal.id}`}
                          className="font-medium hover:underline"
                        >
                          {deal.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {account ? (
                          <Link
                            to={`/crm/accounts/${account.id}`}
                            className="hover:underline"
                          >
                            {account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {stage ? (
                          <Badge variant={stage.isClosed ? 'secondary' : 'default'}>
                            {stage.name}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.currency} {(deal.amountCents / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>{deal.expectedCloseDate || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(deal.id, deal.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DealFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
