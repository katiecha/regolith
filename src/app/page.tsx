import Image from "next/image";
import { PronunciationButton } from "./components/pronunciation-button";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6]">
      <a
        href="https://x.com/RegolithAi"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-8 right-8"
      >
        <Image
          src="/x-logo.png"
          alt="X (Twitter)"
          width={20}
          height={20}
        />
      </a>

      <main className="flex min-h-screen items-center justify-center px-8 pb-24">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">regolith</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl text-[#1A1A1A]">reg·o·lith</span>
            <PronunciationButton />
          </div>

          <p className="text-xl text-[#1A1A1A] leading-relaxed">
            : material shaped by constant impact; fragmented,<br />
            recombined, and refined over time into something<br />
            stronger than its origins.
          </p>
        </div>
      </main>
    </div>
  );
}
