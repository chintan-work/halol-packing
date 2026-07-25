import { Toaster } from 'sonner';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { StoreProvider } from '@/store/StoreContext';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { VendorInward } from '@/pages/VendorInward';
import { Production } from '@/pages/Production';
import { Challan } from '@/pages/Challan';
import { Adjustment } from '@/pages/Adjustment';
import { Records } from '@/pages/Records';
import { ManagePallets } from '@/pages/ManagePallets';
import { Profile } from '@/pages/Profile';

function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>404</div>
      <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Page not found</div>
    </div>
  );
}

function AppShell() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: 'hsl(var(--background))',
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/vendor-inward" component={VendorInward} />
          <Route path="/production" component={Production} />
          <Route path="/challan" component={Challan} />
          <Route path="/adjustment" component={Adjustment} />
          <Route path="/records" component={Records} />
          <Route path="/manage-pallets" component={ManagePallets} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AppShell />
      </WouterRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontSize: '0.8rem',
            fontFamily: 'IBM Plex Sans, sans-serif',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </StoreProvider>
  );
}

export default App;
