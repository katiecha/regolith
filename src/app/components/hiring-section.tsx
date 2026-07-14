import { SectionHeading } from "./ui/section-heading";

export function HiringSection() {
  return (
    <section
      id="hiring"
      className="min-h-screen flex items-start justify-center px-8 pt-[30vh] pb-16 md:pb-0"
    >
      <div className="relative z-10 max-w-xl w-full">
        <SectionHeading>Hiring</SectionHeading>
        <div className="space-y-6">
          <p className="text-base text-foreground">
            We are interested in people who think deeply about materials,
            energy, computation, and autonomy.
          </p>
          <p className="text-base text-foreground">
            If our essays resonate with you, reach out: katiechai21 [at] icloud
            [dot] com
          </p>
        </div>
      </div>
    </section>
  );
}
