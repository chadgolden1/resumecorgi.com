import React from 'react';

interface AiButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const AiButton: React.FC<AiButtonProps> = ({ 
  onClick, 
  children = "Let's Start Building",
  className = ''
}) => {
  return (
    <div className={`relative inline-block p-[3px] rounded-3xl ai-gradient-border ${className}`}>
      <button 
        onClick={onClick}
        className="px-4.5 py-2 w-full text-center bg-zinc-100 dark:bg-zinc-950 rounded-[22px] text-gray-800 dark:text-gray-200 
                   font-medium cursor-pointer transition-all duration-200 shadow-md
                   flex items-center justify-center gap-2 hover:bg-indigo-100 hover:dark:bg-indigo-950">
        <span>✨</span>
        {children}
      </button>
    </div>
  );
};

export default AiButton;