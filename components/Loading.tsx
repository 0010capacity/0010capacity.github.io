interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export default function Loading({ message = '로딩 중...', size = 'md', className = '' }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeStyles[size]}`}></div>
      {message && <span className="text-gray-600 dark:text-gray-300">{message}</span>}
    </div>
  );
}
