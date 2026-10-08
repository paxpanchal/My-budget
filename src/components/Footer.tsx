import React from 'react';
import { Linkedin, Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`py-6 px-4 text-center select-none ${className}`}>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md text-xs text-slate-400 shadow-sm transition hover:bg-white/[0.06] hover:border-white/10">
        <span>Made with</span>
        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline-block" />
        <span>by</span>
        <span className="font-semibold text-slate-200">Paras Panchal</span>
        <span className="text-slate-600" aria-hidden="true">·</span>
        <a
          href="https://www.linkedin.com/in/paras-panchal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          title="Connect with Paras Panchal on LinkedIn"
        >
          <Linkedin className="w-3.5 h-3.5 fill-current" />
          <span>LinkedIn Profile</span>
        </a>
      </div>
    </footer>
  );
};
