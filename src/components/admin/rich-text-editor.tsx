"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2,
  Strikethrough, Underline as UnderlineIcon, Undo2, Unlink,
} from "lucide-react";
import { MediaPickerDialog } from "./media-picker";
import { Button, Dialog, Field, Input } from "./ui";
import { mediaPublicUrl } from "@/features/media/url";
import { cn } from "@/lib/utils";

/**
 * Editor de texto enriquecido (Tiptap). Solo permite los formatos que la web
 * sabe mostrar; el HTML resultante se sanea de nuevo en el servidor.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí…",
  allowImages = true,
  minimal = false,
  ariaLabel = "Contenido",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  allowImages?: boolean;
  minimal?: boolean;
  ariaLabel?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"], HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: { "aria-label": ariaLabel, "aria-multiline": "true", role: "textbox" },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 bg-white focus-within:border-sage-500 focus-within:ring-2 focus-within:ring-sage-200">
      {editor ? <Toolbar editor={editor} allowImages={allowImages} minimal={minimal} /> : <div className="h-11 border-b border-stone-200 bg-stone-50" />}
      <EditorContent editor={editor} className={cn("tiptap-content", minimal && "[&_.ProseMirror]:min-h-28")} />
    </div>
  );
}

function ToolButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-700 transition hover:bg-stone-200 disabled:opacity-40",
        active && "bg-sage-100 text-sage-800",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, allowImages, minimal }: { editor: Editor; allowImages: boolean; minimal: boolean }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [imgOpen, setImgOpen] = useState(false);
  const c = () => editor.chain().focus();
  const I = "h-4 w-4";

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      c().unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!/^(https:\/\/|mailto:|tel:|\/)/i.test(url)) {
      setLinkError("El enlace debe empezar por https://, mailto:, tel: o / (página de la web).");
      return;
    }
    c().extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50 px-1.5 py-1" role="toolbar" aria-label="Formato del texto">
      <ToolButton label="Negrita" active={state.bold} onClick={() => c().toggleBold().run()}>
        <Bold className={I} aria-hidden="true" />
      </ToolButton>
      <ToolButton label="Cursiva" active={state.italic} onClick={() => c().toggleItalic().run()}>
        <Italic className={I} aria-hidden="true" />
      </ToolButton>
      <ToolButton label="Subrayado" active={state.underline} onClick={() => c().toggleUnderline().run()}>
        <UnderlineIcon className={I} aria-hidden="true" />
      </ToolButton>
      <ToolButton label="Tachado" active={state.strike} onClick={() => c().toggleStrike().run()}>
        <Strikethrough className={I} aria-hidden="true" />
      </ToolButton>
      {!minimal ? (
        <>
          <span className="mx-1 h-5 w-px bg-stone-300" aria-hidden="true" />
          <ToolButton label="Título" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
            <Heading2 className={I} aria-hidden="true" />
          </ToolButton>
          <ToolButton label="Subtítulo" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
            <Heading3 className={I} aria-hidden="true" />
          </ToolButton>
        </>
      ) : null}
      <span className="mx-1 h-5 w-px bg-stone-300" aria-hidden="true" />
      <ToolButton label="Lista con viñetas" active={state.bullet} onClick={() => c().toggleBulletList().run()}>
        <List className={I} aria-hidden="true" />
      </ToolButton>
      <ToolButton label="Lista numerada" active={state.ordered} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className={I} aria-hidden="true" />
      </ToolButton>
      {!minimal ? (
        <>
          <ToolButton label="Cita" active={state.quote} onClick={() => c().toggleBlockquote().run()}>
            <Quote className={I} aria-hidden="true" />
          </ToolButton>
          <ToolButton label="Línea separadora" onClick={() => c().setHorizontalRule().run()}>
            <Minus className={I} aria-hidden="true" />
          </ToolButton>
        </>
      ) : null}
      <span className="mx-1 h-5 w-px bg-stone-300" aria-hidden="true" />
      <ToolButton
        label="Enlace"
        active={state.link}
        onClick={() => {
          setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
          setLinkError("");
          setLinkOpen(true);
        }}
      >
        <Link2 className={I} aria-hidden="true" />
      </ToolButton>
      {state.link ? (
        <ToolButton label="Quitar enlace" onClick={() => c().unsetLink().run()}>
          <Unlink className={I} aria-hidden="true" />
        </ToolButton>
      ) : null}
      {allowImages ? (
        <ToolButton label="Insertar imagen" onClick={() => setImgOpen(true)}>
          <ImagePlus className={I} aria-hidden="true" />
        </ToolButton>
      ) : null}
      <span className="ml-auto flex">
        <ToolButton label="Deshacer" disabled={!state.canUndo} onClick={() => c().undo().run()}>
          <Undo2 className={I} aria-hidden="true" />
        </ToolButton>
        <ToolButton label="Rehacer" disabled={!state.canRedo} onClick={() => c().redo().run()}>
          <Redo2 className={I} aria-hidden="true" />
        </ToolButton>
      </span>

      <Dialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Insertar enlace"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLinkOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={applyLink}>Aplicar</Button>
          </>
        }
      >
        <Field label="Dirección del enlace" htmlFor="link-url" error={linkError} hint="Ejemplos: https://ejemplo.es, /contacto, tel:+34900000000">
          <Input
            id="link-url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            autoFocus
          />
        </Field>
      </Dialog>
      {allowImages ? (
        <MediaPickerDialog
          open={imgOpen}
          onClose={() => setImgOpen(false)}
          title="Insertar imagen en el texto"
          onSelect={([m]) => {
            if (m) c().setImage({ src: mediaPublicUrl(m.storage_path), alt: m.alt_text || m.title }).run();
          }}
        />
      ) : null}
    </div>
  );
}
