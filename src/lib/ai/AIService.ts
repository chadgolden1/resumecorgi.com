import { FormData } from '../../types';
import { TailorRequest, TailorResponse, ChangeRecord, JobInfo, AIProcessingStatus } from '../../types/ai';
import { AnthropicClient } from './AnthropicClient';
import { SecureStorage } from './SecureStorage';

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
        const jobAnalysis = await AnthropicClient.fetchAndAnalyzeJob(request.jobUrl);
        jobInfo = JSON.parse(jobAnalysis);
      } else if (request.jobDescription) {
        this.updateStatus('analyzing', 'Analyzing job description...', 10);
        const jobAnalysis = await AnthropicClient.analyzeJobPosting(request.jobDescription);
        jobInfo = JSON.parse(jobAnalysis);
      } else {
        throw new Error('Please provide either a job URL or job description');
      }

      // Step 2: Tailor the resume
      this.updateStatus('tailoring', 'Optimizing your resume...', 50);
      const tailoredResponse = await AnthropicClient.tailorResume(
        request.resumeData,
        jobInfo,
        request.targetSections || ['experience', 'skills', 'projects']
      );

      const result = JSON.parse(tailoredResponse);
      
      // Step 3: Process the response
      this.updateStatus('complete', 'Resume optimization complete!', 100);

      // Extract changes from the response
      const changes: ChangeRecord[] = result.changes || [];
      const tailoredResume: FormData = result.resume || request.resumeData;

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
    const currentSkills = originalResume.skills?.map(s => s.name.toLowerCase()) || [];
    const missingSkills = jobInfo.skills.filter(skill => 
      !currentSkills.some(cs => cs.includes(skill.toLowerCase()))
    );

    if (missingSkills.length > 0) {
      suggestions.push(`Consider adding these skills if you have them: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    // Check keyword density
    const jobKeywords = [...jobInfo.requirements, ...jobInfo.responsibilities]
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
      /\d+/.test(exp.description)
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
    } catch (error) {
      // Clear the invalid key
      SecureStorage.clearAPIKey();
      return false;
    }
  }

  /**
   * Compares two resumes and returns detailed changes
   */
  static compareResumes(original: FormData, tailored: FormData): ChangeRecord[] {
    const changes: ChangeRecord[] = [];

    // Compare experience section
    if (original.experience && tailored.experience) {
      original.experience.forEach((exp, index) => {
        const tailoredExp = tailored.experience[index];
        if (tailoredExp && exp.description !== tailoredExp.description) {
          changes.push({
            section: 'experience',
            field: 'description',
            itemIndex: index,
            before: exp.description,
            after: tailoredExp.description,
            reason: 'Optimized to better match job requirements'
          });
        }
      });
    }

    // Compare skills section
    if (original.skills && tailored.skills) {
      const originalSkillNames = original.skills.map(s => s.name).sort().join(', ');
      const tailoredSkillNames = tailored.skills.map(s => s.name).sort().join(', ');
      
      if (originalSkillNames !== tailoredSkillNames) {
        changes.push({
          section: 'skills',
          field: 'skills',
          before: originalSkillNames,
          after: tailoredSkillNames,
          reason: 'Reordered or updated to highlight relevant skills'
        });
      }
    }

    // Compare projects section
    if (original.projects && tailored.projects) {
      original.projects.forEach((proj, index) => {
        const tailoredProj = tailored.projects[index];
        if (tailoredProj && proj.description !== tailoredProj.description) {
          changes.push({
            section: 'projects',
            field: 'description',
            itemIndex: index,
            before: proj.description,
            after: tailoredProj.description,
            reason: 'Enhanced to emphasize relevant technologies and achievements'
          });
        }
      });
    }

    return changes;
  }
}