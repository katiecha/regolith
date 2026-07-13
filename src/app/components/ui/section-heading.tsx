export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-widest text-foreground mb-8">
      {children}
    </h2>
  );
}
