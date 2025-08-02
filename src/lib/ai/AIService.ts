import { FormData } from '../../types';
import { TailorRequest, TailorResponse, ChangeRecord, JobInfo, AIProcessingStatus } from '../../types/ai';
import { AIFormData } from '../../types/ai-data';
import { AnthropicClient } from './AnthropicClient';
import { SecureStorage } from './SecureStorage';
import { FormDataDiff } from './FormDataDiff';
import { FormDataConverter } from './FormDataConverter';

export class AIService {
  private static statusCallback?: (status: AIProcessingStatus) => void;

  /**
   * Sets a callback for status updates
   */
  static setStatusCallback(callback: (status: AIProcessingStatus) => void) {
    this.statusCallback = callback;
  }

  /**
   * Updates processing status
   */
  private static updateStatus(stage: AIProcessingStatus['stage'], message: string, progress?: number) {
    if (this.statusCallback) {
      this.statusCallback({ stage, message, progress });
    }
  }

  /**
   * Main method to tailor a resume for a job
   */
  static async tailorResume(request: TailorRequest): Promise<TailorResponse> {
    try {
      // Check for API key
      if (!SecureStorage.hasAPIKey()) {
        throw new Error('Please configure your API key before using AI features');
      }

      let jobInfo: JobInfo;

      // Step 1: Get job information
      if (request.jobUrl) {
        this.updateStatus('fetching-job', 'Fetching job posting...', 10);
        const jobAnalysis = await AnthropicClient.fetchAndAnalyzeJob(request.jobUrl, request.model);
        jobInfo = JSON.parse(jobAnalysis);
      } else if (request.jobDescription) {
        this.updateStatus('analyzing', 'Analyzing job description...', 10);
        const jobAnalysis = await AnthropicClient.analyzeJobPosting(request.jobDescription, request.model);
        jobInfo = JSON.parse(jobAnalysis);
      } else {
        throw new Error('Please provide either a job URL or job description');
      }

      // Step 2: Convert to AI format and tailor the resume
      this.updateStatus('tailoring', 'Optimizing your resume...', 50);
      
      // Convert FormData to AI-friendly format
      const aiFormData: AIFormData = FormDataConverter.toAIFormat(request.resumeData);
      
      const tailoredResponse = await AnthropicClient.tailorResume(
        aiFormData,
        jobInfo,
        request.targetSections || ['experience', 'skills', 'projects'],
        request.model,
        request.tailoringStrength
      );

      const tailoredAIData: AIFormData = JSON.parse(tailoredResponse);
      
      // Convert back to FormData format
      const tailoredResume: FormData = FormDataConverter.fromAIFormat(tailoredAIData, request.resumeData);
      
      // Step 3: Generate changes by comparing original and tailored resumes
      this.updateStatus('complete', 'Resume optimization complete!', 100);

      const changes: ChangeRecord[] = FormDataDiff.generateDiff(request.resumeData, tailoredResume);
      
      // If no changes were detected, ensure we have at least some feedback
      if (changes.length === 0) {
        throw new Error('No changes were made to the resume. The content may already be well-optimized.');
      }

      // Generate suggestions based on the analysis
      const suggestions = this.generateSuggestions(jobInfo, request.resumeData, tailoredResume);

      return {
        success: true,
        tailoredResume,
        changes,
        suggestions
      };

    } catch (error) {
      this.updateStatus('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
      return {
        success: false,
        tailoredResume: request.resumeData,
        changes: [],
        suggestions: [],
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  /**
   * Generates suggestions based on job analysis
   */
  private static generateSuggestions(jobInfo: JobInfo, originalResume: FormData, tailoredResume: FormData): string[] {
    const suggestions: string[] = [];

    // Check for missing skills
    const currentSkills = originalResume.skills?.flatMap(s => 
      s.skillList.split(',').map(skill => skill.trim().toLowerCase())
    ) || [];
    const missingSkills = (jobInfo.skills || []).filter(skill => 
      !currentSkills.some(cs => cs.includes(skill.toLowerCase()))
    );

    if (missingSkills.length > 0) {
      suggestions.push(`Consider adding these skills if you have them: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    // Check keyword density
    const jobKeywords = [...(jobInfo.requirements || []), ...(jobInfo.responsibilities || [])]
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4);

    const resumeText = JSON.stringify(tailoredResume).toLowerCase();
    const missingKeywords = jobKeywords.filter(keyword => !resumeText.includes(keyword));

    if (missingKeywords.length > 0) {
      suggestions.push(`Consider incorporating these keywords naturally: ${missingKeywords.slice(0, 3).join(', ')}`);
    }

    // Experience relevance
    if (originalResume.experience?.length > 0) {
      suggestions.push('Ensure your most relevant experience is listed first');
    }

    // Quantifiable achievements
    const hasNumbers = originalResume.experience?.some(exp => 
      /\d+/.test(exp.accomplishments)
    );
    if (!hasNumbers) {
      suggestions.push('Add quantifiable achievements (percentages, numbers, metrics) to your experience descriptions');
    }

    return suggestions;
  }

  /**
   * Validates an API key by making a test request
   */
  static async validateAPIKey(apiKey: string): Promise<boolean> {
    try {
      // Store temporarily
      await SecureStorage.storeAPIKey(apiKey, 'anthropic');
      
      // Test with a simple request
      const response = await AnthropicClient.sendMessage([
        { role: 'user', content: 'Test' }
      ]);

      return !!response;
    } catch {
      // Clear the invalid key
      SecureStorage.clearAPIKey();
      return false;
    }
  }

}