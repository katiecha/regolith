export function ThesisSection() {
  return (
    <section
      id="thesis"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="max-w-xl w-full space-y-6">
        <p className="text-base text-foreground">
          Regolith is a research and engineering effort focused on intelligent
          physical systems for autonomous industry.
        </p>
        <p className="text-base text-foreground">
          We study how materials, energy, sensing, memory, and computation can
          be combined to create infrastructure capable of operating with minimal
          human intervention in extreme environments. The Moon is the hardest
          test case.
        </p>
        <p className="text-base text-foreground">
          It is an extreme manufacturing environment defined by vacuum,
          radiation, abrasive dust, limited maintenance, and constrained energy
          resources.
        </p>
        <p className="text-base text-foreground">
          The future of lunar industry depends on our ability to couple energy,
          materials, and autonomous systems into a unified industrial process.
        </p>
      </div>
    </section>
  );
}
