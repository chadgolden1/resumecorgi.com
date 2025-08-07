import { SecureStorage } from './SecureStorage';
import { AIFormData } from '../../types/ai-data';
import { AnthropicModel } from '../../types/ai';
import { DEFAULT_MODEL } from './models';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  content: Array<{
    text: string;
    type: 'text';
  }>;
}

export class AnthropicClient {
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';
  private static readonly MAX_TOKENS = 4096 * 2;

  /**
   * Sends a message to Claude API
   */
  static async sendMessage(
    messages: AnthropicMessage[],
    systemPrompt?: string,
    useWebSearch?: boolean,
    model: AnthropicModel = DEFAULT_MODEL
  ): Promise<string> {
    const apiKey = await SecureStorage.getAPIKey('anthropic');
    if (!apiKey) {
      throw new Error('No API key found. Please configure your Anthropic API key.');
    }

    let tools = [];

    if (useWebSearch) {
      tools.push({
        "type": "web_search_20250305",
        "name": "web_search",
        "max_uses": 5
      })
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: this.MAX_TOKENS,
          messages,
          tools: tools,
          ...(systemPrompt && { system: systemPrompt })
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
      }

      const data: AnthropicResponse = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Failed to call Anthropic API:', error);
      throw error;
    }
  }

  /**
   * Analyzes a job posting to extract key information
   */
  static async analyzeJobPosting(jobDescription: string, model: AnthropicModel = DEFAULT_MODEL): Promise<string> {
    const systemPrompt = `You are a professional resume optimization assistant. Extract and analyze job posting information to help tailor resumes.`;
    
    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: `Please analyze this job posting and extract the following information. Return a JSON object with this exact structure:
        {
          "title": "Job Title",
          "company": "Company Name",
          "location": "Location (optional)",
          "requirements": ["requirement 1", "requirement 2", ...],
          "responsibilities": ["responsibility 1", "responsibility 2", ...],
          "skills": ["skill 1", "skill 2", ...],
          "description": "Brief description of the role"
        }

        Job Posting:
        ${jobDescription}

        Important:
        - Extract ALL relevant requirements, responsibilities, and skills
        - Keep array items concise but informative
        - Return ONLY valid JSON without any markdown formatting
        - Use exactly these field names`
      }
    ];

    return this.sendMessage(messages, systemPrompt, false, model);
  }

  /**
   * Tailors a resume based on job requirements
   */
  static async tailorResume(
    resumeData: AIFormData,
    jobAnalysis: unknown,
    targetSections: string[] = ['experience', 'skills'],
    model: AnthropicModel = DEFAULT_MODEL,
    tailoringStrength: number = 4
  ): Promise<string> {
    const systemPrompt = `You are a professional resume optimization assistant. Your task is to tailor resume content to match job requirements while maintaining honesty and professionalism. Never fabricate experiences or skills.`;
    
    const strengthPrompts = {
      1: `Please make minimal changes to this resume, only fixing obvious errors and typos. You should:
        - Fix spelling and grammar errors
        - Correct formatting inconsistencies
        - Only change content if it's clearly incorrect
        - Preserve the original phrasing and style`,
      2: `Please make light improvements to this resume for better clarity. You should:
        - Improve clarity where needed
        - Add relevant keywords naturally where they fit
        - Fix any weak action verbs
        - Make minor adjustments to better match the job`,
      3: `Please moderately optimize this resume to better match the job requirements. You should:
        - Rewrite bullet points that lack impact
        - Include relevant keywords from the job posting
        - Improve action verbs and quantify achievements where reasonable
        - Reorder skills to highlight most relevant ones`,
      4: `Please significantly improve this resume to strongly match the job requirements. You should:
        - Rewrite most bullet points for maximum impact
        - Strategically incorporate job keywords throughout
        - Quantify achievements and emphasize relevant experience
        - Restructure content to highlight job-relevant skills`,
      5: `Please aggressively tailor this resume to maximize match with the job requirements. You should:
        - REWRITE every experience bullet point for maximum impact
        - Heavily incorporate all relevant keywords from the job
        - Transform descriptions to strongly emphasize required skills
        - Make SUBSTANTIAL changes to maximize job relevance`
    };
    
    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: `${strengthPrompts[tailoringStrength as keyof typeof strengthPrompts] || strengthPrompts[4]}

        Key guidelines:
        - CRITICAL: Preserve ALL fields from the original resume structure, even if unchanged
        - CRITICAL: Maintain array format for accomplishments, skills, and highlights fields
        - Accomplishments are provided as an array of strings, maintain this format
        - Skills are provided as an array in the "skills" field
        - If projects are provided: Project highlights are provided as an array of strings
        - If projects array is empty or not included, DO NOT generate or add any projects
        - Focus on the target sections: ${targetSections.join(', ')}
        - Maintain truthfulness while optimizing presentation

        Current Resume (JSON):
        ${JSON.stringify(resumeData, null, 2)}

        Job Analysis:
        ${JSON.stringify(jobAnalysis, null, 2)}

        Target Sections to Optimize: ${targetSections.join(', ')}

        Return a JSON response with ONLY the complete tailored resume in the same AIFormData format as the input.
        
        Important:
        - Return the COMPLETE resume object with ALL sections and fields
        - Maintain the exact same structure as the input AIFormData
        - Keep array format for accomplishments, skills, and highlights
        - If the input has an empty projects array, return an empty projects array
        - Do NOT add projects if none were provided in the input
        - Do NOT include a "changes" array - just return the tailored resume
        - The response must be valid JSON only, no markdown formatting`
      }
    ];

    return this.sendMessage(messages, systemPrompt, false, model);
  }

  /**
   * Fetches and analyzes a job posting from a URL
   */
  static async fetchAndAnalyzeJob(url: string, model: AnthropicModel = DEFAULT_MODEL): Promise<string> {
    const systemPrompt = `You are a professional resume optimization assistant with web browsing capabilities.`;
    
    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: `Please fetch the job posting from this URL and analyze it: ${url}

        Extract and return a JSON object with this exact structure:
        {
          "title": "Job Title",
          "company": "Company Name",
          "location": "Location (optional)",
          "requirements": ["requirement 1", "requirement 2", ...],
          "responsibilities": ["responsibility 1", "responsibility 2", ...],
          "skills": ["skill 1", "skill 2", ...],
          "description": "Brief description of the role"
        }

        If you cannot access the URL, please let me know and I'll provide the job description directly.
        
        Important:
        - Return ONLY valid JSON without any markdown formatting
        - Use exactly these field names
        - Combine required and preferred skills into the "skills" array`
      }
    ];

    return this.sendMessage(messages, systemPrompt, true, model);
  }
}