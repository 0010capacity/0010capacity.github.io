import { Loader, Group, Text } from "@mantine/core";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loading({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingProps) {
  return (
    <Group justify="center" gap="xs" className={className}>
      <Loader size={size} color="blue" type="oval" />
      {message && (
        <Text c="dimmed" size={size}>
          {message}
        </Text>
      )}
    </Group>
  );
}
