import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.5rem',
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--card))',
        minHeight: '52px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'hsl(var(--foreground))',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '0.72rem',
              color: 'hsl(var(--muted-foreground))',
              marginTop: '0.1rem',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
