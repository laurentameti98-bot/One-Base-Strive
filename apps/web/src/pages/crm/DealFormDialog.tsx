import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateDealSchema, DEFAULT_CURRENCY } from '@one-base/shared';
import { useCreateDeal, useUpdateDeal, useDealStages } from '@/hooks/useDeals';
import { useAccounts } from '@/hooks/useAccounts';
import { useContacts } from '@/hooks/useContacts';
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

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: {
    id: string;
    name: string;
    accountId: string;
    stageId: string;
    amountCents: number;
    currency: string;
    expectedCloseDate?: string | null;
    primaryContactId?: string | null;
  };
}

export function DealFormDialog({ open, onOpenChange, deal }: DealFormDialogProps) {
  const isEdit = !!deal;
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal(deal?.id || '');
  
  const { data: stagesData } = useDealStages();
  const { data: accountsData } = useAccounts();
  const { data: contactsData } = useContacts();

  const stages = stagesData?.data || [];
  const accounts = accountsData?.data || [];
  const contacts = contactsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(CreateDealSchema),
    defaultValues: {
      name: deal?.name || '',
      accountId: deal?.accountId || '',
      stageId: deal?.stageId || stages[0]?.id || '',
      amountCents: deal ? deal.amountCents : 0,
      currency: deal?.currency || DEFAULT_CURRENCY,
      expectedCloseDate: deal?.expectedCloseDate || undefined,
      primaryContactId: deal?.primaryContactId || undefined,
    },
  });

  const accountId = watch('accountId');
  const stageId = watch('stageId');
  const primaryContactId = watch('primaryContactId');

  // Filter contacts by selected account
  const filteredContacts = accountId
    ? contacts.filter((c) => c.accountId === accountId)
    : contacts;

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
            <DialogTitle>{isEdit ? 'Edit Deal' : 'New Deal'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update deal information' : 'Create a new sales opportunity'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Deal Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountId">
                Account <span className="text-destructive">*</span>
              </Label>
              <Select value={accountId} onValueChange={(value) => setValue('accountId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
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
              <Label htmlFor="stageId">
                Stage <span className="text-destructive">*</span>
              </Label>
              <Select value={stageId} onValueChange={(value) => setValue('stageId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stageId && (
                <p className="text-sm text-destructive">{errors.stageId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primaryContactId">Primary Contact</Label>
              <Select
                value={primaryContactId || undefined}
                onValueChange={(value) => setValue('primaryContactId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {filteredContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryContactId && (
                <p className="text-sm text-destructive">{errors.primaryContactId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amountCents">
                  Amount (cents) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amountCents"
                  type="number"
                  {...register('amountCents', { valueAsNumber: true })}
                />
                {errors.amountCents && (
                  <p className="text-sm text-destructive">{errors.amountCents.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" {...register('currency')} defaultValue={DEFAULT_CURRENCY} />
                {errors.currency && (
                  <p className="text-sm text-destructive">{errors.currency.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input id="expectedCloseDate" type="date" {...register('expectedCloseDate')} />
              {errors.expectedCloseDate && (
                <p className="text-sm text-destructive">{errors.expectedCloseDate.message}</p>
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
