import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAccountSchema } from '@one-base/shared';
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccounts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: {
    id: string;
    name: string;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
    notes?: string | null;
  };
}

export function AccountFormDialog({ open, onOpenChange, account }: AccountFormDialogProps) {
  const isEdit = !!account;
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount(account?.id || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      name: account?.name || '',
      industry: account?.industry || undefined,
      website: account?.website || undefined,
      phone: account?.phone || undefined,
      notes: account?.notes || undefined,
    },
  });

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
            <DialogTitle>{isEdit ? 'Edit Account' : 'New Account'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update account information' : 'Create a new customer account'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register('industry')} />
              {errors.industry && (
                <p className="text-sm text-destructive">{errors.industry.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://..." {...register('website')} />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
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
