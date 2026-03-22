import {
  TextInput,
  Textarea as MantineTextarea,
  Select as MantineSelect,
  TextInputProps,
  TextareaProps as MantineTextareaProps,
  SelectProps as MantineSelectProps,
} from "@mantine/core";

interface InputProps extends TextInputProps {
  error?: boolean;
}

interface TextareaProps extends MantineTextareaProps {
  error?: boolean;
}

interface SelectProps extends Omit<MantineSelectProps, "data"> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <TextInput
      {...props}
      error={error}
      className={className}
      classNames={{ input: "dark:bg-gray-700" }} // Maintain dark mode bg if needed, though Mantine handles it
    />
  );
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return <MantineTextarea {...props} error={error} className={className} />;
}

export function Select({
  error,
  className = "",
  options,
  ...props
}: SelectProps) {
  return (
    <MantineSelect
      {...props}
      data={options}
      error={error}
      className={className}
    />
  );
}
