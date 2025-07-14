import React, { useState } from 'react';
import Input from '../Input';
import Textbox from '../Textbox';
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
        <label className="block text-sm font-medium text-gray-700">
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
          <Input
            type="url"
            value={jobUrl}
            onChange={(e) => {
              setJobUrl(e.target.value);
              setError('');
            }}
            placeholder="https://company.com/job-posting"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500">
            Paste the URL of the job posting you want to tailor your resume for
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Textbox
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setError('');
            }}
            placeholder="Paste the full job description here..."
            className="min-h-32 resize-y"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500">
            Copy and paste the complete job description, including requirements and responsibilities
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        text="Analyze Job & Tailor Resume"
        disabled={disabled || (!jobUrl.trim() && !jobDescription.trim())}
        className="w-full"
      />

      <div className="text-xs text-gray-500 space-y-1">
        <p>• AI will analyze the job requirements and optimize your resume</p>
        <p>• Common job sites: LinkedIn, Indeed, company career pages</p>
        <p>• For best results, use the complete job posting</p>
      </div>
    </div>
  );
};

export default JobURLInput;