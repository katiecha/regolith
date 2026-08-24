import { SectionHeading } from "./ui/section-heading";

export function HistorySection() {
  return (
    <section
      id="history"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="relative z-10 max-w-xl w-full">
        <SectionHeading>History</SectionHeading>
        <div className="space-y-6">
          <p className="text-base text-foreground">
            Regolith began by aiming at the Moon. We chose it deliberately: of
            all the places autonomous industry might one day run, it is the
            least forgiving: unmanned, hard to reach, and impossible to repair
            by hand. We reasoned that software able to operate reliably there
            could operate almost anywhere.
          </p>
          <p className="text-base text-foreground">
            Working the problem in that extreme made the missing piece clear.
            What autonomous systems lacked was not sharper perception or faster
            control, but memory: a way to accumulate experience over a lifetime
            and let it shape what happens next. The essays and simulator here are
            artifacts of that early, Moon-facing work.
          </p>
          <p className="text-base text-foreground">
            We&apos;ve since pivoted to Earth as our initial case study.
            Degrading sensors, repeated faults, knowledge lost at every
            shutdown: the same failures already play out in factories, robots,
            and industrial equipment, with far more data to learn from. Earth is
            where we begin; the Moon remains the hardest test case we build
            toward.
          </p>
        </div>
      </div>
    </section>
  );
}
