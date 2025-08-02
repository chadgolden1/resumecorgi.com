import { FormData } from './index';

export type AnthropicModel = 
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-3-7-sonnet-latest'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-5-haiku-latest';

export interface ModelInfo {
  id: AnthropicModel;
  name: string;
  description: string;
  isNew?: boolean;
}

export interface AIConfig {
  apiKey: string;
  provider: 'anthropic' | 'openai';
  model?: AnthropicModel;
}

export interface TailorRequest {
  jobUrl?: string;
  jobDescription?: string;
  resumeData: FormData;
  targetSections?: string[];
  model?: AnthropicModel;
  tailoringStrength?: number; // 1-5, where 1 is minimal changes and 5 is aggressive rewriting
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