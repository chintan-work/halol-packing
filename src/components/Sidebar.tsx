import { useLocation, Link } from 'wouter';
import {
  LayoutDashboard,
  TruckIcon,
  Hammer,
  FileText,
  SlidersHorizontal,
  ClipboardList,
  Settings,
  Building2,
} from 'lucide-react';
import { useStoreContext } from '@/store/StoreContext';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendor-inward', label: 'Vendor Inward', icon: TruckIcon },
  { path: '/production', label: 'Production', icon: Hammer },
  { path: '/challan', label: 'Challan', icon: FileText },
  { path: '/adjustment', label: 'Adjustment', icon: SlidersHorizontal },
  { path: '/records', label: 'Records', icon: ClipboardList },
  { path: '/manage-pallets', label: 'Manage Pallets', icon: Settings },
  { path: '/profile', label: 'Profile', icon: Building2 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { profile } = useStoreContext();

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: '210px',
        minWidth: '210px',
        background: 'hsl(var(--sidebar))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.125rem 0.875rem',
          borderBottom: '1px solid hsl(var(--sidebar-border))',
        }}
      >
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'hsl(var(--sidebar-primary))',
            marginBottom: '0.2rem',
          }}
        >
          Stock Management
        </div>
        <div
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'hsl(var(--sidebar-accent-foreground))',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {profile.companyName || 'Halol Packing'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.625rem 0.625rem', flex: 1, overflow: 'auto' }}>
        {NAV.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location === '/' : location.startsWith(path);
          return (
            <Link
              key={path}
              href={path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid hsl(var(--sidebar-border))',
          fontSize: '0.65rem',
          color: 'hsl(var(--sidebar-foreground) / 0.4)',
          letterSpacing: '0.04em',
        }}
      >
        HALOL PACKING v1.0
      </div>
    </aside>
  );
}
