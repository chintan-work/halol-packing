import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SlidersHorizontal } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  date: z.string().min(1),
  adjType: z.enum(['add', 'deduct']),
  material: z.enum(['plank', 'pallet']),
  itemId: z.string().min(1, 'Select an item'),
  qty: z.coerce.number().int().positive(),
  reason: z.string().min(1, 'Reason required'),
});

type FormData = z.infer<typeof schema>;

export function Adjustment() {
  const { pallets, plankStock, palletStock, records, recordAdjustment, allPlankKeys } = useStoreContext();
  const existingPlankKeys = useMemo(() => allPlankKeys(), [allPlankKeys]);

  const adjRecords = useMemo(
    () => records.filter(r => r.type === 'adjustment').slice(0, 20),
    [records]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      adjType: 'deduct',
      material: 'plank',
      itemId: '',
      qty: 1,
      reason: '',
    },
  });

  const material = form.watch('material');

  function onSubmit(data: FormData) {
    const result = recordAdjustment(data.date, data.adjType, data.material, data.itemId, data.qty, data.reason);
    if (!result.success) {
      toast.error(result.error || 'Adjustment failed');
      return;
    }
    const action = data.adjType === 'add' ? 'Added' : 'Deducted';
    toast.success(`${action} ${data.qty} units — ${data.reason}`);
    form.reset({
      date: format(new Date(), 'yyyy-MM-dd'),
      adjType: data.adjType,
      material: data.material,
      itemId: '',
      qty: 1,
      reason: '',
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Adjustment" subtitle="Damaged, rejected, or miscellaneous corrections" />

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
            New Adjustment
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} data-testid="input-adj-date" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField control={form.control} name="adjType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-adj-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="add">Add</SelectItem>
                        <SelectItem value="deduct">Deduct</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="material" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={(v) => { field.onChange(v); form.setValue('itemId', ''); }} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-material">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="plank">Plank</SelectItem>
                        <SelectItem value="pallet">Pallet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="itemId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{material === 'pallet' ? 'Pallet Type' : 'Plank Size'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-adj-item">
                        <SelectValue placeholder={`Select ${material}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {material === 'pallet'
                        ? pallets.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — stock: {palletStock[p.id] || 0}
                          </SelectItem>
                        ))
                        : existingPlankKeys.map(k => (
                          <SelectItem key={k} value={k}>
                            {k} — stock: {plankStock[k] || 0}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="qty" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} data-testid="input-adj-qty" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl><Input placeholder="e.g. Damaged in transit, Quality reject" {...field} data-testid="input-adj-reason" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" data-testid="btn-submit-adjustment" style={{ width: '100%' }}>
                <SlidersHorizontal size={14} style={{ marginRight: '0.375rem' }} />
                Record Adjustment
              </Button>
            </form>
          </Form>
        </div>

        {/* Adjustment log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
            Recent Adjustments
          </div>

          {adjRecords.length === 0 ? (
            <div style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.8rem',
            }}>
              No adjustments recorded yet.
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
                    <th style={{ textAlign: 'left' }}>Type</th>
                    <th style={{ textAlign: 'left' }}>Material</th>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'left' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {adjRecords.map(r => {
                    const d = r.details as { adjType?: string; material?: string; itemName?: string; qty?: number; reason?: string };
                    const isAdd = d.adjType === 'add';
                    return (
                      <tr key={r.id} data-testid={`adj-row-${r.id}`}>
                        <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.date}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
                              textTransform: 'uppercase', padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              background: isAdd ? 'hsl(168 62% 38% / 0.12)' : 'hsl(0 72% 48% / 0.12)',
                              color: isAdd ? 'hsl(168 62% 30%)' : 'hsl(0 72% 40%)',
                            }}
                          >
                            {d.adjType}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize', color: 'hsl(var(--muted-foreground))' }}>{d.material}</td>
                        <td style={{ fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>{d.itemName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: isAdd ? 'hsl(168 62% 30%)' : 'hsl(0 72% 40%)' }}>
                          {isAdd ? '+' : '-'}{d.qty}
                        </td>
                        <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>{d.reason}</td>
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
