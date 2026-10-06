import "server-only";
import { BlocksView } from "./blocks-view";
import { loadBlockData } from "@/features/blocks/load-data";
import { getActiveTheme } from "@/features/site/queries";
import type { AnyBlock } from "@/features/blocks/schema";
import { sanitizeRichText } from "@/lib/sanitize";

/** Sanea de nuevo el HTML de los bloques antes de mostrarlo (defensa en profundidad). */
export function sanitizeBlocks(blocks: AnyBlock[]): AnyBlock[] {
  return blocks.map((b) => {
    if (b.type === "rich-text" || b.type === "image-text") {
      return { ...b, props: { ...b.props, html: sanitizeRichText(b.props.html) } } as AnyBlock;
    }
    return b;
  });
}

/** Renderizado en servidor de los bloques de una página publicada. */
export async function BlocksRenderer({ blocks }: { blocks: AnyBlock[] }) {
  const clean = sanitizeBlocks(blocks);
  const [data, theme] = await Promise.all([loadBlockData(clean), getActiveTheme()]);
  return <BlocksView blocks={clean} data={data} theme={theme.tokens.components} />;
}
