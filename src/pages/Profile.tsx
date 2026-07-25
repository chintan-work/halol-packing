import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Save, Upload, X } from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Profile as ProfileType } from '@/store/types';

export function Profile() {
  const { profile, setProfile } = useStoreContext();
  const [form, setForm] = useState<ProfileType>({ ...profile });
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(field: keyof ProfileType, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error('Logo must be under 500KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setForm(prev => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    setProfile(form);
    toast.success('Profile saved');
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Company Profile"
        subtitle="Used in challan printouts and app header"
        action={
          <Button onClick={handleSave} data-testid="btn-save-profile">
            <Save size={14} style={{ marginRight: '0.375rem' }} />
            Save Profile
          </Button>
        }
      />

      <div className="flex-1 overflow-auto" style={{ padding: '1.5rem', maxWidth: '640px' }}>

        {/* Logo */}
        <div style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
            Company Logo
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '100px', height: '64px',
              border: '1px dashed hsl(var(--border))',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'hsl(var(--muted))',
              overflow: 'hidden',
            }}>
              {form.logo ? (
                <img src={form.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>No logo</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
                data-testid="input-logo-file"
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} data-testid="btn-upload-logo">
                <Upload size={12} style={{ marginRight: '0.375rem' }} />
                Upload Logo
              </Button>
              {form.logo && (
                <Button variant="outline" size="sm" onClick={() => setForm(prev => ({ ...prev, logo: '' }))} data-testid="btn-remove-logo">
                  <X size={12} style={{ marginRight: '0.375rem' }} />
                  Remove
                </Button>
              )}
              <div style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))' }}>PNG/JPG, max 500KB</div>
            </div>
          </div>
        </div>

        {/* Company details */}
        <div style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.875rem' }}>
            Company Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <Label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Company Name</Label>
              <Input
                value={form.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
                placeholder="Halol Packing"
                data-testid="input-company-name"
              />
            </div>

            <div>
              <Label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Address</Label>
              <Textarea
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="Factory address, city, state, PIN"
                rows={3}
                data-testid="input-address"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <Label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>GST Number</Label>
                <Input
                  value={form.gst}
                  onChange={e => handleChange('gst', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  data-testid="input-gst"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview strip */}
        <div style={{
          marginTop: '1rem',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.625rem' }}>
            Challan Header Preview
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: 'var(--radius)' }}>
            {form.logo && (
              <img src={form.logo} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{form.companyName || 'Halol Packing'}</div>
              {form.address && <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>{form.address}</div>}
              <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))' }}>
                {[form.phone && `Ph: ${form.phone}`, form.gst && `GSTIN: ${form.gst}`].filter(Boolean).join(' | ')}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} data-testid="btn-save-profile-bottom">
            <Save size={14} style={{ marginRight: '0.375rem' }} />
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
