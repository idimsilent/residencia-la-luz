import Link from "next/link";
import { Phone } from "lucide-react";
import { Logo } from "./logo";
import { DesktopNav, MobileNav, type NavItem } from "./nav-links";
import type { MediaLite } from "@/features/media/url";
import type { ThemeTokens } from "@/features/theme/schema";
import { cn, telHref } from "@/lib/utils";

export function SiteHeader({
  siteName,
  logo,
  items,
  phone,
  layout,
  sticky,
}: {
  siteName: string;
  logo: MediaLite | null;
  items: NavItem[];
  phone: string;
  layout: ThemeTokens["components"]["headerLayout"];
  sticky: boolean;
}) {
  const cta = { label: "Solicitar información", href: "/contacto" };
  return (
    <header
      className={cn(
        "z-50 border-b border-line/70 bg-header/95 backdrop-blur supports-[backdrop-filter]:bg-header/85",
        sticky ? "sticky top-0" : "relative",
      )}
      style={{ ["--header-h" as string]: "4.75rem" }}
    >
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-theme"
      >
        Saltar al contenido
      </a>
      {layout === "centered" ? (
        <div className="container-site flex flex-col items-center gap-2 py-3 lg:py-4">
          <div className="flex w-full items-center justify-between lg:justify-center">
            <Logo name={siteName} logo={logo} />
            <MobileNav items={items} phone={phone} ctaLabel={cta.label} ctaHref={cta.href} />
          </div>
          <div className="hidden w-full items-center justify-center gap-8 lg:flex">
            <DesktopNav items={items} />
            <Link href={cta.href} className="btn btn-primary min-h-10 px-5 py-2 text-sm">
              {cta.label}
            </Link>
          </div>
        </div>
      ) : (
        <div className="container-site flex h-[4.75rem] items-center justify-between gap-6">
          <Logo name={siteName} logo={logo} />
          <DesktopNav items={items} />
          <div className="flex items-center gap-2">
            {phone && layout === "classic" ? (
              <a
                href={telHref(phone)}
                className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-header-ink hover:text-primary xl:inline-flex"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {phone}
              </a>
            ) : null}
            <Link href={cta.href} className="btn btn-primary hidden min-h-10 px-5 py-2 text-sm sm:inline-flex">
              {layout === "minimal" ? "Contacto" : cta.label}
            </Link>
            <MobileNav items={items} phone={phone} ctaLabel={cta.label} ctaHref={cta.href} />
          </div>
        </div>
      )}
    </header>
  );
}
