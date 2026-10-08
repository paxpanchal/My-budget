import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'glow-blue' | 'glow-emerald' | 'glow-rose' | 'glow-indigo';
  onClick?: () => void;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  interactive = false,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return 'bg-slate-900/40 border-white/5 dark:bg-slate-900/40 dark:border-white/5';
      case 'glow-blue':
        return 'bg-blue-950/20 border-blue-500/20 dark:bg-blue-950/30 dark:border-blue-500/30';
      case 'glow-emerald':
        return 'bg-emerald-950/20 border-emerald-500/20 dark:bg-emerald-950/30 dark:border-emerald-500/30';
      case 'glow-rose':
        return 'bg-rose-950/20 border-rose-500/20 dark:bg-rose-950/30 dark:border-rose-500/30';
      case 'glow-indigo':
        return 'bg-indigo-950/20 border-indigo-500/20 dark:bg-indigo-950/30 dark:border-indigo-500/30';
      default:
        return 'bg-slate-900/60 border-white/10 dark:bg-slate-900/70 dark:border-white/10';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative backdrop-blur-md rounded-2xl md:rounded-3xl border
        p-4 sm:p-5 transition-colors
        ${interactive ? 'cursor-pointer hover:border-blue-400/40 active:scale-[0.99]' : ''}
        ${getVariantStyles()}
        ${className}
      `}
      {...props}
    >
      {/* Apple-style subtle specular rim */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" 
        aria-hidden="true" 
      />
      {children}
    </div>
  );
};

