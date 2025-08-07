import { FormData } from '../../types';
import { AIFormData } from '../../types/ai-data';

export class FormDataConverter {
  /**
   * Converts FormData (with HTML) to AIFormData (with arrays)
   */
  static toAIFormat(formData: FormData): AIFormData {
    const aiData: AIFormData = {
      personalInfo: formData.personalInfo,
      experience: formData.experience.map(exp => ({
        ...exp,
        accomplishments: this.htmlToArray(exp.accomplishments)
      })),
      education: formData.education.map(edu => ({
        ...edu,
        accomplishments: this.htmlToArray(edu.accomplishments)
      })),
      skills: formData.skills.map(skill => ({
        category: skill.category,
        skills: this.parseSkillList(skill.skillList)
      })),
      projects: []
    };

    // Only include projects if they exist and are not empty
    if (formData.projects && formData.projects.length > 0) {
      const mappedProjects = formData.projects.map(proj => ({
        ...proj,
        highlights: this.htmlToArray(proj.highlights)
      }));
      
      // Only include projects if at least one has meaningful content
      const hasContent = mappedProjects.some(proj => 
        proj.name || proj.description || (proj.highlights && proj.highlights.length > 0)
      );
      
      if (hasContent) {
        aiData.projects = mappedProjects;
      }
    }

    return aiData;
  }

  /**
   * Converts AIFormData (with arrays) back to FormData (with HTML)
   */
  static fromAIFormat(aiData: AIFormData, originalFormData: FormData): FormData {
    const result: FormData = {
      ...originalFormData, // Preserve any fields not handled by AI
      personalInfo: aiData.personalInfo,
      experience: aiData.experience.map(exp => ({
        ...exp,
        accomplishments: this.arrayToHtml(exp.accomplishments)
      })),
      education: aiData.education.map(edu => ({
        ...edu,
        accomplishments: this.arrayToHtml(edu.accomplishments)
      })),
      skills: aiData.skills.map(skill => ({
        category: skill.category,
        skillList: skill.skills.join(', ')
      }))
    };

    // Only update projects if they were included in the AI response
    // If projects weren't sent to AI (empty/hidden), preserve original
    if (aiData.projects && aiData.projects.length > 0) {
      result.projects = aiData.projects.map(proj => ({
        ...proj,
        highlights: this.arrayToHtml(proj.highlights)
      }));
    } else {
      // Preserve original projects if AI didn't process them
      result.projects = originalFormData.projects;
    }

    return result;
  }

  /**
   * Converts HTML list to array of strings
   */
  private static htmlToArray(html: string): string[] {
    if (!html || !html.trim()) return [];
    
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    const items: string[] = [];
    let match;
    
    while ((match = liRegex.exec(html)) !== null) {
      const content = match[1]
        .replace(/<[^>]+>/g, '') // Remove any nested HTML tags
        .trim();
      if (content) {
        items.push(content);
      }
    }
    
    return items;
  }

  /**
   * Converts array of strings to HTML list
   */
  private static arrayToHtml(items: string[]): string {
    if (!items || items.length === 0) return '';
    
    const listItems = items
      .filter(item => item && item.trim().length > 0)
      .map(item => `<li>${item.trim()}</li>`)
      .join('');
    
    return `<ul>${listItems}</ul>`;
  }

  /**
   * Parses comma-separated skill list into array
   */
  private static parseSkillList(skillList: string): string[] {
    if (!skillList || !skillList.trim()) return [];
    
    return skillList
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
}