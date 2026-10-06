import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Play, Quote } from "lucide-react";
import type { ReactNode } from "react";
import type { AnyBlock, BlockPropsMap } from "@/features/blocks/schema";
import type { BlockData } from "@/features/blocks/data";
import type { ThemeTokens } from "@/features/theme/schema";
import { MediaImage } from "@/components/public/media-image";
import { Reveal } from "@/components/public/reveal";
import { Icon } from "@/components/public/icon";
import { NewsCard } from "@/components/public/news-card";
import { EventCard } from "@/components/public/event-card";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { ContactForm } from "@/components/public/contact-form";
import { VideoEmbed } from "@/components/public/video-embed";
import { cn, telHref } from "@/lib/utils";

/**
 * Renderizado de bloques. Cada tipo se pinta con un componente controlado
 * por la aplicación: los datos del CMS nunca se ejecutan como código.
 * Se usa en la web pública (servidor) y en la vista previa del editor (cliente).
 */

type Ctx = {
  data: BlockData;
  theme: Pick<ThemeTokens["components"], "galleryStyle" | "newsCardStyle">;
  isEditorPreview?: boolean;
  /** Primer bloque de la página: su imagen se carga con prioridad. */
  first?: boolean;
};

type Style = BlockPropsMap["hero"]["style"];

const SPACING: Record<Style["spacing"], string> = {
  none: "py-0",
  sm: "py-8 sm:py-10",
  md: "section-y",
  lg: "py-20 sm:py-28",
};
const BACKGROUND: Record<Style["background"], string> = {
  default: "",
  soft: "bg-surface-alt",
  surface: "bg-surface",
  primary: "bg-primary text-primary-contrast",
};
const WIDTH: Record<Style["width"], string> = {
  narrow: "container-site max-w-3xl",
  normal: "container-site",
  wide: "container-site max-w-[92rem]",
  full: "w-full",
};

function visibilityClasses(block: AnyBlock): string {
  const v = block.visibility;
  return cn(!v.mobile && "hide-mobile", !v.tablet && "hide-tablet", !v.desktop && "hide-desktop");
}

function Section({ block, children, className }: { block: AnyBlock; children: ReactNode; className?: string }) {
  const style = block.props.style;
  return (
    <section
      id={style.anchor || undefined}
      className={cn(
        SPACING[style.spacing],
        BACKGROUND[style.background],
        style.background !== "default" && "block-boxable",
        visibilityClasses(block),
        className,
      )}
    >
      <div className={cn(WIDTH[style.width], style.align === "center" && "text-center")}>{children}</div>
    </section>
  );
}

function SectionHeading({ title, intro, align, eyebrow }: { title?: string; intro?: string; align: "left" | "center"; eyebrow?: string }) {
  if (!title && !intro && !eyebrow) return null;
  return (
    <Reveal className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      {title ? <h2 className="heading-2">{title}</h2> : null}
      {intro ? <p className="lead mt-4">{intro}</p> : null}
    </Reveal>
  );
}

