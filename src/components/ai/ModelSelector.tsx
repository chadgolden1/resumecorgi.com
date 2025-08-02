import React from 'react';
import { AnthropicModel } from '../../types/ai';
import { ANTHROPIC_MODELS } from '../../lib/ai/models';

interface ModelSelectorProps {
  value: AnthropicModel;
  onChange: (model: AnthropicModel) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="mb-5">
      <label className="block text-sm text-gray-800 dark:text-gray-200 mb-1">
        Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AnthropicModel)}
        disabled={disabled}
        className="w-full p-2 text-sm text-black dark:text-white 
                   bg-gray-50 dark:bg-zinc-800
                   border-1 border-gray-200 dark:border-zinc-700 rounded-lg
                   hover:border-purple-200 dark:hover:border-purple-700
                   hover:bg-purple-100 dark:hover:bg-purple-900/50
                   focus:outline-purple-600/75 focus:outline-3 focus:border-purple-600/75 focus:ring-purple-600/75 dark:focus:border-purple-600/75 dark:focus:border-transparent
                   focus:bg-purple-100 dark:focus:bg-purple-950/75
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {ANTHROPIC_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} {model.isNew && '(NEW)'} - {model.description}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
        Choose the model that best fits your needs
      </p>
    </div>
  );
};

export default ModelSelector;