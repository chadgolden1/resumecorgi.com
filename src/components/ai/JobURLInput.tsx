import React, { useState } from 'react';
import Button from '../Button';

interface JobURLInputProps {
  onJobSubmit: (data: { url?: string; description?: string }) => void;
  disabled?: boolean;
}

const JobURLInput: React.FC<JobURLInputProps> = ({ onJobSubmit, disabled = false }) => {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    setError('');

    if (inputMode === 'url') {
      if (!jobUrl.trim()) {
        setError('Please enter a job posting URL');
        return;
      }
      if (!validateUrl(jobUrl)) {
        setError('Please enter a valid URL');
        return;
      }
      onJobSubmit({ url: jobUrl });
    } else {
      if (!jobDescription.trim()) {
        setError('Please enter a job description');
        return;
      }
      if (jobDescription.trim().length < 50) {
        setError('Job description seems too short. Please provide more details.');
        return;
      }
      onJobSubmit({ description: jobDescription });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Job Information
        </label>
        
        {/* Input mode toggle */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              inputMode === 'url'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            🔗 Job URL
          </button>
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              inputMode === 'text'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            📝 Paste Description
          </button>
        </div>
      </div>

      {/* Input fields */}
      {inputMode === 'url' ? (
        <div className="space-y-2">
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => {
              setJobUrl(e.target.value);
              setError('');
            }}
            placeholder="https://company.com/job-posting"
            disabled={disabled}
            className="w-full p-2 text-sm text-black dark:text-white 
                       bg-gray-50 dark:bg-zinc-800
                       border-1 border-gray-200 dark:border-zinc-700 rounded-lg
                       hover:border-purple-200 dark:hover:border-purple-700
                       hover:bg-purple-100 dark:hover:bg-purple-900/50
                       focus:outline-purple-600/75 focus:outline-3 focus:border-purple-600/75 focus:ring-purple-600/75 dark:focus:border-purple-600/75 dark:focus:border-transparent
                       focus:bg-purple-100 dark:focus:bg-purple-950/75"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste the URL of the job posting you want to tailor your resume for
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setError('');
            }}
            placeholder="Paste the full job description here..."
            className="w-full p-2 text-sm text-black dark:text-white 
                       bg-gray-50 dark:bg-zinc-800
                       border-1 border-gray-200 dark:border-zinc-700 rounded-lg
                       hover:border-purple-200 dark:hover:border-purple-700
                       hover:bg-purple-100 dark:hover:bg-purple-900/50
                       focus:outline-purple-600/75 focus:outline-3 focus:border-purple-600/75 focus:ring-purple-600/75 dark:focus:border-purple-600/75 dark:focus:border-transparent
                       focus:bg-purple-100 dark:focus:bg-purple-950/75
                       min-h-32 resize-y"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Copy and paste the complete job description, including requirements and responsibilities
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        text="Analyze Job & Tailor Resume"
        disabled={disabled || (!jobUrl.trim() && !jobDescription.trim())}
        className="w-full"
      />

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• AI will analyze the job requirements and optimize your resume</p>
        <p>• Common job sites: LinkedIn, Indeed, company career pages</p>
        <p>• For best results, use the complete job posting</p>
      </div>
    </div>
  );
};

export default JobURLInput;