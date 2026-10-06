"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2, CalendarDays, ExternalLink, FileText, HandHeart, Images, Inbox, LayoutDashboard,
  LogOut, Menu, Navigation, Newspaper, Palette, Settings, X,
} from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { useAdminHref } from "./ui";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "", label: "Resumen", icon: LayoutDashboard },
  { href: "/paginas", label: "Páginas", icon: FileText },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/eventos", label: "Eventos y calendario", icon: CalendarDays },
  { href: "/servicios", label: "Servicios", icon: HandHeart },
  { href: "/multimedia", label: "Galería multimedia", icon: Images },
  { href: "/menus", label: "Menús y navegación", icon: Navigation },
  { href: "/apariencia", label: "Apariencia y temas", icon: Palette, adminOnly: true },
  { href: "/centro", label: "Información del centro", icon: Building2, adminOnly: true },
  { href: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function AdminSidebar({
  userLabel,
  role,
  siteName,
  newMessages,
}: {
  userLabel: string;
  role: "admin" | "editor";
  siteName: string;
  newMessages: number;
}) {
  const pathname = usePathname();
  const href = useAdminHref();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  const base = href("");
  const isActive = (path: string) => {
    const full = href(path);
    return path === "" ? pathname === base : pathname === full || pathname.startsWith(`${full}/`);
  };

  const nav = (
    <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {NAV.filter((i) => !("adminOnly" in i && i.adminOnly) || role === "admin").map((item, idx) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={href(item.href)}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-sage-600 text-white shadow-sm" : "text-stone-700 hover:bg-stone-200/70",
                )}
              >
                <span className={cn("w-4 text-right text-xs tabular-nums", active ? "text-white/70" : "text-stone-400")}>{idx + 1}</span>
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="pt-3">
          <Link
            href={href("/mensajes")}
            prefetch={false}
            aria-current={isActive("/mensajes") ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
              isActive("/mensajes") ? "bg-sage-600 text-white" : "text-stone-700 hover:bg-stone-200/70",
            )}
          >
            <span className="w-4" />
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Mensajes de contacto
            {newMessages > 0 ? (
              <span className="ml-auto rounded-full bg-[#c08a5b] px-2 py-0.5 text-xs text-white">{newMessages}</span>
            ) : null}
          </Link>
        </li>
      </ul>
    </nav>
  );

  const footer = (
    <div className="border-t border-stone-200 p-3">
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200/70">
        <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver la web
      </a>
      <div className="mt-2 rounded-lg bg-stone-100 px-3 py-2">
        <p className="truncate text-sm font-bold text-stone-800" title={userLabel}>
          {userLabel}
        </p>
        <p className="text-xs text-stone-500">{role === "admin" ? "Administrador/a" : "Editor/a"}</p>
      </div>
      <form action={signOut} className="mt-2">
        <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200/70">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200 bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-extrabold text-stone-800">{siteName}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-sidebar" className="rounded-lg p-2 hover:bg-stone-200/70">
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
      </div>
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200 bg-[#fbfaf7] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="20" cy="17" r="6" />
              <path d="M20 5v3M9.5 9.5l2 2M30.5 9.5l-2 2M8 31c4-4 8-5 12-5s8 1 12 5" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-stone-900">{siteName}</p>
            <p className="text-xs text-stone-500">Panel de gestión</p>
          </div>
        </div>
        {nav}
        {footer}
      </aside>
      {open ? <div className="fixed inset-0 z-40 bg-stone-900/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
    </>
  );
}
