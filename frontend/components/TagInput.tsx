"use client";

import { TagsInput } from "@mantine/core";

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
  return (
    <TagsInput
      value={tags}
      onChange={onChange}
      placeholder={tags.length === 0 ? placeholder : ""}
      maxTags={maxTags}
      description={`Enter 키로 태그 추가, Backspace로 삭제 (${tags.length}/${maxTags})`}
      clearable
      splitChars={[",", " ", "Enter"]}
      acceptValueOnBlur
      classNames={{
        input: "dark:bg-neutral-900 dark:border-neutral-800",
      }}
    />
  );
}
