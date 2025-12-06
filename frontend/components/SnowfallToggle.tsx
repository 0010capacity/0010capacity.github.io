"use client";

import { useSnowfall } from "./SnowfallProvider";

export default function SnowfallToggle() {
  const { isEnabled, toggle } = useSnowfall();

  return (
    <button
      onClick={toggle}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
        isEnabled
          ? "bg-neutral-700 hover:bg-neutral-600 text-white"
          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-500"
      }`}
      aria-label={isEnabled ? "눈 효과 끄기" : "눈 효과 켜기"}
      title={isEnabled ? "눈 효과 끄기" : "눈 효과 켜기"}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L9.5 6.5L5 5.5L6.5 10L2 12L6.5 14L5 18.5L9.5 17.5L12 22L14.5 17.5L19 18.5L17.5 14L22 12L17.5 10L19 5.5L14.5 6.5L12 2Z" />
      </svg>
    </button>
  );
}
