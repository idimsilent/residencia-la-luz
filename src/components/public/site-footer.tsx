import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SocialIcon } from "./social-icon";
import type { NavItem } from "./nav-links";
import type { OpeningHour, SocialLink } from "@/features/site/queries";
import { telHref } from "@/lib/utils";

export function SiteFooter({
  siteName,
  tagline,
  address,
  phone,
  email,
  hours,
  social,
  mainLinks,
  legalLinks,
  layout,
}: {
  siteName: string;
  tagline: string;
  address: string[];
  phone: string;
  email: string;
  hours: OpeningHour[];
  social: SocialLink[];
  mainLinks: NavItem[];
  legalLinks: NavItem[];
  layout: "columns" | "simple";
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-footer text-footer-ink">
      {layout === "columns" ? (
        <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-2xl">{siteName}</p>
            {tagline ? <p className="mt-3 max-w-xs text-sm opacity-80">{tagline}</p> : null}
            {social.length ? (
              <ul className="mt-5 flex gap-3" aria-label="Redes sociales">
                {social.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                    >
                      <SocialIcon network={s.network} className="h-5 w-5" />
                      <span className="sr-only">{s.network}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">Contacto</p>
            <ul className="mt-4 space-y-3 text-sm">
              {address.length ? (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <address className="not-italic">
                    {address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              ) : null}
              {phone ? (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={telHref(phone)} className="hover:underline">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="break-all hover:underline">
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">Horario de atención</p>
            <ul className="mt-4 space-y-2 text-sm">
              {hours.map((h) => (
                <li key={h.label} className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{h.label}</span>
                    <span className="opacity-80">{h.hours}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Enlaces del pie">
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">Enlaces</p>
            <ul className="mt-4 space-y-2 text-sm">
              {mainLinks.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : (
        <div className="container-site flex flex-col items-center gap-4 py-10 text-center text-sm">
          <p className="font-heading text-2xl">{siteName}</p>
          <p className="opacity-85">
            {[address.join(", "), phone, email].filter(Boolean).join(" · ")}
          </p>
          <nav aria-label="Enlaces del pie">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {mainLinks.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-5 text-xs opacity-80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteName}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {legalLinks.map((l) => (
              <li key={l.id}>
                <Link href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
