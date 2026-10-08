import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-4 pb-28 sm:pb-8 px-4 text-center select-none ${className}`}>
      <p className="text-[11px] text-slate-500 font-normal tracking-wide">
        Made by{' '}
        <a
          href="https://www.linkedin.com/in/paras-panchal12"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
        >
          Paras Panchal
        </a>
      </p>
    </footer>
  );
};

