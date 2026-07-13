export function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-widest text-foreground">
      {children}
    </p>
  );
}
