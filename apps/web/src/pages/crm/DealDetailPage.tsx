import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDeal, useDeleteDeal, useDealStages } from '@/hooks/useDeals';
import { useAccount } from '@/hooks/useAccounts';
import { useContact } from '@/hooks/useContacts';
import { useActivities } from '@/hooks/useActivities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealFormDialog } from './DealFormDialog';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, error } = useDeal(id);
  const deal = data?.data;

  const { data: accountData } = useAccount(deal?.accountId);
  const { data: contactData } = useContact(deal?.primaryContactId || undefined);
  const { data: stagesData } = useDealStages();
  const { data: activitiesData } = useActivities(id);

  const deleteMutation = useDeleteDeal();

  const account = accountData?.data;
  const contact = contactData?.data;
  const stages = stagesData?.data || [];
  const activities = activitiesData?.data || [];

  const stage = stages.find((s) => s.id === deal?.stageId);

  const handleDelete = async () => {
    if (!deal) return;
    if (window.confirm(`Delete deal "${deal.name}"?`)) {
      await deleteMutation.mutateAsync(deal.id);
      navigate('/crm/deals');
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
            <p className="text-destructive">Failed to load deal</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !deal) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading deal...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/crm/deals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deal.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {stage && (
                <Badge variant={stage.isClosed ? 'secondary' : 'default'}>{stage.name}</Badge>
              )}
              <span className="text-muted-foreground">
                {deal.currency} {(deal.amountCents / 100).toLocaleString()}
              </span>
            </div>
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
            <CardTitle>Deal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account</p>
              {account ? (
                <Link to={`/crm/accounts/${account.id}`} className="text-blue-600 hover:underline">
                  {account.name}
                </Link>
              ) : (
                <p>-</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Contact</p>
              {contact ? (
                <Link to={`/crm/contacts/${contact.id}`} className="text-blue-600 hover:underline">
                  {contact.firstName} {contact.lastName}
                </Link>
              ) : (
                <p>-</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expected Close Date</p>
              <p>{deal.expectedCloseDate || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>
              {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{activity.type}</Badge>
                      <p className="font-medium text-sm">{activity.subject}</p>
                    </div>
                    {activity.body && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{activity.body}</p>
                    )}
                    {activity.occurredAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.occurredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editOpen && <DealFormDialog open={editOpen} onOpenChange={setEditOpen} deal={deal} />}
    </div>
  );
}
