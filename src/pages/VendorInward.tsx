import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  date: z.string().min(1, 'Date required'),
  vendorName: z.string().min(1, 'Vendor name required'),
  plankKey: z.string().min(1, 'Plank size required'),
  newPlankKey: z.string().optional(),
  qty: z.coerce.number().int().positive('Must be positive'),
  rate: z.coerce.number().positive('Must be positive'),
});

type FormData = z.infer<typeof schema>;

export function VendorInward() {
  const { records, plankStock, vendorInward, allPlankKeys } = useStoreContext();
  const [useNewSize, setUseNewSize] = useState(false);

  const existingKeys = useMemo(() => allPlankKeys(), [allPlankKeys]);

  const recentRecords = useMemo(
    () => records.filter(r => r.type === 'vendor_inward').slice(0, 20),
    [records]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      vendorName: '',
      plankKey: '',
      newPlankKey: '',
      qty: 0,
      rate: 0,
    },
  });

  const qty = form.watch('qty') || 0;
  const rate = form.watch('rate') || 0;
  const amount = qty * rate;

  function onSubmit(data: FormData) {
    const plankKey = useNewSize ? (data.newPlankKey || '').trim() : data.plankKey;
    if (!plankKey) {
      toast.error('Please enter or select a plank size');
      return;
    }
    vendorInward(data.date, data.vendorName, plankKey, data.qty, data.rate, amount);
    toast.success(`Added ${data.qty} units of ${plankKey} to plank stock`);
    form.reset({
      date: format(new Date(), 'yyyy-MM-dd'),
      vendorName: data.vendorName,
      plankKey: '',
      newPlankKey: '',
      qty: 0,
      rate: 0,
    });
    setUseNewSize(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Vendor Inward" subtitle="Record incoming plank material from vendors" />

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
            New Inward Entry
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mehta Timber Co." {...field} data-testid="input-vendor-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plank size */}
              <div>
                <Label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Plank Size (L x W x H)</Label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setUseNewSize(false)}
                    style={{
                      fontSize: '0.7rem', padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid hsl(var(--border))',
                      background: !useNewSize ? 'hsl(var(--primary))' : 'transparent',
                      color: !useNewSize ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                    data-testid="btn-existing-size"
                  >
                    Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseNewSize(true)}
                    style={{
                      fontSize: '0.7rem', padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid hsl(var(--border))',
                      background: useNewSize ? 'hsl(var(--primary))' : 'transparent',
                      color: useNewSize ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                    data-testid="btn-new-size"
                  >
                    New Size
                  </button>
                </div>

                {!useNewSize ? (
                  <FormField
                    control={form.control}
                    name="plankKey"
                    render={({ field }) => (
                      <FormItem style={{ marginTop: '0.5rem' }}>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-plank-key">
                              <SelectValue placeholder="Select plank size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {existingKeys.map(k => (
                              <SelectItem key={k} value={k}>
                                {k} — stock: {plankStock[k] || 0}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="newPlankKey"
                    render={({ field }) => (
                      <FormItem style={{ marginTop: '0.5rem' }}>
                        <FormControl>
                          <Input placeholder="e.g. 48x4x1.5" {...field} data-testid="input-new-plank-key" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField
                  control={form.control}
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-qty" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (per unit)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} data-testid="input-rate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Amount */}
              <div style={{
                padding: '0.625rem 0.875rem',
                background: 'hsl(var(--muted))',
                borderRadius: 'var(--radius)',
                border: '1px solid hsl(var(--border))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Total Amount</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', color: 'hsl(var(--foreground))' }}>
                  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <Button type="submit" data-testid="btn-submit-inward" style={{ width: '100%', marginTop: '0.25rem' }}>
                <Plus size={14} style={{ marginRight: '0.375rem' }} />
                Record Inward Entry
              </Button>
            </form>
          </Form>
        </div>

        {/* Records table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
            Recent Inward Entries
          </div>

          {recentRecords.length === 0 ? (
            <div style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.8rem',
            }}>
              No inward entries yet. Add your first entry using the form.
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
                    <th style={{ textAlign: 'left' }}>Vendor</th>
                    <th style={{ textAlign: 'left' }}>Plank</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map(r => {
                    const d = r.details as { vendorName?: string; plankKey?: string; qty?: number; rate?: number; amount?: number };
                    return (
                      <tr key={r.id} data-testid={`record-inward-${r.id}`}>
                        <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.date}</td>
                        <td style={{ fontWeight: 500 }}>{d.vendorName}</td>
                        <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>{d.plankKey}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'hsl(168 62% 32%)' }}>{d.qty}</td>
                        <td style={{ textAlign: 'right', color: 'hsl(var(--muted-foreground))' }}>₹{d.rate?.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{d.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
