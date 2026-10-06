"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { cn, telHref } from "@/lib/utils";

export type NavItem = { id: string; label: string; href: string; newTab: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex items-center gap-4 xl:gap-6">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="nav-link text-[0.97rem]"
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Menú móvil accesible: botón con aria-expanded, cierre con Escape y al navegar. */
export function MobileNav({ items, phone, ctaLabel, ctaHref }: { items: NavItem[]; phone: string; ctaLabel: string; ctaHref: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-header-ink hover:bg-primary/10"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
      </button>
      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h,4.5rem)] bottom-0 z-40 overflow-y-auto bg-header px-5 pb-10 pt-4 shadow-theme-lg"
      >
        <nav aria-label="Principal (móvil)">
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-4 text-lg font-semibold",
                    isActive(pathname, item.href) ? "text-primary" : "text-header-ink",
                  )}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 grid gap-3">
          <Link href={ctaHref} className="btn btn-primary w-full">
            {ctaLabel}
          </Link>
          {phone ? (
            <a href={telHref(phone)} className="btn btn-secondary w-full">
              <Phone className="h-4 w-4" aria-hidden="true" /> {phone}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
