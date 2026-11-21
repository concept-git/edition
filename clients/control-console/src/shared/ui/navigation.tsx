import type { ComponentProps } from 'react';
import { useServices } from '@/shared/api/context';
import { cn } from '@/shared/lib/utils';
export function AppLink({
  to,
  children,
  className,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { to: string }) {
  const { navigate } = useServices();
  return (
    <a
      {...props}
      href={`/console/${to}`}
      className={cn('text-primary hover:underline', className)}
      onClick={(event) => {
        if (
          event.button ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
export function TabsNav({
  tabs,
  active,
}: {
  tabs: { label: string; to: string; id: string }[];
  active: string;
}) {
  return (
    <nav
      aria-label="资源分区"
      className="mb-6 flex gap-1 overflow-x-auto border-b"
    >
      {tabs.map((tab) => (
        <AppLink
          key={tab.id}
          to={tab.to}
          aria-current={active === tab.id ? 'page' : undefined}
          className={cn(
            'shrink-0 border-b-2 px-3 py-3 text-sm text-muted-foreground no-underline hover:bg-muted hover:no-underline',
            active === tab.id
              ? 'border-primary text-foreground'
              : 'border-transparent',
          )}
        >
          {tab.label}
        </AppLink>
      ))}
    </nav>
  );
}
