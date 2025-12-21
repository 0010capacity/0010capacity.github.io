import { Card as MantineCard, Text, Group } from "@mantine/core";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  role?: string;
}

export default function Card({
  children,
  className = "",
  title,
  subtitle,
  actions,
  role,
}: CardProps) {
  const cardId = title
    ? `card-${title.toLowerCase().replace(/\s+/g, "-")}`
    : undefined;

  return (
    <MantineCard
      shadow="sm"
      padding="lg"
      radius="lg"
      withBorder
      className={className}
      role={role || "region"}
      aria-labelledby={cardId}
    >
      {(title || subtitle || actions) && (
        <MantineCard.Section withBorder inheritPadding py="xs">
          <Group justify="space-between" align="center">
            <div>
              {title && (
                <Text
                  fw={600}
                  size="lg"
                  id={cardId}
                  c="bright" // Uses theme foreground
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text size="sm" c="dimmed" mt={4}>
                  {subtitle}
                </Text>
              )}
            </div>
            {actions && (
              <Group gap="xs" role="group" aria-label="Card actions">
                {actions}
              </Group>
            )}
          </Group>
        </MantineCard.Section>
      )}
      <div style={{ paddingTop: "var(--mantine-spacing-md)" }}>{children}</div>
    </MantineCard>
  );
}