function Cta({ cta, kind = "primary" }: { cta: { label: string; href: string } | null; kind?: string }) {
  if (!cta || !cta.label) return null;
  const external = cta.href.startsWith("http");
  return (
    <Link
      href={cta.href}
      className={cn("btn", `btn-${kind}`)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {cta.label}
    </Link>
  );
}

function RichHtml({ html, className }: { html: string; className?: string }) {
  // El HTML se sanea en servidor al guardar y antes de renderizar.
  return <div className={cn("prose-site", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ------------------------------------------------------------------------ */

function HeroBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "hero" }>; ctx: Ctx }) {
  const p = block.props;
  const media = p.mediaId ? ctx.data.media[p.mediaId] : null;
  const height = { medium: "min-h-[26rem] sm:min-h-[30rem]", large: "min-h-[34rem] sm:min-h-[40rem]", screen: "min-h-[calc(100svh-5rem)]" }[p.height];
  const overlay = {
    soft: "bg-black/25",
    strong: "bg-black/50",
    gradient: "bg-gradient-to-r from-black/65 via-black/35 to-black/5",
  }[p.overlay];
  const center = p.style.align === "center";
  return (
    <section className={cn("relative isolate flex items-end overflow-hidden sm:items-center", height, visibilityClasses(block))}>
      <div className="absolute inset-0 -z-10">
        <MediaImage media={media} priority={ctx.first} sizes="100vw" placeholderLabel="Imagen de portada pendiente" />
        <div className={cn("absolute inset-0", overlay)} />
      </div>
      <div className={cn("container-site py-16 text-white", center && "text-center")}>
        <div className={cn("max-w-2xl animate-fade-up", center && "mx-auto")}>
          {p.eyebrow ? <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-white/85">{p.eyebrow}</p> : null}
          <h1 className="heading-display text-white drop-shadow-sm">{p.title}</h1>
          {p.subtitle ? <p className="mt-5 text-lg text-white/90 sm:text-xl">{p.subtitle}</p> : null}
          {p.primaryCta || p.secondaryCta ? (
            <div className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}>
              <Cta cta={p.primaryCta} kind="light" />
              <Cta cta={p.secondaryCta} kind="ghost-light" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeroSplitBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "hero-split" }>; ctx: Ctx }) {
  const p = block.props;
  const media = p.mediaId ? ctx.data.media[p.mediaId] : null;
  return (
    <Section block={block}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn("animate-fade-up", p.imagePosition === "left" && "lg:order-2")}>
          {p.eyebrow ? <p className="eyebrow mb-4">{p.eyebrow}</p> : null}
          <h1 className="heading-1">{p.title}</h1>
          {p.subtitle ? <p className="lead mt-5">{p.subtitle}</p> : null}
          <div className={cn("mt-8 flex flex-wrap gap-3", p.style.align === "center" && "justify-center")}>
            <Cta cta={p.primaryCta} />
            <Cta cta={p.secondaryCta} kind="secondary" />
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-theme-lg shadow-theme-lg">
          <MediaImage media={media} priority={ctx.first} sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </div>
    </Section>
  );
}

function RichTextBlock({ block }: { block: Extract<AnyBlock, { type: "rich-text" }> }) {
  const p = block.props;
  return (
    <Section block={block}>
      <Reveal className={cn(p.style.align === "center" && "mx-auto [&_.prose-site]:mx-auto")}>
        {p.title ? <h2 className="heading-2 mb-6">{p.title}</h2> : null}
        <RichHtml html={p.html} />
      </Reveal>
    </Section>
  );
}

function ImageTextBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "image-text" }>; ctx: Ctx }) {
  const p = block.props;
  const media = p.mediaId ? ctx.data.media[p.mediaId] : null;
  const ratio = { square: "aspect-square", portrait: "aspect-[4/5]", landscape: "aspect-[4/3]" }[p.imageRatio];
  return (
    <Section block={block}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn("relative overflow-hidden rounded-theme-lg shadow-theme", ratio, p.imagePosition === "right" && "lg:order-2")}>
          <MediaImage media={media} sizes="(min-width: 1024px) 50vw, 100vw" />
        </Reveal>
        <Reveal delay={120} className="text-left">
          {p.eyebrow ? <p className="eyebrow mb-3">{p.eyebrow}</p> : null}
          {p.title ? <h2 className="heading-2 mb-5">{p.title}</h2> : null}
          <RichHtml html={p.html} className={cn(p.style.background === "primary" && "[&_*]:text-inherit")} />
          {p.cta ? (
            <div className="mt-7">
              <Cta cta={p.cta} kind={p.style.background === "primary" ? "light" : "primary"} />
            </div>
          ) : null}
        </Reveal>
      </div>
    </Section>
  );
}

function GalleryBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "gallery" }>; ctx: Ctx }) {
  const p = block.props;
  const items =
    p.source === "manual"
      ? p.mediaIds
          .map((id) => ctx.data.media[id])
          .filter(Boolean)
          .map((m) => ({ id: m.id, media: m, caption: m.title }))
      : ctx.data.gallery
          .slice(0, p.limit)
          .map((g) => ({ id: g.id, media: ctx.data.media[g.mediaId], caption: g.caption }))
          .filter((g) => g.media);
  return (
    <Section block={block}>
      <SectionHeading title={p.title} intro={p.intro} align={p.style.align} />
      {items.length ? (
        <Reveal>
          <LightboxGallery items={items} columns={p.columns} layout={ctx.theme.galleryStyle} />
        </Reveal>
      ) : (
        <p className="text-muted">Todavía no hay fotografías en la galería.</p>
      )}
      {p.cta ? (
        <div className={cn("mt-10", p.style.align === "center" && "flex justify-center")}>
          <Cta cta={p.cta} kind="secondary" />
        </div>
      ) : null}
    </Section>
  );
}

const COLS: Record<number, string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };

function ServicesBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "services" }>; ctx: Ctx }) {
  const p = block.props;
  const services = ctx.data.services.slice(0, p.limit);
  return (
    <Section block={block}>
      <SectionHeading title={p.title} intro={p.intro} align={p.style.align} />
      {services.length === 0 ? <p className="text-muted">Pronto publicaremos información sobre nuestros servicios.</p> : null}
      {p.variant === "cards" ? (
        <ul className={cn("grid gap-6 text-left", COLS[p.columns])}>
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 70}>
              <article className="card card-hover group relative flex h-full flex-col p-7">
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-theme-sm bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-contrast">
                  <Icon name={s.icon} className="h-7 w-7" />
                </span>
                <h3 className="text-xl">
                  <Link href={`/servicios/${s.slug}`} className="after:absolute after:inset-0 hover:text-primary">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-3 text-muted">{s.summary}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-x-10 gap-y-6 text-left sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.id} className="flex gap-4 border-b border-line pb-6">
              <Icon name={s.icon} className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="text-lg">
                  <Link href={`/servicios/${s.slug}`} className="hover:text-primary">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-1 text-muted">{s.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {p.cta ? (
        <div className={cn("mt-10", p.style.align === "center" && "flex justify-center")}>
          <Cta cta={p.cta} kind="secondary" />
        </div>
      ) : null}
    </Section>
  );
}

function NewsBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "news" }>; ctx: Ctx }) {
  const p = block.props;
  const news = (p.onlyFeatured ? ctx.data.news.filter((n) => n.is_featured) : ctx.data.news).slice(0, p.limit);
  return (
    <Section block={block}>
      <div className={cn("mb-10 flex flex-wrap items-end justify-between gap-4", p.style.align === "center" && "flex-col items-center")}>
        <SectionHeading title={p.title} intro={p.intro} align={p.style.align} />
        {p.cta && p.style.align !== "center" ? (
          <div className="mb-10">
            <Cta cta={p.cta} kind="secondary" />
          </div>
        ) : null}
      </div>
      {news.length === 0 ? <p className="text-muted">Aún no hay noticias publicadas.</p> : null}
      <ul className="grid gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
        {news.map((n, i) => (
          <Reveal as="li" key={n.id} delay={i * 80}>
            <NewsCard post={n} media={n.mediaId ? ctx.data.media[n.mediaId] : null} variant="cards" />
          </Reveal>
        ))}
      </ul>
      {p.cta && p.style.align === "center" ? (
        <div className="mt-10 flex justify-center">
          <Cta cta={p.cta} kind="secondary" />
        </div>
      ) : null}
    </Section>
  );
}

function EventsBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "events" }>; ctx: Ctx }) {
  const p = block.props;
  const events = ctx.data.events.slice(0, p.limit);
  return (
    <Section block={block}>
      <SectionHeading title={p.title} intro={p.intro} align={p.style.align} />
      {events.length === 0 ? <p className="text-muted">No hay próximos eventos publicados.</p> : null}
      <ul className="grid gap-5 text-left md:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <Reveal as="li" key={e.id} delay={i * 80}>
            <EventCard event={e} />
          </Reveal>
        ))}
      </ul>
      {p.cta ? (
        <div className={cn("mt-10", p.style.align === "center" && "flex justify-center")}>
          <Cta cta={p.cta} kind="secondary" />
        </div>
      ) : null}
    </Section>
  );
}

