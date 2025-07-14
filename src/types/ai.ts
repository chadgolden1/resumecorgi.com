import { FormData } from './index';

export interface AIConfig {
  apiKey: string;
  provider: 'anthropic' | 'openai';
  model?: string;
}

export interface TailorRequest {
  jobUrl?: string;
  jobDescription?: string;
  resumeData: FormData;
  targetSections?: string[];
}

export interface TailorResponse {
  success: boolean;
  tailoredResume: FormData;
  changes: ChangeRecord[];
  suggestions: string[];
  error?: string;
}

export interface ChangeRecord {
  section: string;
  field: string;
  itemIndex?: number;
  before: string;
  after: string;
  reason: string;
}

export interface JobInfo {
  title: string;
  company: string;
  location?: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  description: string;
}

export interface AIProcessingStatus {
  stage: 'idle' | 'fetching-job' | 'analyzing' | 'tailoring' | 'complete' | 'error';
  message: string;
  progress?: number;
}