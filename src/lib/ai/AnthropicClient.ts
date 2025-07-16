import { SecureStorage } from './SecureStorage';
import { FormData } from '../../types';

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
  private static readonly MODEL = 'claude-3-5-sonnet-latest'; // claude-opus-4-20250514, claude-3-7-sonnet-20250219, claude-3-5-sonnet-latest 
  private static readonly MAX_TOKENS = 4096 * 2;

  /**
   * Sends a message to Claude API
   */
  static async sendMessage(
    messages: AnthropicMessage[],
    systemPrompt?: string,
    useWebSearch?: boolean
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
          model: this.MODEL,
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
  static async analyzeJobPosting(jobDescription: string): Promise<string> {
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

    return this.sendMessage(messages, systemPrompt);
  }

  /**
   * Tailors a resume based on job requirements
   */
  static async tailorResume(
    resumeData: FormData,
    jobAnalysis: any,
    targetSections: string[] = ['experience', 'skills']
  ): Promise<string> {
    const systemPrompt = `You are a professional resume optimization assistant. Your task is to tailor resume content to match job requirements while maintaining honesty and professionalism. Never fabricate experiences or skills.`;
    
    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: `Please aggressively tailor this resume to maximize match with the job requirements. You should:

        1. REWRITE every experience bullet point to:
           - Start with strong action verbs
           - Include relevant keywords from the job posting
           - Quantify achievements where possible
           - Emphasize skills/technologies mentioned in the job
           - Focus on outcomes and impact
           - IMPORTANT: Accomplishments are in HTML list format (<ul><li>...</li></ul>), maintain this format
        
        2. For skills section:
           - Reorder to put most relevant skills first
           - Add any missing skills that are implied by the experience
           - Group related skills effectively
           - Remove or de-emphasize irrelevant skills
           - Skills are in the "skillList" field as comma-separated values
        
        3. For projects (if present):
           - Highlight technologies that match job requirements
           - Emphasize relevant outcomes
           - Use industry-specific terminology from the job posting
           - Project highlights are in HTML list format
        
        4. Make SUBSTANTIAL changes for items that need improvement - those sections should be noticeably improved
        5. Maintain truthfulness but be creative with phrasing
        6. CRITICAL: Preserve ALL fields from the original resume structure, even if unchanged
        7. CRITICAL: Maintain HTML list format for accomplishments/highlights fields

        Current Resume (JSON):
        ${JSON.stringify(resumeData, null, 2)}

        Job Analysis:
        ${JSON.stringify(jobAnalysis, null, 2)}

        Target Sections to Optimize: ${targetSections.join(', ')}

        Return a JSON response with ONLY the complete tailored resume in the same FormData format as the input.
        
        Important:
        - Return the COMPLETE resume object with ALL sections and fields
        - Maintain the exact same structure as the input FormData
        - Keep HTML list format for accomplishments and highlights: <ul><li>item 1</li><li>item 2</li></ul>
        - Keep comma-separated format for skillList field
        - Do NOT include a "changes" array - just return the tailored resume
        - The response must be valid JSON only, no markdown formatting`
      }
    ];

    return this.sendMessage(messages, systemPrompt);
  }

  /**
   * Fetches and analyzes a job posting from a URL
   */
  static async fetchAndAnalyzeJob(url: string): Promise<string> {
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

    return this.sendMessage(messages, systemPrompt);
  }
}