import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { ThemesList } from "@/components/admin/themes/themes-list";
import { AdminOnly } from "@/features/admin/guards";
import { parseTheme } from "@/features/theme/schema";
import { FONT_OPTIONS } from "@/features/theme/fonts";

export const metadata: Metadata = { title: "Apariencia y temas" };

export default async function ThemesPage() {
  const { supabase, role } = await requireStaffPage();
  if (role !== "admin") return <AdminOnly title="Apariencia y temas" />;
  const { data } = await supabase.from("themes").select("id, name, is_active, is_preset, tokens, draft_tokens").order("is_active", { ascending: false }).order("is_preset", { ascending: false }).order("name");
  const themes = (data ?? []).flatMap((row) => {
    const t = parseTheme(row.tokens);
    if (!t) return [];
    return [
      {
        id: row.id,
        name: row.name,
        isActive: row.is_active,
        isPreset: row.is_preset,
        hasDraft: row.draft_tokens !== null,
        swatches: [t.colors.primary, t.colors.secondary, t.colors.accent, t.colors.background, t.colors.surfaceAlt, t.colors.footerBg],
        headingFont: FONT_OPTIONS[t.typography.headingFont].label.split(" (")[0],
      },
    ];
  });
  return (
    <>
      <PageHeader
        title="Apariencia y temas"
        description="Elige los colores, la tipografía y el estilo de la web. Personaliza un tema, pruébalo en la web sin que nadie más lo vea y publícalo cuando te guste."
      />
      <ThemesList themes={themes} />
    </>
  );
}
