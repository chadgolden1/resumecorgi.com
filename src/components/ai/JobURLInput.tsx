import React, { useState } from 'react';
import AiButton from '../AiButton';

interface JobInputProps {
  onJobSubmit: (data: { url?: string; description?: string }) => void;
  disabled?: boolean;
  modelSelector?: React.ReactNode;
}

const JobURLInput: React.FC<JobInputProps> = ({ onJobSubmit, disabled = false }) => {
  const [inputMode] = useState<'url' | 'text'>('text');
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
    <div>
        <p className="block text-sm text-gray-800 dark:text-gray-200 mb-1">
          Job Information
        </p>
        
        {/* Input mode toggle */}
        {/* <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              inputMode === 'url'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Job URL
          </button>
          <Button
              theme={'default'}
              text="Paste Description"
              onClick={() => setInputMode('text')} />
        </div> */}

      {/* Input fields */}
      {inputMode === 'url' ? (
        <div>
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
        <div>
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
            rows={12}
          />
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-5 -mt-0.5 ml-1">
            Copy and paste the complete job description, including requirements and responsibilities
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <AiButton
        onClick={handleSubmit}>
        Analyze Job & Tailor Resume
      </AiButton>

      <div className="text-sm text-gray-700 dark:text-gray-300 mt-5">
        <ul className="list-disc ml-4">
          <li>A Large Language Model (LLM) will analyze the job requirements and optimize your resume</li>
          <li>Common job sites: LinkedIn, Indeed, company career pages</li>
          <li>For best results, use the complete job posting</li>
        </ul>
      </div>
    </div>
  );
};

export default JobURLInput;