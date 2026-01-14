import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useActivities, useDeleteActivity } from '@/hooks/useActivities';
import { useAccounts } from '@/hooks/useAccounts';
import { useContacts } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityFormDialog } from './ActivityFormDialog';
import { Plus, Trash2 } from 'lucide-react';

export function ActivitiesListPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  
  const { data, isLoading, error } = useActivities();
  const { data: accountsData } = useAccounts();
  const { data: contactsData } = useContacts();
  const { data: dealsData } = useDeals();
  const deleteMutation = useDeleteActivity();

  const activities = data?.data || [];
  const accounts = accountsData?.data || [];
  const contacts = contactsData?.data || [];
  const deals = dealsData?.data || [];

  const accountsById = Object.fromEntries(accounts.map((a) => [a.id, a]));
  const contactsById = Object.fromEntries(contacts.map((c) => [c.id, c]));
  const dealsById = Object.fromEntries(deals.map((d) => [d.id, d]));

  const filteredActivities = activities.filter((activity) =>
    activity.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, subject: string | null) => {
    if (window.confirm(`Delete activity "${subject || 'Untitled'}"?`)) {
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
            <p className="text-destructive">Failed to load activities</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Track notes, calls, and meetings</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Activities</CardTitle>
          <CardDescription>
            {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading activities...</p>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {search ? 'No activities found matching your search' : 'No activities yet'}
              </p>
              {!search && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first activity
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Occurred At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => {
                  const account = activity.accountId ? accountsById[activity.accountId] : null;
                  const contact = activity.contactId ? contactsById[activity.contactId] : null;
                  const deal = activity.dealId ? dealsById[activity.dealId] : null;

                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant="outline">{activity.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{activity.subject}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {deal && (
                            <Link to={`/crm/deals/${deal.id}`} className="hover:underline">
                              {deal.name}
                            </Link>
                          )}
                          {account && (
                            <Link to={`/crm/accounts/${account.id}`} className="hover:underline text-muted-foreground">
                              {account.name}
                            </Link>
                          )}
                          {contact && (
                            <Link to={`/crm/contacts/${contact.id}`} className="hover:underline text-muted-foreground">
                              {contact.firstName} {contact.lastName}
                            </Link>
                          )}
                          {!deal && !account && !contact && '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.occurredAt
                          ? new Date(activity.occurredAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(activity.id, activity.subject)}
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

      <ActivityFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
