"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import { CharacterCount } from '@tiptap/extensions'
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import styles from "./RichTextEditor.module.css";

type Props = {
  name: string;
  initialValue?: string; // HTML string for prefilling content
  placeholder?: string;
  onChange?: (html: string) => void;
};

export default function RichTextEditor({
  name,
  initialValue = "",
  placeholder = "Describe your event. What should members know about the event?",
  onChange,
}: Props) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [charCount, setCharCount] = useState(0); // Keep track of character count

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ 
        heading: { levels: [1, 2, 3] },
        blockquote: false, // Disable blockquote
        codeBlock: false, // Disable code block
        horizontalRule: false, // Disable horizontal rule
        hardBreak: false, // Disable hard break
    }),
    CharacterCount.configure({
        limit: 5000, // Set character limit
    }),
    ], // Limit headings to H2/H3
    content: initialValue || `<p>${placeholder}</p>`, // Use initialValue if provided, else placeholder as HTML
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
     setCharCount(editor.storage.characterCount.characters()); // Update count
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = html;
      }
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: styles.tiptap, // Use module class for editor
        placeholder,
      },
    },
  });

  // Update content when initialValue changes (for edit mode)
  useEffect(() => {
    if (editor && initialValue && initialValue !== editor.getHTML()) {
      editor.commands.setContent(initialValue);
      setCharCount(editor.storage.characterCount.characters()); 
    }
  }, [editor, initialValue]);

  if (!editor) return null;

  return (
    <div>
      <MenuBar editor={editor} />
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") e.stopPropagation();
        }}
      >
        <EditorContent editor={editor} />
        <p className={`${styles.charCount} ${charCount > 5000 ? styles.error : ''}`}>
            Characters: {charCount} / 5000
        </p>
      </div>
      <input ref={hiddenInputRef} type="hidden" name={name} value={editor.getHTML()} />
    </div>
  );
}

function MenuBar({ editor }: { editor: any }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <div className={styles.controlGroup}>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={editorState.isBold ? styles.isActive : ""}
          type="button"
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? styles.isActive : ""}
          type="button"
        >
          Italic
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()} type="button">
          Clear marks
        </button>
        <button onClick={() => editor.chain().focus().clearNodes().run()} type="button">
          Clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editorState.isParagraph ? styles.isActive : ""}
          type="button"
        >
          Paragraph
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.isHeading1 ? styles.isActive : ""}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isHeading2 ? styles.isActive : ""}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isHeading3 ? styles.isActive : ""}
          type="button"
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? styles.isActive : ""}
          type="button"
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? styles.isActive : ""}
          type="button"
        >
          Ordered list
        </button>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} type="button">
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} type="button">
          Redo
        </button>
      </div>
    </div>
  );
}
