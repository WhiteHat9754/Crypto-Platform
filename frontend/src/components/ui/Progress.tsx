interface ProgressProps {
  percentage: number;
  className?: string;
}

export const Progress = ({ percentage, className = '' }: ProgressProps) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700 mt-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${className}`}
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      ></div>
    </div>
  );
};
