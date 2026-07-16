import type { Metadata } from "next";
import Link from "next/link";
import { ModelAssumptions } from "../components/simulator/model-assumptions";
import { PowerSimulator } from "../components/simulator/power-simulator";
import { SectionHeading } from "../components/ui/section-heading";

export const metadata: Metadata = {
  title: "Simulator — Regolith",
  description:
    "A time-stepped lunar day/night power simulator gating oxide reduction throughput.",
};

export default function SimulatorPage() {
  return (
    <div className="min-h-screen px-8 py-20 bg-background">
      <div className="max-w-2xl mx-auto w-full space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-foreground opacity-60"
        >
          <span aria-hidden="true">←</span>
          Back to Regolith
        </Link>
        <div>
          <SectionHeading>Simulator</SectionHeading>
          <p className="text-base text-foreground">
            The Moon is free-energy constrained, not resource constrained.
            Available solar power gates which oxides in lunar regolith can
            be economically reduced, and at what rate. This tool ties the
            power budget from{" "}
            <span className="italic">Energy for a Vacuum World</span> to
            the oxide reduction economics from{" "}
            <span className="italic">Metallurgy for a Vacuum World</span>{" "}
            across a full lunar day/night cycle.
          </p>
        </div>
        <PowerSimulator />
        <ModelAssumptions />
      </div>
    </div>
  );
}
