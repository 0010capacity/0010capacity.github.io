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
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role={role || "region"}
      aria-labelledby={cardId}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3
                  id={cardId}
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div
                className="flex space-x-2"
                role="group"
                aria-label="Card actions"
              >
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
