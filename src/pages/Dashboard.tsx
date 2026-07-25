import { useMemo } from 'react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { format } from 'date-fns';

export function Dashboard() {
  const { pallets, plankStock, palletStock, records } = useStoreContext();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayProduction = useMemo(() => {
    return records.filter(r => r.type === 'production' && r.date === today);
  }, [records, today]);

  // All unique plank keys used across all pallets, grouped by pallet
  const plankGroups = useMemo(() => {
    return pallets.map(pallet => ({
      pallet,
      planks: pallet.components,
    }));
  }, [pallets]);

  const totalPallets = useMemo(() => {
    return pallets.reduce((sum, p) => sum + (palletStock[p.id] || 0), 0);
  }, [pallets, palletStock]);

  const totalPlanks = useMemo(() => {
    return Object.values(plankStock).reduce((sum, v) => sum + v, 0);
  }, [plankStock]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={`${format(new Date(), 'EEEE, d MMMM yyyy')} — Live Stock Overview`}
      />

      <div className="flex-1 overflow-auto" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Pallet Types', value: pallets.length },
            { label: 'Total Pallet Stock', value: totalPallets },
            { label: 'Total Plank Stock', value: totalPlanks },
            { label: "Today's Production", value: todayProduction.reduce((s, r) => s + ((r.details as { qtyProduced?: number }).qtyProduced || 0), 0) },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1rem',
              }}
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.3rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', color: 'hsl(var(--foreground))', lineHeight: 1 }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Pallet Stock */}
        <section>
          <div className="section-header">Pallet Stock</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
            {pallets.map(pallet => {
              const qty = palletStock[pallet.id] || 0;
              return (
                <div
                  key={pallet.id}
                  data-testid={`pallet-stock-${pallet.id}`}
                  style={{
                    background: 'hsl(var(--card))',
                    border: qty === 0 ? '1px solid hsl(var(--border))' : '1px solid hsl(32 85% 44% / 0.3)',
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem 0.875rem',
                    borderLeft: qty > 0 ? '3px solid hsl(var(--primary))' : '3px solid hsl(var(--border))',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '0.35rem' }}>
                    {pallet.name}
                  </div>
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    fontFamily: 'IBM Plex Mono, monospace',
                    color: qty > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    lineHeight: 1,
                  }}>
                    {qty}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem' }}>units in stock</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Plank Stock */}
        <section>
          <div className="section-header">Plank Stock — by Pallet Group</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {plankGroups.map(({ pallet, planks }) => (
              <div
                key={pallet.id}
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '0.45rem 0.875rem',
                  background: 'hsl(var(--muted))',
                  borderBottom: '1px solid hsl(var(--border))',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: 'hsl(var(--foreground))',
                }}>
                  {pallet.name}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} className="dense-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Plank Size (L x W x H)</th>
                      <th style={{ textAlign: 'right' }}>Per Pallet</th>
                      <th style={{ textAlign: 'right' }}>Stock Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planks.map(comp => {
                      const qty = plankStock[comp.key] || 0;
                      return (
                        <tr key={comp.key}>
                          <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>{comp.key}</td>
                          <td style={{ textAlign: 'right', color: 'hsl(var(--muted-foreground))' }}>{comp.qty} nos</td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`qty-badge ${qty === 0 ? 'low' : ''}`} data-testid={`plank-qty-${comp.key}`}>
                              {qty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Production */}
        <section>
          <div className="section-header">Today's Production</div>
          {todayProduction.length === 0 ? (
            <div style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
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
                    <th style={{ textAlign: 'left' }}>Pallet Type</th>
                    <th style={{ textAlign: 'right' }}>Qty Produced</th>
                    <th style={{ textAlign: 'left' }}>Planks Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {todayProduction.map(r => {
                    const details = r.details as { palletName?: string; qtyProduced?: number; planksUsed?: Array<{ key: string; qty: number }> };
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{details.palletName}</td>
                        <td style={{ textAlign: 'right', color: 'hsl(var(--primary))', fontWeight: 700 }}>{details.qtyProduced}</td>
                        <td style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>
                          {details.planksUsed?.map(p => `${p.key}:${p.qty}`).join(', ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
