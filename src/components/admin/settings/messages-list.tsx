"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Mail, MailOpen, Phone, Trash2 } from "lucide-react";
import { deleteMessages, setMessageStatus } from "@/features/settings/actions";
import { Badge, Button, EmptyState, useConfirm, useToast } from "../ui";
import { cn, telHref } from "@/lib/utils";

export type MessageRow = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; status: "new" | "read" | "archived"; when: string };

export function MessagesList({ rows, isAdmin }: { rows: MessageRow[]; isAdmin: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();

  const status = (id: string, s: MessageRow["status"], quiet = false) =>
    startTransition(async () => {
      const res = await setMessageStatus({ ids: [id], status: s });
      if (!res.ok) return toast("error", res.error);
      if (!quiet) toast("success", s === "archived" ? "Mensaje archivado." : s === "new" ? "Marcado como no leído." : "Marcado como leído.");
      router.refresh();
    });

  if (!rows.length) return <EmptyState title="No hay mensajes">Los mensajes que lleguen por el formulario de contacto aparecerán aquí.</EmptyState>;

  return (
    <ul className="space-y-2">
      {rows.map((m) => {
        const expanded = open === m.id;
        return (
          <li key={m.id} className={cn("rounded-2xl border bg-white", m.status === "new" ? "border-sage-300" : "border-stone-200")}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => {
                setOpen(expanded ? null : m.id);
                if (!expanded && m.status === "new") status(m.id, "read", true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              {m.status === "new" ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sage-600" aria-label="No leído" /> : <span className="h-2.5 w-2.5 shrink-0" />}
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-stone-900", m.status === "new" ? "font-extrabold" : "font-semibold")}>
                  {m.name} {m.subject ? <span className="font-normal text-stone-500">· {m.subject}</span> : null}
                </span>
                <span className="block truncate text-sm text-stone-500">{m.message}</span>
              </span>
              <span className="shrink-0 text-xs text-stone-500">{m.when}</span>
              {m.status === "archived" ? <Badge>Archivado</Badge> : null}
            </button>
            {expanded ? (
              <div className="border-t border-stone-100 px-4 py-4">
                <p className="whitespace-pre-wrap text-sm text-stone-800">{m.message}</p>
                <p className="mt-3 flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Su consulta"}`)}`} className="inline-flex items-center gap-1.5 font-bold text-sage-700 hover:underline">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {m.email}
                  </a>
                  {m.phone ? (
                    <a href={telHref(m.phone)} className="inline-flex items-center gap-1.5 font-bold text-sage-700 hover:underline">
                      <Phone className="h-4 w-4" aria-hidden="true" /> {m.phone}
                    </a>
                  ) : null}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => status(m.id, "new")}>
                    <MailOpen className="h-4 w-4" aria-hidden="true" /> Marcar como no leído
                  </Button>
                  {m.status !== "archived" ? (
                    <Button size="sm" variant="secondary" disabled={pending} onClick={() => status(m.id, "archived")}>
                      <Archive className="h-4 w-4" aria-hidden="true" /> Archivar
                    </Button>
                  ) : null}
                  {isAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#b42318]"
                      disabled={pending}
                      onClick={async () => {
                        if (!(await confirm({ title: "¿Eliminar el mensaje?", message: "Se borrará definitivamente, junto con los datos personales que contiene.", confirmLabel: "Eliminar" }))) return;
                        startTransition(async () => {
                          const res = await deleteMessages([m.id]);
                          if (!res.ok) return toast("error", res.error);
                          toast("success", res.message ?? "Eliminado.");
                          router.refresh();
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
