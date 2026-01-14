import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateActivitySchema, ActivityType } from '@one-base/shared';
import { useCreateActivity, useUpdateActivity } from '@/hooks/useActivities';
import { useAccounts } from '@/hooks/useAccounts';
import { useContacts } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: {
    id: string;
    type: ActivityType;
    subject: string;
    body?: string | null;
    occurredAt?: string | null;
    accountId?: string | null;
    contactId?: string | null;
    dealId?: string | null;
  };
}

export function ActivityFormDialog({ open, onOpenChange, activity }: ActivityFormDialogProps) {
  const isEdit = !!activity;
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity(activity?.id || '');

  const { data: accountsData } = useAccounts();
  const { data: contactsData } = useContacts();
  const { data: dealsData } = useDeals();

  const accounts = accountsData?.data || [];
  const contacts = contactsData?.data || [];
  const deals = dealsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(CreateActivitySchema),
    defaultValues: {
      type: activity?.type || ActivityType.NOTE,
      subject: activity?.subject || '',
      body: activity?.body || undefined,
      occurredAt: activity?.occurredAt || undefined,
      accountId: activity?.accountId || undefined,
      contactId: activity?.contactId || undefined,
      dealId: activity?.dealId || undefined,
    },
  });

  const type = watch('type');
  const accountId = watch('accountId');
  const contactId = watch('contactId');
  const dealId = watch('dealId');

  const onSubmit = async (data: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Activity' : 'New Activity'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update activity information' : 'Log a note, call, or meeting'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={(value) => setValue('type', value as ActivityType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ActivityType.NOTE}>Note</SelectItem>
                  <SelectItem value={ActivityType.CALL}>Call</SelectItem>
                  <SelectItem value={ActivityType.MEETING}>Meeting</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input id="subject" {...register('subject')} />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Notes</Label>
              <Textarea id="body" {...register('body')} />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="occurredAt">Occurred At</Label>
              <Input id="occurredAt" type="datetime-local" {...register('occurredAt')} />
              {errors.occurredAt && (
                <p className="text-sm text-destructive">{errors.occurredAt.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountId">Account</Label>
              <Select
                value={accountId || undefined}
                onValueChange={(value) => setValue('accountId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-destructive">{errors.accountId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactId">Contact</Label>
              <Select
                value={contactId || undefined}
                onValueChange={(value) => setValue('contactId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contactId && (
                <p className="text-sm text-destructive">{errors.contactId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dealId">Deal</Label>
              <Select
                value={dealId || undefined}
                onValueChange={(value) => setValue('dealId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dealId && (
                <p className="text-sm text-destructive">{errors.dealId.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
