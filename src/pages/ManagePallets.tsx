import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PalletType, PlankComponent } from '@/store/types';

function genId() {
  return `pallet-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

interface PlankRow {
  id: string;
  length: string;
  width: string;
  height: string;
  qty: string;
  useNewSize: boolean;
  newKey: string;
  existingKey: string;
}

function emptyRow(): PlankRow {
  return {
    id: Math.random().toString(36).slice(2),
    length: '', width: '', height: '', qty: '',
    useNewSize: true, newKey: '', existingKey: '',
  };
}

function rowToComponent(row: PlankRow, existingKeys: string[]): PlankComponent | null {
  try {
    if (!row.useNewSize && row.existingKey) {
      const parts = row.existingKey.split('x');
      if (parts.length !== 3) return null;
      const qty = parseInt(row.qty);
      if (!qty || qty <= 0) return null;
      return {
        key: row.existingKey,
        length: parseFloat(parts[0]),
        width: parseFloat(parts[1]),
        height: parseFloat(parts[2]),
        qty,
      };
    }
    const l = parseFloat(row.length), w = parseFloat(row.width), h = parseFloat(row.height);
    const qty = parseInt(row.qty);
    if (!l || !w || !h || !qty || qty <= 0) return null;
    const key = `${l}x${w}x${h}`;
    return { key, length: l, width: w, height: h, qty };
  } catch {
    return null;
  }
}

interface PalletEditorProps {
  pallet?: PalletType;
  existingKeys: string[];
  onSave: (p: PalletType) => void;
  onCancel: () => void;
}

function PalletEditor({ pallet, existingKeys, onSave, onCancel }: PalletEditorProps) {
  const [name, setName] = useState(pallet?.name || '');
  const [rows, setRows] = useState<PlankRow[]>(() => {
    if (pallet) {
      return pallet.components.map(c => ({
        id: Math.random().toString(36).slice(2),
        length: String(c.length), width: String(c.width), height: String(c.height), qty: String(c.qty),
        useNewSize: true, newKey: c.key, existingKey: c.key,
      }));
    }
    return [emptyRow()];
  });

  function addRow() { setRows(prev => [...prev, emptyRow()]); }
  function removeRow(id: string) { setRows(prev => prev.filter(r => r.id !== id)); }
  function updateRow(id: string, patch: Partial<PlankRow>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  function handleSave() {
    if (!name.trim()) { toast.error('Pallet name required'); return; }
    const components: PlankComponent[] = [];
    for (const row of rows) {
      const comp = rowToComponent(row, existingKeys);
      if (!comp) { toast.error('Invalid plank component — fill all fields'); return; }
      components.push(comp);
    }
    if (components.length === 0) { toast.error('Add at least one plank component'); return; }
    onSave({ id: pallet?.id || genId(), name: name.trim(), components });
  }

  return (
    <div style={{
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
        {pallet ? 'Edit Pallet' : 'New Pallet'}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Pallet Name</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='e.g. 48" Pallet'
          data-testid="input-pallet-name"
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
          Plank Components
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {rows.map((row, idx) => (
            <div key={row.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', width: '18px', textAlign: 'right', flexShrink: 0 }}>{idx + 1}.</div>

              {/* Toggle existing / new */}
              <div style={{ display: 'flex', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', overflow: 'hidden', flexShrink: 0 }}>
                <button type="button" onClick={() => updateRow(row.id, { useNewSize: false })}
                  style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: !row.useNewSize ? 'hsl(var(--primary))' : 'transparent', color: !row.useNewSize ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))' }}>
                  Existing
                </button>
                <button type="button" onClick={() => updateRow(row.id, { useNewSize: true })}
                  style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: row.useNewSize ? 'hsl(var(--primary))' : 'transparent', color: row.useNewSize ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))' }}>
                  New
                </button>
              </div>

              {!row.useNewSize ? (
                <Select value={row.existingKey} onValueChange={v => updateRow(row.id, { existingKey: v })}>
                  <SelectTrigger style={{ flex: 1, height: '32px', fontSize: '0.78rem' }}>
                    <SelectValue placeholder="Select plank" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <div style={{ display: 'flex', gap: '0.35rem', flex: 1 }}>
                  <Input placeholder="L" type="number" value={row.length} onChange={e => updateRow(row.id, { length: e.target.value })} style={{ flex: 1, height: '32px', fontSize: '0.78rem' }} />
                  <span style={{ lineHeight: '32px', color: 'hsl(var(--muted-foreground))' }}>x</span>
                  <Input placeholder="W" type="number" value={row.width} onChange={e => updateRow(row.id, { width: e.target.value })} style={{ flex: 1, height: '32px', fontSize: '0.78rem' }} />
                  <span style={{ lineHeight: '32px', color: 'hsl(var(--muted-foreground))' }}>x</span>
                  <Input placeholder="H" type="number" value={row.height} onChange={e => updateRow(row.id, { height: e.target.value })} style={{ flex: 1, height: '32px', fontSize: '0.78rem' }} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>=</span>
                <Input
                  placeholder="Qty"
                  type="number"
                  value={row.qty}
                  onChange={e => updateRow(row.id, { qty: e.target.value })}
                  style={{ width: '64px', height: '32px', fontSize: '0.78rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>nos</span>
              </div>

              <button
                type="button"
                onClick={() => removeRow(row.id)}
                data-testid={`btn-remove-row-${idx}`}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(0 72% 50%)', padding: '0.25rem', flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          data-testid="btn-add-component-row"
          style={{
            marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.73rem', fontWeight: 600, color: 'hsl(var(--primary))',
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem 0',
          }}
        >
          <Plus size={13} /> Add Component
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button variant="outline" onClick={onCancel} data-testid="btn-cancel-editor" size="sm">
          <X size={13} style={{ marginRight: '0.25rem' }} /> Cancel
        </Button>
        <Button onClick={handleSave} data-testid="btn-save-pallet" size="sm">
          <Check size={13} style={{ marginRight: '0.25rem' }} /> Save Pallet
        </Button>
      </div>
    </div>
  );
}

export function ManagePallets() {
  const { pallets, addPallet, updatePallet, deletePallet, allPlankKeys } = useStoreContext();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const existingKeys = useMemo(() => allPlankKeys(), [allPlankKeys]);

  function handleAdd(p: PalletType) {
    addPallet(p);
    toast.success(`Pallet "${p.name}" added`);
    setShowAdd(false);
  }

  function handleUpdate(p: PalletType) {
    updatePallet(p);
    toast.success(`Pallet "${p.name}" updated`);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    const pallet = pallets.find(p => p.id === id);
    deletePallet(id);
    toast.success(`Pallet "${pallet?.name}" deleted`);
    setConfirmDelete(null);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Manage Pallets"
        subtitle="Define pallet types and their plank bill of materials"
        action={
          <Button size="sm" onClick={() => { setShowAdd(true); setEditingId(null); }} data-testid="btn-add-pallet">
            <Plus size={13} style={{ marginRight: '0.375rem' }} />
            New Pallet Type
          </Button>
        }
      />

      <div className="flex-1 overflow-auto" style={{ padding: '1.25rem 1.5rem' }}>
        {showAdd && (
          <PalletEditor
            existingKeys={existingKeys}
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {pallets.map(pallet => (
            <div key={pallet.id}>
              {editingId === pallet.id ? (
                <PalletEditor
                  pallet={pallet}
                  existingKeys={existingKeys}
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                  }}
                  data-testid={`pallet-card-${pallet.id}`}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    background: 'hsl(var(--muted))',
                    borderBottom: '1px solid hsl(var(--border))',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{pallet.name}</div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => { setEditingId(pallet.id); setShowAdd(false); }}
                        data-testid={`btn-edit-${pallet.id}`}
                        style={{ background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', padding: '0.25rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'hsl(var(--foreground))' }}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      {confirmDelete === pallet.id ? (
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: 'hsl(0 72% 40%)' }}>Confirm delete?</span>
                          <button onClick={() => handleDelete(pallet.id)} data-testid={`btn-confirm-delete-${pallet.id}`} style={{ background: 'hsl(0 72% 48%)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>Yes</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem' }}>No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(pallet.id)}
                          data-testid={`btn-delete-${pallet.id}`}
                          style={{ background: 'transparent', border: '1px solid hsl(0 72% 48% / 0.3)', borderRadius: 'var(--radius)', padding: '0.25rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'hsl(0 72% 42%)' }}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }} className="dense-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Plank Size (L x W x H)</th>
                        <th style={{ textAlign: 'right' }}>Quantity per Pallet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pallet.components.map(comp => (
                        <tr key={comp.key}>
                          <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500 }}>{comp.key}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{comp.qty} nos</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
