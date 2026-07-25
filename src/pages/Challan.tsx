import { useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Printer, FileText } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const schema = z.object({
  date: z.string().min(1),
  companyName: z.string().min(1, 'Company name required'),
  vehicleNo: z.string().min(1, 'Vehicle number required'),
  materialType: z.enum(['pallet', 'plank']),
  itemId: z.string().min(1, 'Select item'),
  qty: z.coerce.number().int().positive(),
  rate: z.coerce.number().min(0),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function Challan() {
  const { pallets, plankStock, palletStock, records, profile, recordChallan, nextChallanNumber, allPlankKeys } = useStoreContext();
  const printRef = useRef<HTMLDivElement>(null);
  const [printRecord, setPrintRecord] = useState<null | ReturnType<typeof records.find>>(null);

  const challanRecords = useMemo(() => records.filter(r => r.type === 'challan').slice(0, 30), [records]);
  const existingPlankKeys = useMemo(() => allPlankKeys(), [allPlankKeys]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      companyName: '',
      vehicleNo: '',
      materialType: 'pallet',
      itemId: '',
      qty: 1,
      rate: 0,
      remarks: '',
    },
  });

  const materialType = form.watch('materialType');
  const qty = form.watch('qty') || 0;
  const rate = form.watch('rate') || 0;
  const amount = qty * rate;

  function onSubmit(data: FormData) {
    const challanNo = nextChallanNumber();
    const result = recordChallan(
      data.date, challanNo, data.companyName, data.vehicleNo,
      data.materialType, data.itemId, data.qty, data.rate, amount, data.remarks || ''
    );
    if (!result.success) {
      toast.error(result.error || 'Challan creation failed');
      return;
    }
    toast.success(`Challan #${challanNo} created for ${data.companyName}`);
    form.reset({
      date: format(new Date(), 'yyyy-MM-dd'),
      companyName: '',
      vehicleNo: '',
      materialType: 'pallet',
      itemId: '',
      qty: 1,
      rate: 0,
      remarks: '',
    });
  }

  function printChallan(record: typeof challanRecords[0]) {
    setPrintRecord(record);
    setTimeout(() => {
      window.print();
    }, 300);
  }

  const pRecord = printRecord ? printRecord.details as {
    challanNo?: number; companyName?: string; vehicleNo?: string;
    materialType?: string; itemName?: string; qty?: number; rate?: number; amount?: number; remarks?: string;
  } : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Challan" subtitle="Create outward delivery notes" />

      {/* Print view — hidden on screen, shown on print */}
      {printRecord && pRecord && (
        <div ref={printRef} className="print-only" style={{ padding: '2rem', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
            {profile.logo && <img src={profile.logo} alt="Logo" style={{ height: '60px', marginBottom: '0.5rem' }} />}
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile.companyName || 'Halol Packing'}</div>
            {profile.address && <div style={{ fontSize: '0.85rem', color: '#555' }}>{profile.address}</div>}
            {profile.phone && <div style={{ fontSize: '0.85rem', color: '#555' }}>Ph: {profile.phone}</div>}
            {profile.gst && <div style={{ fontSize: '0.85rem', color: '#555' }}>GSTIN: {profile.gst}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>DELIVERY CHALLAN</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>#{pRecord.challanNo}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>DATE</div>
              <div style={{ fontWeight: 600 }}>{printRecord.date}</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <tbody>
              {[
                ['Company', pRecord.companyName],
                ['Vehicle No.', pRecord.vehicleNo],
                ['Material', pRecord.itemName],
                ['Quantity', pRecord.qty],
                ['Rate (₹)', pRecord.rate?.toFixed(2)],
                ['Amount (₹)', pRecord.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })],
              ].map(([label, value]) => (
                <tr key={label as string}>
                  <td style={{ padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8rem', width: '180px', border: '1px solid #ccc', background: '#f5f5f5' }}>{label}</td>
                  <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: '1px solid #ccc' }}>{value}</td>
                </tr>
              ))}
              {pRecord.remarks && (
                <tr>
                  <td style={{ padding: '0.4rem 0.75rem', fontWeight: 600, fontSize: '0.8rem', border: '1px solid #ccc', background: '#f5f5f5' }}>Remarks</td>
                  <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: '1px solid #ccc' }}>{pRecord.remarks}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem', width: '150px', fontSize: '0.75rem' }}>Receiver's Sign</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #333', paddingTop: '0.5rem', width: '150px', fontSize: '0.75rem' }}>Authorised Signature</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto no-print" style={{ display: 'flex', gap: 0 }}>
        {/* Form panel */}
        <div style={{
          width: '400px', minWidth: '400px',
          borderRight: '1px solid hsl(var(--border))',
          padding: '1.25rem',
          overflowY: 'auto',
          background: 'hsl(var(--card))',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
            New Challan
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} data-testid="input-challan-date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', color: 'hsl(var(--foreground))' }}>Challan No.</div>
                  <div style={{ padding: '0.5rem 0.75rem', background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', fontFamily: 'IBM Plex Mono', fontWeight: 700, fontSize: '0.9rem' }}>
                    Auto-assigned
                  </div>
                </div>
              </div>

              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input placeholder="Buyer company name" {...field} data-testid="input-company-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="vehicleNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle No.</FormLabel>
                  <FormControl><Input placeholder="e.g. GJ-09-AB-1234" {...field} data-testid="input-vehicle-no" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="materialType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Type</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); form.setValue('itemId', ''); }} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-material-type">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pallet">Pallet</SelectItem>
                      <SelectItem value="plank">Plank</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="itemId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{materialType === 'pallet' ? 'Pallet Type' : 'Plank Size'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-item-id">
                        <SelectValue placeholder={materialType === 'pallet' ? 'Select pallet' : 'Select plank'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialType === 'pallet'
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField control={form.control} name="qty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} data-testid="input-challan-qty" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹)</FormLabel>
                    <FormControl><Input type="number" min={0} step="0.01" {...field} data-testid="input-challan-rate" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div style={{
                padding: '0.625rem 0.875rem',
                background: 'hsl(var(--muted))',
                borderRadius: 'var(--radius)',
                border: '1px solid hsl(var(--border))',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Total Amount</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <FormField control={form.control} name="remarks" render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl><Textarea placeholder="Optional notes..." rows={2} {...field} data-testid="input-remarks" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" data-testid="btn-create-challan" style={{ width: '100%' }}>
                <FileText size={14} style={{ marginRight: '0.375rem' }} />
                Create Challan
              </Button>
            </form>
          </Form>
        </div>

        {/* Challan list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
            Challan History
          </div>

          {challanRecords.length === 0 ? (
            <div style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.8rem',
            }}>
              No challans created yet.
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
                    <th style={{ textAlign: 'left' }}>Challan #</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Company</th>
                    <th style={{ textAlign: 'left' }}>Vehicle</th>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Print</th>
                  </tr>
                </thead>
                <tbody>
                  {challanRecords.map(r => {
                    const d = r.details as { challanNo?: number; companyName?: string; vehicleNo?: string; itemName?: string; qty?: number; amount?: number };
                    return (
                      <tr key={r.id} data-testid={`challan-row-${r.id}`}>
                        <td style={{ fontWeight: 700, fontFamily: 'IBM Plex Mono', color: 'hsl(var(--primary))' }}>#{d.challanNo}</td>
                        <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.date}</td>
                        <td style={{ fontWeight: 500 }}>{d.companyName}</td>
                        <td style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.75rem' }}>{d.vehicleNo}</td>
                        <td>{d.itemName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{d.qty}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{d.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => printChallan(r)}
                            data-testid={`btn-print-${r.id}`}
                            style={{
                              background: 'transparent',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: 'var(--radius)',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              color: 'hsl(var(--muted-foreground))',
                              display: 'flex', alignItems: 'center', gap: '0.25rem',
                              fontSize: '0.7rem',
                              margin: '0 auto',
                            }}
                          >
                            <Printer size={12} />
                            Print
                          </button>
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
