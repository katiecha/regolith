export function ThesisSection() {
  return (
    <section
      id="thesis"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="relative z-10 max-w-xl w-full space-y-6">
        <p className="text-base text-foreground">
          Regolith is a research and engineering effort focused on self-healing
          hardware and predictive maintenance for autonomous industry.
        </p>
        <p className="text-base text-foreground">
          We study how materials, energy, sensing, memory, and computation can
          be combined to build systems that detect failure before it happens and
          repair themselves without human intervention. The Moon is the hardest
          test case.
        </p>
        <p className="text-base text-foreground">
          It is an extreme manufacturing environment defined by vacuum,
          radiation, abrasive dust, limited maintenance, and constrained energy
          resources — conditions that make failure inevitable and human repair
          impossible.
        </p>
        <p className="text-base text-foreground">
          The self-healing materials and predictive maintenance systems we build
          to survive there apply anywhere hardware must operate without easy
          access to repair: deep sea, remote infrastructure, and defense.
        </p>
      </div>
    </section>
  );
}
