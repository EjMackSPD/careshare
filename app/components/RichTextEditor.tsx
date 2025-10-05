"use client";

import { useState } from "react";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length + selectedText.length + after.length,
        start + before.length + selectedText.length + after.length
      );
    }, 0);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className={styles.toolBtn}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className={styles.toolBtn}
          title="Italic"
        >
          <em>I</em>
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          onClick={() => insertMarkdown("## ")}
          className={styles.toolBtn}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("### ")}
          className={styles.toolBtn}
          title="Heading 3"
        >
          H3
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          onClick={() => insertMarkdown("\n- ")}
          className={styles.toolBtn}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("\n1. ")}
          className={styles.toolBtn}
          title="Numbered List"
        >
          1.
        </button>
        <div className={styles.separator} />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`${styles.toolBtn} ${showPreview ? styles.active : ""}`}
          title="Toggle Preview"
        >
          👁
        </button>
      </div>

      {!showPreview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.textarea}
        />
      ) : (
        <div className={styles.preview}>
          {value.split("\n").map((line, index) => {
            if (line.startsWith("## ")) {
              return <h2 key={index}>{line.replace("## ", "")}</h2>;
            } else if (line.startsWith("### ")) {
              return <h3 key={index}>{line.replace("### ", "")}</h3>;
            } else if (line.startsWith("- ")) {
              return <li key={index}>{line.replace("- ", "")}</li>;
            } else if (/^\d+\./.test(line)) {
              return <li key={index}>{line.replace(/^\d+\.\s*/, "")}</li>;
            } else if (line.trim() === "") {
              return <br key={index} />;
            } else {
              // Simple bold and italic rendering
              const rendered = line
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>");
              return (
                <p key={index} dangerouslySetInnerHTML={{ __html: rendered }} />
              );
            }
          })}
        </div>
      )}

      <div className={styles.help}>
        <small>
          <strong>Markdown Tips:</strong> **bold**, *italic*, ## Heading 2, ###
          Heading 3, - bullet list, 1. numbered list
        </small>
      </div>
    </div>
  );
}

