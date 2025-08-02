import React, { useState, useEffect } from 'react';
import { SecureStorage } from '../../lib/ai/SecureStorage';
import { AIService } from '../../lib/ai/AIService';
import Button from '../Button';

interface APIKeyManagerProps {
  onKeyConfigured: () => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onKeyConfigured }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setHasKey(SecureStorage.hasAPIKey());
  }, []);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!SecureStorage.validateAPIKey(apiKey, 'anthropic')) {
      setError('Invalid API key format. Anthropic keys should start with "sk-ant-"');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const isValid = await AIService.validateAPIKey(apiKey);
      if (isValid) {
        setHasKey(true);
        setApiKey('');
        onKeyConfigured();
      } else {
        setError('Invalid API key. Please check your key and try again.');
      }
    } catch (err) {
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = () => {
    SecureStorage.clearAPIKey();
    setHasKey(false);
    setApiKey('');
    setError('');
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setError('');
  };

  if (hasKey) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">API key configured</span>
          </div>
          <Button 
            onClick={handleClearKey}
            text="Clear"
            className="text-xs px-3 py-1 bg-transparent text-red-600 hover:bg-red-50"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Anthropic API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleKeyChange}
            placeholder="sk-ant-..."
            className="w-full p-2 pr-10 text-sm text-black dark:text-white 
                       bg-gray-50 dark:bg-zinc-800
                       border-1 border-gray-200 dark:border-zinc-700 rounded-lg
                       hover:border-purple-200 dark:hover:border-purple-700
                       hover:bg-purple-100 dark:hover:bg-purple-900/50
                       focus:outline-purple-600/75 focus:outline-3 focus:border-purple-600/75 focus:ring-purple-600/75 dark:focus:border-purple-600/75 dark:focus:border-transparent
                       focus:bg-purple-100 dark:focus:bg-purple-950/75"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your API key is encrypted and stored locally. It never leaves your browser.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        onClick={handleSaveKey}
        text={isValidating ? 'Validating...' : 'Save API Key'}
        disabled={isValidating || !apiKey.trim()}
        className="w-full"
      />

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></p>
        <p>• Keys are encrypted using AES-256-GCM</p>
        <p>• All Smart Match processing happens in your browser</p>
      </div>
    </div>
  );
};

export default APIKeyManager;