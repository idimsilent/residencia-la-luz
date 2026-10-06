import { Reveal } from "./reveal";

/** Cabecera sencilla para páginas de módulo sin bloques propios. */
export function PageHero({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden bg-surface-alt">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-40 h-28 w-28 rounded-full bg-accent/10" />
      <div className="container-site relative py-14 sm:py-20">
        <Reveal className="max-w-2xl">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="heading-1">{title}</h1>
          {intro ? <p className="lead mt-4">{intro}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}
