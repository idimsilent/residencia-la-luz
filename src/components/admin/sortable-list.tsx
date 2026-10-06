"use client";

import { useId, type ReactNode } from "react";
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lista ordenable con ratón, pantalla táctil y teclado (espacio para coger,
 * flechas para mover, espacio para soltar).
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  itemClassName,
  label = "Elemento",
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  label?: string;
}) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  };
  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: "Pulsa espacio para coger el elemento, usa las flechas para moverlo y espacio de nuevo para soltarlo. Escape cancela." },
        announcements: {
          onDragStart: () => `${label} cogido.`,
          onDragOver: ({ over }) => (over ? `Sobre la posición ${items.findIndex((i) => i.id === over.id) + 1}.` : ""),
          onDragEnd: ({ over }) => (over ? `${label} soltado en la posición ${items.findIndex((i) => i.id === over.id) + 1}.` : `${label} soltado.`),
          onDragCancel: () => "Movimiento cancelado.",
        },
      }}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, i) => (
            <SortableRow key={item.id} id={item.id} className={itemClassName} label={label}>
              {renderItem(item, i)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children, className, label }: { id: string; children: ReactNode; className?: string; label: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2", isDragging && "relative z-10 opacity-90 shadow-lg", className)}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 active:cursor-grabbing"
        aria-label={`Mover ${label.toLowerCase()}`}
      >
        <GripVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
