"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  minHeight?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "마크다운으로 작성하세요...",
  height = 400,
  minHeight = 300,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview" | "live">("live");

  return (
    <div className="markdown-editor-wrapper" data-color-mode="dark">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            mode === "edit"
              ? "bg-neutral-700 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          편집
        </button>
        <button
          type="button"
          onClick={() => setMode("live")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            mode === "live"
              ? "bg-neutral-700 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          실시간
        </button>
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            mode === "preview"
              ? "bg-neutral-700 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          미리보기
        </button>
      </div>

      {/* Editor */}
      <MDEditor
        value={value}
        onChange={val => onChange(val || "")}
        preview={mode}
        height={height}
        minHeight={minHeight}
        textareaProps={{
          placeholder,
        }}
        style={{
          backgroundColor: "#171717",
          borderRadius: "0.5rem",
        }}
        previewOptions={{
          style: {
            backgroundColor: "#171717",
          },
        }}
      />

      {/* Helper Text */}
      <p className="text-neutral-600 text-xs mt-2">
        마크다운 문법을 지원합니다. # 제목, **굵게**, *기울임*, `코드`,
        [링크](url) 등
      </p>
    </div>
  );
}
