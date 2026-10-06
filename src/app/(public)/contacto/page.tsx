import type { Metadata } from "next";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { PageHero } from "@/components/public/page-hero";
import { ContactForm } from "@/components/public/contact-form";
import { ContactDetails } from "@/components/blocks/blocks-view";
import { JsonLd } from "@/components/public/json-ld";
import { getPageBySlug, getSiteSettings, parseOpeningHours } from "@/features/site/queries";
import { pageMetadata } from "@/features/pages/metadata";
import { env } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contacto", "Contacto", "/contacto");
}

export default async function ContactPage() {
  const [resolved, s] = await Promise.all([getPageBySlug("contacto"), getSiteSettings()]);
  const blocks = resolved?.blocks ?? [];
  const contact = {
    phone: s?.phone ?? "",
    email: s?.email ?? "",
    address: [s?.address_line, [s?.postal_code, s?.city].filter(Boolean).join(" "), s?.province].filter((v): v is string => Boolean(v)),
    hours: parseOpeningHours(s?.opening_hours),
    mapUrl: s?.map_url ?? null,
    formEnabled: s?.contact_form_enabled ?? false,
    privacyNote: s?.contact_privacy_note ?? "",
  };
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: s?.site_name,
          url: env.siteUrl,
          telephone: s?.phone || undefined,
          email: s?.email || undefined,
          address: {
            "@type": "PostalAddress",
            streetAddress: s?.address_line,
            postalCode: s?.postal_code,
            addressLocality: s?.city,
            addressRegion: s?.province,
            addressCountry: "ES",
          },
        }}
      />
      {blocks.length ? <BlocksRenderer blocks={blocks} /> : <PageHero eyebrow="Hablemos" title="Contacto" />}
      <section className="container-site grid gap-12 pb-20 pt-8 lg:grid-cols-[2fr_3fr]">
        <div>
          <h2 className="heading-3 mb-6">Datos de contacto</h2>
          <ContactDetails data={contact} />
        </div>
        <div>
          <h2 className="heading-3 mb-6">Escríbenos</h2>
          {contact.formEnabled ? (
            <ContactForm privacyNote={contact.privacyNote} />
          ) : (
            <p className="card p-6 text-muted">El formulario no está disponible ahora mismo. Puedes llamarnos o escribirnos por correo.</p>
          )}
        </div>
      </section>
    </>
  );
}
