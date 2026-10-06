import {
  Accessibility, Activity, Bed, BookOpen, Calendar, Coffee, Flower2, HandHeart, Heart, House,
  Leaf, Music, Shield, Smile, Sparkles, Stethoscope, Sun, Trees, Users, Utensils,
  type LucideIcon,
} from "lucide-react";

/** Lista cerrada de iconos seleccionables desde el panel. */
export const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  heart: { icon: Heart, label: "Corazón" },
  home: { icon: House, label: "Hogar" },
  users: { icon: Users, label: "Personas" },
  leaf: { icon: Leaf, label: "Hoja" },
  sun: { icon: Sun, label: "Sol" },
  shield: { icon: Shield, label: "Escudo" },
  "hand-heart": { icon: HandHeart, label: "Mano y corazón" },
  smile: { icon: Smile, label: "Sonrisa" },
  utensils: { icon: Utensils, label: "Cubiertos" },
  activity: { icon: Activity, label: "Actividad" },
  music: { icon: Music, label: "Música" },
  book: { icon: BookOpen, label: "Libro" },
  flower: { icon: Flower2, label: "Flor" },
  coffee: { icon: Coffee, label: "Café" },
  stethoscope: { icon: Stethoscope, label: "Estetoscopio" },
  accessibility: { icon: Accessibility, label: "Accesibilidad" },
  calendar: { icon: Calendar, label: "Calendario" },
  sparkles: { icon: Sparkles, label: "Destellos" },
  trees: { icon: Trees, label: "Árboles" },
  bed: { icon: Bed, label: "Cama" },
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name]?.icon ?? Heart;
  return <Cmp className={className} aria-hidden="true" strokeWidth={1.6} />;
}
