import { Progress } from '../../components/ui/Progress';

interface PasswordStrengthProps {
  value: string;
}

export const PasswordStrength = ({ value }: PasswordStrengthProps) => {
  // Simple password strength calculation
  const calculateStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    return score;
  };

  const strength = calculateStrength(value);
  const colors = [
    'bg-red-500',      // 0-20: Very Weak
    'bg-orange-500',   // 21-40: Weak  
    'bg-yellow-500',   // 41-60: Fair
    'bg-green-500',    // 61-80: Good
    'bg-emerald-600'   // 81-100: Strong
  ];

  const strengthIndex = Math.floor(strength / 20);
  const colorClass = colors[Math.min(strengthIndex, colors.length - 1)];

  const getStrengthText = (score: number): string => {
    if (score <= 20) return 'Very Weak';
    if (score <= 40) return 'Weak';
    if (score <= 60) return 'Fair';
    if (score <= 80) return 'Good';
    return 'Strong';
  };

  if (!value) return null;

  return (
    <div className="mt-2">
      <Progress percentage={strength} className={colorClass} />
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
        Password strength: {getStrengthText(strength)}
      </p>
    </div>
  );
};
