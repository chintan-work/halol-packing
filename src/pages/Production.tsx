import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Hammer } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  date: z.string().min(1),
  palletId: z.string().min(1, 'Select a pallet type'),
  qty: z.coerce.number().int().positive('Quantity must be at least 1'),
});

type FormData = z.infer<typeof schema>;

export function Production() {
  const { pallets, plankStock, records, recordProduction } = useStoreContext();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayRecords = useMemo(
    () => records.filter(r => r.type === 'production' && r.date === today),
    [records, today]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: today,
      palletId: '',
      qty: 1,
    },
  });

  const watchedPalletId = form.watch('palletId');
  const watchedQty = form.watch('qty') || 1;
  const selectedPallet = useMemo(() => pallets.find(p => p.id === watchedPalletId), [pallets, watchedPalletId]);

  function onSubmit(data: FormData) {
    const result = recordProduction(data.date, data.palletId, data.qty);
    if (!result.success) {
      toast.error(result.error || 'Production failed');
      return;
    }
    const pallet = pallets.find(p => p.id === data.palletId);
    toast.success(`Produced ${data.qty} units of ${pallet?.name}`);
    form.reset({ date: today, palletId: '', qty: 1 });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Production" subtitle="Record pallet manufacturing output" />

      <div className="flex-1 overflow-auto" style={{ display: 'flex', gap: 0 }}>
        {/* Form panel */}
        <div style={{
          width: '380px', minWidth: '380px',
          borderRight: '1px solid hsl(var(--border))',
          padding: '1.25rem',
          overflowY: 'auto',
          background: 'hsl(var(--card))',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
            Record Production
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} data-testid="input-prod-date" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="palletId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pallet Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-pallet-type">
                        <SelectValue placeholder="Select pallet type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pallets.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="qty" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Produced</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} data-testid="input-prod-qty" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Plank consumption preview */}
              {selectedPallet && (
                <div style={{
                  background: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', borderBottom: '1px solid hsl(var(--border))' }}>
                    Planks to be consumed
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }} className="dense-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Plank</th>
                        <th style={{ textAlign: 'right' }}>Need</th>
                        <th style={{ textAlign: 'right' }}>Have</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPallet.components.map(comp => {
                        const needed = comp.qty * watchedQty;
                        const have = plankStock[comp.key] || 0;
                        const ok = have >= needed;
                        return (
                          <tr key={comp.key}>
                            <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{comp.key}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: ok ? 'hsl(var(--foreground))' : 'hsl(0 72% 44%)' }}>{needed}</td>
                            <td style={{ textAlign: 'right', color: ok ? 'hsl(168 62% 32%)' : 'hsl(0 72% 44%)' }}>{have}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <Button type="submit" data-testid="btn-submit-production" style={{ width: '100%' }}>
                <Hammer size={14} style={{ marginRight: '0.375rem' }} />
                Record Production
              </Button>
            </form>
          </Form>
        </div>

        {/* Today's production */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
            Today's Production — {format(new Date(), 'dd MMM yyyy')}
          </div>

          {todayRecords.length === 0 ? (
            <div style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.8rem',
            }}>
              No production recorded today.
            </div>
          ) : (
            <div style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }} className="dense-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Pallet Type</th>
                    <th style={{ textAlign: 'right' }}>Qty Produced</th>
                    <th style={{ textAlign: 'left' }}>Planks Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRecords.map(r => {
                    const d = r.details as { palletName?: string; qtyProduced?: number; planksUsed?: Array<{ key: string; qty: number }> };
                    return (
                      <tr key={r.id} data-testid={`prod-record-${r.id}`}>
                        <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.date}</td>
                        <td style={{ fontWeight: 600 }}>{d.palletName}</td>
                        <td style={{ textAlign: 'right', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '1rem' }}>{d.qtyProduced}</td>
                        <td style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                          {d.planksUsed?.map(p => `${p.key}:${p.qty}`).join(' | ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
