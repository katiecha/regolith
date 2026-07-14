import { REFERENCES } from "../data/content";
import { ExternalLink } from "./ui/external-link";
import { SectionHeading } from "./ui/section-heading";

function ReferenceItem({ title, href }: { title: string; href: string }) {
  return (
    <li className="text-base text-foreground">
      <ExternalLink href={href}>{title}</ExternalLink>
    </li>
  );
}

export function ReferencesSection() {
  return (
    <section
      id="references"
      className="min-h-screen flex items-center justify-center px-8 pb-16 md:pb-0"
    >
      <div className="relative z-10 max-w-xl w-full">
        <SectionHeading>References</SectionHeading>
        <ul className="space-y-4">
          {REFERENCES.map(({ title, href }) => (
            <ReferenceItem key={href} title={title} href={href} />
          ))}
        </ul>
      </div>
    </section>
  );
}
