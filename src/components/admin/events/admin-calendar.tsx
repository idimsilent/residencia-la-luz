"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg, type EventResizeDoneArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventDropArg, EventInput, EventSourceFuncArg } from "@fullcalendar/core";
import { listAdminEvents, moveEvent, saveEvent } from "@/features/events/actions";
import { utcToMadridParts } from "@/lib/dates";
import { Button, Dialog, Field, Input, Select, Switch, useAdminHref, useToast } from "../ui";

type Category = { id: string; name: string; color: string };

/**
 * El calendario trabaja en "UTC" pero le damos las horas de pared de Madrid:
 * así lo que se ve y se arrastra es siempre la hora española, esté donde esté
 * quien gestiona la web.
 */
function toWall(iso: string) {
  const p = utcToMadridParts(iso);
  return { date: p.date, time: p.time, iso: `${p.date}T${p.time}:00Z` };
}
function addDaysStr(date: string, n: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

export function AdminCalendar({ categories }: { categories: Category[] }) {
  const calRef = useRef<FullCalendar>(null);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [quick, setQuick] = useState<{ date: string } | null>(null);
  const toast = useToast();
  const router = useRouter();
  const href = useAdminHref();

  const fetchEvents = useCallback(
    async (info: EventSourceFuncArg): Promise<EventInput[]> => {
      // Margen de un día por la diferencia entre la hora de Madrid y UTC.
      const from = new Date(info.start.getTime() - 86_400_000).toISOString();
      const to = new Date(info.end.getTime() + 86_400_000).toISOString();
      const res = await listAdminEvents({ from, to, category, status });
      if (!res.ok) {
        toast("error", res.error);
        return [];
      }
      return (res.data ?? []).map((e) => {
        const s = toWall(e.starts_at);
        const en = toWall(e.ends_at);
        const color = e.color ?? "#5f7d63";
        return {
          id: e.id,
          title: e.status === "draft" ? `✎ ${e.title}` : e.title,
          start: e.all_day ? s.date : s.iso,
          end: e.all_day ? addDaysStr(en.date, 1) : en.iso,
          allDay: e.all_day,
          backgroundColor: e.status === "draft" ? "#fff" : color,
          borderColor: color,
          textColor: e.status === "draft" ? "#3d3f3c" : "#fff",
          classNames: e.status === "draft" ? ["fc-draft"] : [],
          display: "block",
        };
      });
    },
    [category, status, toast],
  );

  const refetch = () => calRef.current?.getApi().refetchEvents();

  const onDrop = async (info: EventDropArg) => {
    const start = info.event.start!;
    const iso = start.toISOString();
    const res = await moveEvent({
      id: info.event.id,
      start_date: iso.slice(0, 10),
      start_time: info.event.allDay ? undefined : iso.slice(11, 16),
    });
    if (!res.ok) {
      info.revert();
      toast("error", res.error);
    } else {
      toast("success", `Evento movido al ${new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" }).format(start)}.`);
      router.refresh();
    }
  };

  const onResize = async (info: EventResizeDoneArg) => {
    const end = info.event.end;
    if (!end) return info.revert();
    const endDate = info.event.allDay ? addDaysStr(end.toISOString().slice(0, 10), -1) : end.toISOString().slice(0, 10);
    const res = await moveEvent({ id: info.event.id, start_date: info.event.start!.toISOString().slice(0, 10), end_date: endDate });
    if (!res.ok) {
      info.revert();
      toast("error", res.error);
    } else {
      toast("success", "Duración actualizada.");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-sm font-bold text-stone-700">
          Categoría
          <select
            className="admin-input mt-1 w-56"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setTimeout(refetch);
            }}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm font-bold text-stone-700">
          Estado
          <select
            className="admin-input mt-1 w-44"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setTimeout(refetch);
            }}
          >
            <option value="">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </label>
        <ul className="ml-auto flex flex-wrap gap-3 text-xs text-stone-600" aria-label="Leyenda">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: c.color }} aria-hidden="true" /> {c.name}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-stone-400 bg-white" aria-hidden="true" /> Borrador
          </li>
        </ul>
      </div>
      <div className="admin-calendar rounded-2xl border border-stone-200 bg-white p-3 sm:p-4">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          timeZone="UTC"
          firstDay={1}
          height="auto"
          editable
          eventStartEditable
          eventDurationEditable
          dayMaxEvents={4}
          fixedWeekCount={false}
          displayEventEnd={false}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          buttonText={{ today: "Hoy" }}
          events={fetchEvents}
          dateClick={(arg: DateClickArg) => setQuick({ date: arg.dateStr.slice(0, 10) })}
          eventClick={(arg) => {
            arg.jsEvent.preventDefault();
            router.push(href(`/eventos/${arg.event.id}`));
          }}
          eventDrop={onDrop}
          eventResize={onResize}
        />
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Haz clic en un día para crear un evento. Arrastra un evento para cambiarlo de día. Todas las horas son de Madrid.
      </p>
      {quick ? (
        <QuickEventDialog
          date={quick.date}
          categories={categories}
          onClose={() => setQuick(null)}
          onSaved={() => {
            setQuick(null);
            refetch();
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function QuickEventDialog({ date, categories, onClose, onSaved }: { date: string; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("18:00");
  const [categoryId, setCategoryId] = useState("");
  const [publish, setPublish] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const href = useAdminHref();
  const label = new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  const save = () =>
    startTransition(async () => {
      const res = await saveEvent({
        title,
        slug: "",
        summary: "",
        description_html: "",
        all_day: allDay,
        start_date: date,
        start_time: allDay ? "" : start,
        end_date: date,
        end_time: allDay ? "" : end,
        location: "",
        media_id: null,
        category_id: categoryId || null,
        status: publish ? "published" : "draft",
        is_featured: false,
        has_detail_page: true,
        external_url: "",
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast("error", res.error);
        return;
      }
      toast("success", res.message ?? "Evento creado.");
      onSaved();
    });

  return (
    <Dialog
      open
      onClose={onClose}
      title="Nuevo evento"
      size="sm"
      footer={
        <>
          <Link href={href(`/eventos/nuevo?fecha=${date}`)} prefetch={false} className="mr-auto self-center text-sm font-bold text-sage-700 hover:underline">
            Más opciones
          </Link>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={pending}>
            Crear evento
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm font-bold capitalize text-sage-800">{label}</p>
        <Field label="Título" htmlFor="qe-title" required error={errors.title}>
          <Input id="qe-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={200} />
        </Field>
        <Switch checked={allDay} onChange={setAllDay} label="Todo el día" />
        {!allDay ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Empieza" htmlFor="qe-start" error={errors.start_time}>
              <Input id="qe-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Termina" htmlFor="qe-end" error={errors.end_date}>
              <Input id="qe-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
        ) : null}
        <Field label="Categoría" htmlFor="qe-cat">
          <Select id="qe-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Switch checked={publish} onChange={setPublish} label="Publicar en la web" description="Si lo desactivas se guarda como borrador." />
      </div>
    </Dialog>
  );
}
