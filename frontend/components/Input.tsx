interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  className?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  className?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  className?: string;
  options: { value: string; label: string }[];
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
        error
          ? "border-red-300 focus:ring-red-500"
          : "border-gray-300 dark:border-gray-600"
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
    />
  );
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical ${
        error
          ? "border-red-300 focus:ring-red-500"
          : "border-gray-300 dark:border-gray-600"
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
    />
  );
}

export function Select({
  error,
  className = "",
  options,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
        error
          ? "border-red-300 focus:ring-red-500"
          : "border-gray-300 dark:border-gray-600"
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
