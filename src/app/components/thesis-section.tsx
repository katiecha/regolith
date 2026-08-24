export function ThesisSection() {
  return (
    <section
      id="thesis"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="relative z-10 max-w-xl w-full space-y-6">
        <p className="text-base text-foreground">
          Regolith is the memory layer for autonomous physical systems. Today&apos;s
          software executes instructions; tomorrow&apos;s will remember the past to
          predict the future.
        </p>
        <p className="text-base text-foreground">
          Modern industrial systems generate vast telemetry, yet almost every
          controller, robot, and automation system treats each decision as an
          isolated event, reacting to the current reading, rediscovering known
          failure modes, and losing hard-won knowledge every time a machine
          shuts down.
        </p>
        <p className="text-base text-foreground">
          We believe persistent memory is the missing abstraction for autonomous
          industry, just as perception was for autonomous vehicles. Every
          physical system has a history, and that history should become part of
          how it thinks. We ingest sensor data, logs, and control actions into a
          persistent operational memory, then build state estimation, sensor
          trust, failure prediction, and autonomous control on top of it, so
          the question shifts from what is happening right now to what a system
          should do next, given everything it has experienced.
        </p>
        <p className="text-base text-foreground">
          The Moon is not our first market. It is our hardest test case:
          vacuum, radiation, abrasive dust, and no easy access to repair. If
          software can run autonomous industry there, it can run almost anywhere:
          factories, robots, and the physical infrastructure the rest of the
          world depends on.
        </p>
      </div>
    </section>
  );
}
