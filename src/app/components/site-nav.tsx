import Image from "next/image";
import { NAV_LINKS } from "../data/content";

export function SiteNav() {
  return (
    <>
      {/* X icon */}
      <div className="fixed top-8 right-8 z-20">
        <a
          href="https://x.com/RegolithAi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/x-logo.png" alt="X (Twitter)" width={16} height={16} />
        </a>
      </div>

      {/* Desktop nav — vertical left side */}
      <nav className="max-md:hidden md:flex fixed top-0 left-0 z-10 flex-col justify-center h-full px-8 gap-6">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-xs uppercase tracking-widest text-foreground [writing-mode:vertical-rl] rotate-180"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Mobile nav — horizontal bottom bar */}
      <nav className="md:hidden flex flex-wrap fixed bottom-0 left-0 right-0 z-10 justify-center gap-x-4 gap-y-1 px-4 py-3 bg-background">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-xs uppercase tracking-wide text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
