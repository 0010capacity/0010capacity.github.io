"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = "태그 입력 후 Enter",
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();

    if (trimmedValue === "") return;
    if (tags.includes(trimmedValue)) {
      setInputValue("");
      return;
    }
    if (tags.length >= maxTags) return;

    onChange([...tags, trimmedValue]);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded min-h-[48px]">
        {/* Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-800 text-neutral-300 text-sm rounded"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors ml-1"
            >
              ×
            </button>
          </span>
        ))}

        {/* Input */}
        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent text-neutral-100 placeholder-neutral-600 focus:outline-none text-sm"
          />
        )}
      </div>

      {/* Helper Text */}
      <div className="flex justify-between mt-1">
        <p className="text-neutral-600 text-xs">
          Enter 키로 태그 추가, Backspace로 삭제
        </p>
        <p className="text-neutral-600 text-xs">
          {tags.length}/{maxTags}
        </p>
      </div>
    </div>
  );
}
