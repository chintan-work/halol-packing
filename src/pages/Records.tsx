import { useState, useMemo, Fragment } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { TypeBadge } from '@/components/TypeBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecordType } from '@/store/types';

export function Records() {
  const { records } = useStoreContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      return true;
    });
  }, [records, filterType, fromDate, toDate]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Records" subtitle="Complete transaction log" />

      {/* Filters */}
      <div style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--card))',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>Filter by:</div>

        <Select value={filterType} onValueChange={(v) => setFilterType(v as RecordType | 'all')}>
          <SelectTrigger style={{ width: '160px', height: '32px', fontSize: '0.78rem' }} data-testid="filter-type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vendor_inward">Vendor Inward</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="challan">Challan</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>From</span>
          <Input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ width: '140px', height: '32px', fontSize: '0.78rem' }}
            data-testid="filter-from-date"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>To</span>
          <Input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ width: '140px', height: '32px', fontSize: '0.78rem' }}
            data-testid="filter-to-date"
          />
        </div>

        <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', marginLeft: 'auto' }}>
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </div>

        {(filterType !== 'all' || fromDate || toDate) && (
          <button
            onClick={() => { setFilterType('all'); setFromDate(''); setToDate(''); }}
            data-testid="btn-clear-filters"
            style={{
              fontSize: '0.72rem', padding: '0.25rem 0.625rem',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Records list */}
      <div className="flex-1 overflow-auto" style={{ padding: '0' }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'hsl(var(--muted-foreground))',
            fontSize: '0.8rem',
          }}>
            No records match the current filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="dense-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ textAlign: 'left', width: '24px' }}></th>
                <th style={{ textAlign: 'left' }}>Date</th>
                <th style={{ textAlign: 'left' }}>Type</th>
                <th style={{ textAlign: 'left' }}>Description</th>
                <th style={{ textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isExpanded = expandedId === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      style={{ cursor: 'pointer' }}
                      data-testid={`record-row-${r.id}`}
                    >
                      <td style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </td>
                      <td style={{ color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>{r.date}</td>
                      <td><TypeBadge type={r.type} /></td>
                      <td style={{ fontWeight: 500 }}>{r.description}</td>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.72rem', fontFamily: 'IBM Plex Mono' }}>
                        {format(new Date(r.createdAt), 'HH:mm:ss')}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} style={{ padding: '0', border: 'none' }}>
                          <div style={{
                            padding: '0.75rem 1.5rem 0.75rem 2.5rem',
                            background: 'hsl(var(--muted) / 0.5)',
                            borderBottom: '1px solid hsl(var(--border))',
                          }}>
                            <div style={{ fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                              Details
                            </div>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                              {Object.entries(r.details).map(([key, val]) => (
                                <div key={key} style={{ minWidth: '120px' }}>
                                  <div style={{ fontSize: '0.67rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 500, fontFamily: 'IBM Plex Mono', marginTop: '0.1rem' }}>
                                    {Array.isArray(val)
                                      ? (val as Array<{ key: string; qty: number }>).map(v => `${v.key}:${v.qty}`).join(', ')
                                      : String(val)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
