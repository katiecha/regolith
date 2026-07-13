import { ESSAYS } from "../data/content";
import { ExternalLink } from "./ui/external-link";
import { SectionHeading } from "./ui/section-heading";

function EssayItem({
  title,
  question,
  href,
}: {
  title: string;
  question: string;
  href?: string;
}) {
  return (
    <li className="text-base text-foreground">
      {href ? (
        <ExternalLink href={href}>{title}</ExternalLink>
      ) : (
        <span>{title}</span>
      )}
      <p className="text-base mt-1 text-foreground opacity-60">{question}</p>
    </li>
  );
}

export function EssaysSection() {
  return (
    <section
      id="essays"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="max-w-xl w-full">
        <SectionHeading>Essays</SectionHeading>
        <ul className="space-y-8">
          {ESSAYS.map(({ title, question, href }) => (
            <EssayItem
              key={title}
              title={title}
              question={question}
              href={href}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
