import React from 'react';
import { Slider } from '../ui/slider';

interface TailoringStrengthProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const strengthDescriptions = {
  1: {
    name: 'Minimal',
    description: 'Only fix obvious errors and typos'
  },
  2: {
    name: 'Light',
    description: 'Minor improvements to clarity and keywords'
  },
  3: {
    name: 'Moderate',
    description: 'Balanced optimization with relevant keywords'
  },
  4: {
    name: 'Strong',
    description: 'Significant rewrites to match job requirements'
  },
  5: {
    name: 'Aggressive',
    description: 'Complete transformation for maximum impact'
  }
};

const TailoringStrength: React.FC<TailoringStrengthProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const currentStrength = strengthDescriptions[value as keyof typeof strengthDescriptions];

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm text-gray-800 dark:text-gray-200">
          Tailoring Strength
        </label>
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {currentStrength.name}
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={1}
        max={5}
        step={1}
        disabled={disabled}
        className="mb-1"
      />
      
      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
        <span>{strengthDescriptions[1].name}</span>
        <span>{strengthDescriptions[5].name}</span>
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-300">
        {currentStrength.description}
      </p>
    </div>
  );
};

export default TailoringStrength;