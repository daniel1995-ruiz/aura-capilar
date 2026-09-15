import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mediaUrl, storeApi } from "@/lib/api";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await storeApi.page((await params).slug);
  return page ? { title: page.title, description: page.subtitle ?? undefined } : {};
}

/** Formato simple: líneas que empiezan con "## " son subtítulos; párrafos separados por línea en blanco. */
function renderBody(body: string) {
  return body.split(/\n{2,}/).map((block, i) => {
    const [first, ...rest] = block.split("\n");
    if (first.startsWith("## ")) {
      return (
        <section key={i} className="border-t border-ink/10 pt-8">
          <h2 className="font-display text-3xl">{first.slice(3)}</h2>
          {rest.length > 0 && <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/70">{rest.join("\n")}</p>}
        </section>
      );
    }
    return (
      <p key={i} className="whitespace-pre-line text-lg leading-relaxed text-ink/75">
        {block}
      </p>
    );
  });
}

export default async function ContentPage({ params }: { params: Params }) {
  const page = await storeApi.page((await params).slug);
  if (!page) notFound();

  return (
    <article>
      <header className="relative overflow-hidden bg-sand/60">
        {page.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(page.heroImageUrl)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
          <h1 className="font-display text-6xl sm:text-7xl">{page.title}</h1>
          {page.subtitle && <p className="mt-4 font-display text-2xl italic text-ink/70">{page.subtitle}</p>}
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-16">{renderBody(page.body)}</div>
    </article>
  );
}
