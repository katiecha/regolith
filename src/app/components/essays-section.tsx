import Link from "next/link";
import { ESSAYS } from "../data/content";
import { SectionHeading } from "./ui/section-heading";

function EssayItem({
  title,
  question,
  slug,
}: {
  title: string;
  question: string;
  slug?: string;
}) {
  return (
    <li className="text-base text-foreground">
      {slug ? (
        <Link
          href={`/essays/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {title}
        </Link>
      ) : (
        <span>{title}</span>
      )}
      <p className="text-sm mt-1 text-foreground opacity-60">{question}</p>
    </li>
  );
}

export function EssaysSection() {
  return (
    <section
      id="essays"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="relative z-10 max-w-xl w-full">
        <SectionHeading>Essays</SectionHeading>
        <ul className="space-y-8">
          {ESSAYS.map(({ title, question, slug }) => (
            <EssayItem
              key={title}
              title={title}
              question={question}
              slug={slug}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
