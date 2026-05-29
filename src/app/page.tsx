import Image from "next/image";
import { PronunciationButton } from "./components/pronunciation-button";

const ESSAYS: { title: string; question: string; href?: string }[] = [
  { title: "Metallurgy for a Vacuum World", question: "How do we transform oxides into useful materials?", href: "/essays/Metallurgy_for_a_Vacuum_World.pdf" },
  { title: "Energy for a Vacuum World", question: "How do we power industrial civilization?", href: "/essays/Energy_for_a_Vacuum_World.pdf" },
  { title: "Memory for a Vacuum World", question: "How do systems remember?" },
  { title: "Trust for Autonomous Systems", question: "How do systems know what is true?" },
  { title: "Control for Autonomous Systems", question: "How do systems act?" },
];

const NAV_LINKS = [
  { label: "Thesis", href: "#thesis" },
  { label: "Essays", href: "#essays" },
  { label: "References", href: "#references" },
  { label: "Hiring", href: "#hiring" },
];

export default function Home() {
  return (
    <div id="top" className="bg-[#FAF9F6]">
      <a href="#top" className="fixed top-8 left-8 z-20 text-xl text-[#1A1A1A]">☽</a>

      <nav className="fixed top-0 left-0 z-10 flex flex-col justify-center h-full px-8 gap-6">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-xs uppercase tracking-widest text-[#1A1A1A] [writing-mode:vertical-rl] rotate-180"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="fixed top-8 right-8 z-10">
        <a href="https://x.com/RegolithAi" target="_blank" rel="noopener noreferrer">
          <Image src="/x-logo.png" alt="X (Twitter)" width={16} height={16} />
        </a>
      </div>

      {/* Landing */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl text-[#1A1A1A] mb-4">regolith</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl text-[#1A1A1A]">reg·o·lith</span>
            <PronunciationButton />
          </div>
          <p className="text-base text-[#1A1A1A]">
            : material shaped by constant impact; fragmented, recombined, and
            refined over time into something stronger than its origins.
          </p>
        </div>
      </section>

      {/* Thesis */}
      <section id="thesis" className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-xl w-full space-y-6">
          <p className="text-base text-[#1A1A1A]">
            Regolith is a research and engineering effort focused on intelligent
            physical systems for autonomous industry.
          </p>
          <p className="text-base text-[#1A1A1A]">
            We study how materials, energy, sensing, memory, and computation can
            be combined to create infrastructure capable of operating with
            minimal human intervention in extreme environments.
          </p>
          <p className="text-base text-[#1A1A1A]">
            The Moon is the hardest test case.
          </p>
          <p className="text-base text-[#1A1A1A]">
            It is an extreme manufacturing environment defined by vacuum,
            radiation, abrasive dust, limited maintenance, and constrained
            energy resources.
          </p>
          <p className="text-base text-[#1A1A1A]">
            The future of lunar industry depends on our ability to couple
            energy, materials, and autonomous systems into a unified industrial
            process.
          </p>
        </div>
      </section>

      {/* Essays */}
      <section id="essays" className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-xl w-full">
          <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A] mb-8">
            Essays
          </h2>
          <ul className="space-y-4">
            {ESSAYS.map(({ title, question, href }) => (
              <li key={title} className="text-base text-[#1A1A1A]">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {title}
                  </a>
                ) : (
                  <span>{title}</span>
                )}
                <p className="text-base mt-1 text-[#1A1A1A] opacity-60">
                  {question}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* References */}
      <section id="references" className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-xl w-full">
          <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A] mb-8">
            References
          </h2>
          <ul className="space-y-4">
            {[
              {
                title: "The Lunar Regolith",
                href: "https://www.nasa.gov/wp-content/uploads/2019/04/05_1_snoble_thelunarregolith.pdf",
              },
              {
                title: "The Chemical Composition of Lunar Soil",
                href: "https://sites.wustl.edu/meteoritesite/items/the-chemical-composition-of-lunar-soil/",
              },
              {
                title: "Perturbing the Mass and Composition of the Lunar Atmosphere During the Artemis Surface Missions",
                href: "https://www.lpi.usra.edu/announcements/artemis/whitepapers/2011.pdf",
              },
              {
                title: "Why We Should Train AI in Space",
                href: "https://starcloudinc.github.io/wp.pdf",
              },
            ].map(({ title, href }) => (
              <li key={href} className="text-base text-[#1A1A1A]">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Hiring */}
      <section id="hiring" className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-xl w-full">
          <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A] mb-8">
            Hiring
          </h2>
          <div className="space-y-6">
            <p className="text-base text-[#1A1A1A]">
              We are interested in people who think deeply about materials, energy, computation, and autonomy.
            </p>
            <p className="text-base text-[#1A1A1A]">
              If our essays resonate with you, reach out: katiechai21 [at] icloud [dot] com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
