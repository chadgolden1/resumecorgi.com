import React from 'react';

interface AiButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const AiButton: React.FC<AiButtonProps> = ({ 
  onClick, 
  children = 'Build with AI Mode',
  className = ''
}) => {
  return (
    <div className={`relative inline-block p-[3px] rounded-3xl ai-gradient-border ${className}`}>
      <button 
        onClick={onClick}
        className="px-4.5 py-2 bg-gray-900 rounded-[22px] text-gray-200 
                   text-s font-medium cursor-pointer transition-all duration-200 
                   flex items-center gap-2 hover:bg-gray-800"
      >
        <span>✨</span>
        {children}
      </button>
    </div>
  );
};

export default AiButton;