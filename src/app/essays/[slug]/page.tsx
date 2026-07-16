import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ESSAYS } from "../../data/content";

function findEssay(slug: string) {
  return ESSAYS.find((essay) => essay.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const essay = findEssay(slug);

  return { title: essay ? `${essay.title} — Regolith` : "Regolith" };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = findEssay(slug);

  if (!essay?.file) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-8 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-foreground opacity-60"
        >
          <span aria-hidden="true">←</span>
          Back to Regolith
        </Link>
      </div>
      <iframe
        src={essay.file}
        title={essay.title}
        className="flex-1 w-full border-0"
      />
    </div>
  );
}