function ValuesBlock({ block }: { block: Extract<AnyBlock, { type: "values" }> }) {
  const p = block.props;
  return (
    <Section block={block}>
      <SectionHeading title={p.title} intro={p.intro} align={p.style.align} />
      <ul className={cn("grid gap-8", COLS[p.columns])}>
        {p.items.map((item, i) => (
          <Reveal as="li" key={`${item.title}-${i}`} delay={i * 70} className={cn(p.style.align === "center" && "flex flex-col items-center")}>
            <span
              className={cn(
                "mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full",
                p.style.background === "primary" ? "bg-white/15" : "bg-secondary text-primary",
              )}
            >
              <Icon name={item.icon} className="h-7 w-7" />
            </span>
            <h3 className="text-xl">{item.title}</h3>
            {item.text ? <p className={cn("mt-2", p.style.background === "primary" ? "opacity-90" : "text-muted")}>{item.text}</p> : null}
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function TestimonialsBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "testimonials" }>; ctx: Ctx }) {
  // Desactivables globalmente y solo con consentimiento confirmado.
  if (!ctx.data.testimonialsEnabled || ctx.data.testimonials.length === 0) {
    return ctx.isEditorPreview ? (
      <Section block={block}>
        <p className="rounded-theme border border-dashed border-line p-6 text-center text-muted">
          Testimonios ocultos: están desactivados en la configuración o no hay testimonios autorizados publicados.
        </p>
      </Section>
    ) : null;
  }
  const p = block.props;
  return (
    <Section block={block}>
      <SectionHeading title={p.title} align={p.style.align} />
      <ul className="grid gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
        {ctx.data.testimonials.slice(0, p.limit).map((t, i) => (
          <Reveal as="li" key={t.id} delay={i * 80}>
            <figure className="card h-full p-7">
              <Quote className="h-8 w-8 text-accent" aria-hidden="true" />
              <blockquote className="mt-4 font-heading text-lg leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm font-semibold text-muted">— {t.author_label}</figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function TeamBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "team" }>; ctx: Ctx }) {
  const p = block.props;
  // Solo se publican personas con autorización registrada.
  const members = p.members.filter((m) => m.consent);
  if (members.length === 0 && !ctx.isEditorPreview) return null;
  return (
    <Section block={block}>
      <SectionHeading title={p.title} intro={p.intro} align={p.style.align} />
      {members.length === 0 ? (
        <p className="rounded-theme border border-dashed border-line p-6 text-center text-muted">
          No hay miembros del equipo con autorización marcada; el bloque no se mostrará en la web.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((m, i) => (
            <Reveal as="li" key={`${m.name}-${i}`} delay={i * 60} className="text-center">
              <div className="relative mx-auto aspect-square w-full max-w-[12rem] overflow-hidden rounded-full bg-surface-alt">
                <MediaImage media={m.mediaId ? ctx.data.media[m.mediaId] : null} fallbackAlt={m.name} sizes="12rem" placeholderLabel="Sin foto" />
              </div>
              <p className="mt-4 font-heading text-lg">{m.name}</p>
              {m.role ? <p className="text-sm text-muted">{m.role}</p> : null}
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}

function CtaBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "cta" }>; ctx: Ctx }) {
  const p = block.props;
  const media = p.mediaId ? ctx.data.media[p.mediaId] : null;
  const center = p.style.align === "center";
  if (p.variant === "image") {
    return (
      <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", visibilityClasses(block))}>
        <div className="absolute inset-0 -z-10">
          <MediaImage media={media} sizes="100vw" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <Reveal className={cn("container-site max-w-3xl text-white", center && "text-center")}>
          <h2 className="heading-1 text-white">{p.title}</h2>
          {p.text ? <p className="mt-4 text-lg text-white/90">{p.text}</p> : null}
          <div className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}>
            <Cta cta={p.primaryCta} kind="light" />
            <Cta cta={p.secondaryCta} kind="ghost-light" />
          </div>
        </Reveal>
      </section>
    );
  }
  const primary = p.variant === "primary";
  return (
    <section className={cn("py-12 sm:py-16", visibilityClasses(block))}>
      <Reveal
        className={cn(
          "container-site",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-theme-lg px-6 py-12 sm:px-12 sm:py-16",
            primary ? "bg-primary text-primary-contrast" : "bg-secondary",
            center && "text-center",
          )}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-white/10" />
          <div className={cn("relative max-w-2xl", center && "mx-auto")}>
            <h2 className={cn("heading-2", primary && "text-primary-contrast")}>{p.title}</h2>
            {p.text ? <p className={cn("mt-4 text-lg", primary ? "opacity-90" : "text-muted")}>{p.text}</p> : null}
            <div className={cn("mt-8 flex flex-wrap gap-3", center && "justify-center")}>
              <Cta cta={p.primaryCta} kind={primary ? "light" : "primary"} />
              <Cta cta={p.secondaryCta} kind={primary ? "ghost-light" : "secondary"} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function ContactDetails({ data, showHours = true }: { data: BlockData["contact"]; showHours?: boolean }) {
  return (
    <ul className="space-y-5">
      {data.address.length ? (
        <li className="flex gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">Dirección</p>
            <address className="not-italic text-muted">
              {data.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            {data.mapUrl ? (
              <a href={data.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-bold text-primary underline">
                Cómo llegar (abre el mapa)
              </a>
            ) : null}
          </div>
        </li>
      ) : null}
      {data.phone ? (
        <li className="flex gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">Teléfono</p>
            <a href={telHref(data.phone)} className="text-lg text-primary hover:underline">
              {data.phone}
            </a>
          </div>
        </li>
      ) : null}
      {data.email ? (
        <li className="flex gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">Correo electrónico</p>
            <a href={`mailto:${data.email}`} className="break-all text-primary hover:underline">
              {data.email}
            </a>
          </div>
        </li>
      ) : null}
      {showHours && data.hours.length ? (
        <li className="flex gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">Horario de atención</p>
            <dl className="text-muted">
              {data.hours.map((h) => (
                <div key={h.label} className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink">{h.label}:</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </li>
      ) : null}
    </ul>
  );
}

function ContactInfoBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "contact-info" }>; ctx: Ctx }) {
  const p = block.props;
  const c = ctx.data.contact;
  const withForm = p.showForm && c.formEnabled;
  return (
    <Section block={block}>
      <div className={cn("grid gap-10 text-left", withForm && "lg:grid-cols-[2fr_3fr] lg:gap-16")}>
        <Reveal>
          {p.title ? <h2 className="heading-2">{p.title}</h2> : null}
          {p.intro ? <p className="lead mt-4">{p.intro}</p> : null}
          <div className="mt-8">
            <ContactDetails data={c} showHours={p.showHours} />
          </div>
          {p.showMap && c.mapUrl ? (
            <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-8">
              <MapPin className="h-4 w-4" aria-hidden="true" /> Ver en el mapa
            </a>
          ) : null}
        </Reveal>
        {withForm ? (
          <Reveal delay={120}>
            <ContactForm privacyNote={c.privacyNote} disabled={ctx.isEditorPreview} />
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}

function SpacerBlock({ block }: { block: Extract<AnyBlock, { type: "spacer" }> }) {
  const p = block.props;
  const size = { sm: "h-6", md: "h-12", lg: "h-20", xl: "h-32" }[p.size];
  return (
    <div className={cn(size, "flex items-center", visibilityClasses(block))} aria-hidden="true">
      {p.divider ? <hr className="container-site border-line" /> : null}
    </div>
  );
}

function VideoBlock({ block, ctx }: { block: Extract<AnyBlock, { type: "video" }>; ctx: Ctx }) {
  const p = block.props;
  if (!p.videoId) {
    return ctx.isEditorPreview ? (
      <Section block={block}>
        <div className="flex aspect-video items-center justify-center rounded-theme bg-surface-alt text-muted">
          <Play className="mr-2 h-5 w-5" aria-hidden="true" /> Indica el identificador del vídeo
        </div>
      </Section>
    ) : null;
  }
  return (
    <Section block={block}>
      {p.title ? <h2 className="heading-2 mb-6">{p.title}</h2> : null}
      <VideoEmbed provider={p.provider} videoId={p.videoId} title={p.title || "Vídeo"} />
      {p.caption ? <p className="mt-3 text-sm text-muted">{p.caption}</p> : null}
    </Section>
  );
}

export function BlockView({ block, ctx }: { block: AnyBlock; ctx: Ctx }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock block={block} ctx={ctx} />;
    case "hero-split":
      return <HeroSplitBlock block={block} ctx={ctx} />;
    case "rich-text":
      return <RichTextBlock block={block} />;
    case "image-text":
      return <ImageTextBlock block={block} ctx={ctx} />;
    case "gallery":
      return <GalleryBlock block={block} ctx={ctx} />;
    case "services":
      return <ServicesBlock block={block} ctx={ctx} />;
    case "news":
      return <NewsBlock block={block} ctx={ctx} />;
    case "events":
      return <EventsBlock block={block} ctx={ctx} />;
    case "values":
      return <ValuesBlock block={block} />;
    case "testimonials":
      return <TestimonialsBlock block={block} ctx={ctx} />;
    case "team":
      return <TeamBlock block={block} ctx={ctx} />;
    case "cta":
      return <CtaBlock block={block} ctx={ctx} />;
    case "contact-info":
      return <ContactInfoBlock block={block} ctx={ctx} />;
    case "spacer":
      return <SpacerBlock block={block} />;
    case "video":
      return <VideoBlock block={block} ctx={ctx} />;
    default:
      return null;
  }
}

export function BlocksView({ blocks, ...ctx }: { blocks: AnyBlock[] } & Omit<Ctx, "first">) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={block.key} block={block} ctx={{ ...ctx, first: i === 0 }} />
      ))}
    </>
  );
}
