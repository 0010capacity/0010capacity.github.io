import Link from "next/link";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import {
  Button as MantineButton,
  MantineColor,
  MantineSize,
} from "@mantine/core";

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: LucideIcon;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const mapVariant = (
  variant: ButtonProps["variant"]
): { color?: MantineColor; variant: string } => {
  switch (variant) {
    case "primary":
      return { color: "blue", variant: "filled" };
    case "secondary":
      return { color: "gray", variant: "filled" };
    case "success":
      return { color: "green", variant: "filled" };
    case "danger":
      return { color: "red", variant: "filled" };
    case "warning":
      return { color: "yellow", variant: "filled" };
    case "outline":
      return { color: "gray", variant: "outline" };
    default:
      return { color: "blue", variant: "filled" };
  }
};

export default function Button({
  children,
  onClick,
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  icon: Icon,
  ...props
}: ButtonProps) {
  const { color, variant: mantineVariant } = mapVariant(variant);

  const mantineSize = size as MantineSize;

  const commonProps = {
    onClick,
    disabled: disabled || loading,
    loading,
    size: mantineSize,
    color,
    variant: mantineVariant,
    className,
    "aria-label": props["aria-label"],
    "aria-describedby": props["aria-describedby"],
    leftSection: Icon ? <Icon size={16} aria-hidden="true" /> : undefined,
    ...props,
  };

  if (href) {
    return (
      <MantineButton component={Link} href={href} {...commonProps}>
        {children}
      </MantineButton>
    );
  }

  return (
    <MantineButton type={type} {...commonProps}>
      {children}
    </MantineButton>
  );
}
