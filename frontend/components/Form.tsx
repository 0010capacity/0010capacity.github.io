import { Input, Stack, Group } from "@mantine/core";

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function Form({ children, onSubmit, className = "" }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      <Stack gap="md">{children}</Stack>
    </form>
  );
}

export function FormField({
  label,
  children,
  error,
  required,
  className = "",
}: FormFieldProps) {
  // Mantine inputs often handle their own label/error/required.
  // This wrapper ensures consistent spacing if raw inputs are used,
  // or wraps custom components.
  // Ideally, use Input.Wrapper if passing non-Mantine inputs,
  // or rely on Mantine Input components' props directly.
  return (
    <Input.Wrapper
      label={label}
      error={error}
      required={required}
      className={className}
    >
      {children}
    </Input.Wrapper>
  );
}

export function FormActions({ children, className = "" }: FormActionsProps) {
  return (
    <Group justify="flex-end" gap="sm" pt="md" className={className}>
      {children}
    </Group>
  );
}
