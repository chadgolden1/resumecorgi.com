import { SecureStorage } from './SecureStorage';

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
        content: `Please analyze this job posting and extract the following information in JSON format, see the destination TypeScript type representation below:
        export interface JobInfo {
          title: string;
          company: string;
          location?: string;
          requirements: string[];
          responsibilities: string[];
          skills: string[];
          description: string;
        }

        Any specific keywords or phrases that should be incorporated

        Job Posting:
        ${jobDescription}

        Return ONLY valid JSON without any markdown formatting. Respond with nothing else other than valid JSON.`
      }
    ];

    return this.sendMessage(messages, systemPrompt);
  }

  /**
   * Tailors a resume based on job requirements
   */
  static async tailorResume(
    resumeData: any,
    jobAnalysis: any,
    targetSections: string[] = ['experience', 'skills']
  ): Promise<string> {
    const systemPrompt = `You are a professional resume optimization assistant. Your task is to tailor resume content to match job requirements while maintaining honesty and professionalism. Never fabricate experiences or skills.`;
    
    const messages: AnthropicMessage[] = [
      {
        role: 'user',
        content: `Please tailor this resume to better match the job requirements. Focus on:
        1. Rewording experience descriptions to highlight relevant skills and achievements
        2. Reordering or emphasizing relevant skills
        3. Using keywords from the job posting naturally
        4. Maintaining truthfulness - only rephrase existing experiences

        Current Resume (JSON):
        ${JSON.stringify(resumeData, null, 2)}

        Job Analysis:
        ${JSON.stringify(jobAnalysis, null, 2)}

        Target Sections to Optimize: ${targetSections.join(', ')}

        Return the optimized resume in the same JSON format with a "changes" array documenting what was modified and why. The response should be valid JSON only, no markdown.`
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

        Extract the following information in JSON format:
        - Job title
        - Company name
        - Location
        - Key requirements (as an array)
        - Main responsibilities (as an array)
        - Required skills (as an array)
        - Preferred skills (as an array)
        - Important keywords or phrases

        If you cannot access the URL, please let me know and I'll provide the job description directly.
        
        Return only valid JSON without any markdown formatting.`
      }
    ];

    return this.sendMessage(messages, systemPrompt);
  }
}