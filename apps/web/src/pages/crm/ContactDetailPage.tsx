import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContact, useDeleteContact } from '@/hooks/useContacts';
import { useAccount } from '@/hooks/useAccounts';
import { useActivities } from '@/hooks/useActivities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContactFormDialog } from './ContactFormDialog';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, error } = useContact(id);
  const contact = data?.data;
  
  const { data: accountData } = useAccount(contact?.accountId || undefined);
  const { data: activitiesData } = useActivities(undefined, undefined, id);
  
  const deleteMutation = useDeleteContact();

  const account = accountData?.data;
  const activities = activitiesData?.data || [];

  const handleDelete = async () => {
    if (!contact) return;
    if (window.confirm(`Delete contact "${contact.firstName} ${contact.lastName}"?`)) {
      await deleteMutation.mutateAsync(contact.id);
      navigate('/crm/contacts');
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
            <p className="text-destructive">Failed to load contact</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !contact) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading contact...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/crm/contacts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-muted-foreground">{contact.title || 'No title'}</p>
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
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                  {contact.email}
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{contact.phone || '-'}</p>
            </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{activity.type}</Badge>
                      <p className="font-medium text-sm">{activity.subject}</p>
                    </div>
                    {activity.body && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{activity.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editOpen && <ContactFormDialog open={editOpen} onOpenChange={setEditOpen} contact={contact} />}
    </div>
  );
}
