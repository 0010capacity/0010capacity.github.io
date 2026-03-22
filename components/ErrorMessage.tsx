import { Alert, Button, Group } from "@mantine/core";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  message,
  className = "",
  onRetry,
}: ErrorMessageProps) {
  return (
    <Alert
      variant="light"
      color="red"
      title="Error Occurred"
      icon={<AlertCircle size={16} />}
      className={className}
    >
      {message}
      {onRetry && (
        <Group justify="flex-end" mt="md">
          <Button onClick={onRetry} color="red" size="xs" variant="filled">
            Retry
          </Button>
        </Group>
      )}
    </Alert>
  );
}
