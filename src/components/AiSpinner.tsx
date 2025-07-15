
import { StarsIcon } from 'lucide-react';
import React from 'react';

interface AiSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AiSpinner: React.FC<AiSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} p-[3px] rounded-full ai-gradient-border ${className}`}>
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-950 rounded-full flex items-center justify-center">
        <span className="animate-pulse">
          <StarsIcon className="h-5" />
        </span>
      </div>
    </div>
  );
};

export default AiSpinner;