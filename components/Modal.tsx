import { Modal as MantineModal } from "@mantine/core";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}: ModalProps) {
  return (
    <MantineModal
      opened={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      centered
    >
      {children}
    </MantineModal>
  );
}
