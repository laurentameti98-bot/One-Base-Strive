import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateContactSchema } from '@one-base/shared';
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts';
import { useAccounts } from '@/hooks/useAccounts';
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

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    title?: string | null;
    accountId?: string | null;
  };
}

export function ContactFormDialog({ open, onOpenChange, contact }: ContactFormDialogProps) {
  const isEdit = !!contact;
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact(contact?.id || '');
  const { data: accountsData } = useAccounts();

  const accounts = accountsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(CreateContactSchema),
    defaultValues: {
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      email: contact?.email || undefined,
      phone: contact?.phone || undefined,
      title: contact?.title || undefined,
      accountId: contact?.accountId || undefined,
    },
  });

  const accountId = watch('accountId');

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
            <DialogTitle>{isEdit ? 'Edit Contact' : 'New Contact'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update contact information' : 'Create a new contact'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
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
