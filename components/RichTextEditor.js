import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import styles from "./RichTextEditor.module.css";

function ToolbarButton({ onClick, active, disabled, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${active ? styles.btnActive : ""}`}
    >
      <span className={styles.btnLabel}>{children}</span>
    </button>
  );
}

export default function RichTextEditor({ value = "", onChange, onUploadImage }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: null,
        },
      }),
      Image.configure({ inline: false }),

      // ✅ Tablas
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rte-prosemirror",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("URL del enlace:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = async () => {
    if (!onUploadImage) {
      const url = window.prompt("URL de la imagen:");
      if (!url) return;
      editor.chain().focus().setImage({ src: url }).run();
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const url = await onUploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert("No se pudo subir la imagen.");
      }
    };
    input.click();
  };

  const insertTable = () => {
    // tabla 3x3 con header
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const isInTable = editor.isActive("table");

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <ToolbarButton title="Negrita" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          B
        </ToolbarButton>

        <ToolbarButton
          title="Cursiva"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          I
        </ToolbarButton>

        <ToolbarButton
          title="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          title="Lista"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          • List
        </ToolbarButton>

        <ToolbarButton title="Enlace" onClick={setLink} active={editor.isActive("link")}>
          Link
        </ToolbarButton>

        <ToolbarButton title="Imagen" onClick={addImage}>
          Img
        </ToolbarButton>

        {/* ✅ Tablas */}
        <ToolbarButton title="Insertar tabla" onClick={insertTable} active={false}>
          Table
        </ToolbarButton>

        <ToolbarButton title="Añadir fila" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!isInTable}>
          +Row
        </ToolbarButton>

        <ToolbarButton title="Quitar fila" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!isInTable}>
          -Row
        </ToolbarButton>

        <ToolbarButton title="Añadir columna" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!isInTable}>
          +Col
        </ToolbarButton>

        <ToolbarButton title="Quitar columna" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!isInTable}>
          -Col
        </ToolbarButton>

        <ToolbarButton
          title="Header on/off"
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          disabled={!isInTable}
          active={editor.isActive("tableHeader")}
        >
          Th
        </ToolbarButton>

        <ToolbarButton title="Borrar tabla" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!isInTable}>
          DelTbl
        </ToolbarButton>

        <div className={styles.spacer} />

        <ToolbarButton title="Deshacer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          ↶
        </ToolbarButton>

        <ToolbarButton title="Rehacer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          ↷
        </ToolbarButton>
      </div>

      <div className={`${styles.content} ${styles.prose}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
