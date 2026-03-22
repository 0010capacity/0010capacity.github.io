import { Badge as MantineBadge } from "@mantine/core";
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const mapVariant = (variant: BadgeProps["variant"]): { color?: string } => {
  switch (variant) {
    case "success":
      return { color: "green" };
    case "warning":
      return { color: "yellow" };
    case "error":
      return { color: "red" };
    case "info":
      return { color: "blue" };
    case "default":
    default:
      return { color: "gray" };
  }
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const { color } = mapVariant(variant);

  return (
    <MantineBadge
      color={color}
      size={size}
      className={className}
      variant="light"
      radius="xl"
    >
      {children}
    </MantineBadge>
  );
}
