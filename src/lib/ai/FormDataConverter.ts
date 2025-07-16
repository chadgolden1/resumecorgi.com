import { FormData } from '../../types';
import { AIFormData, AIExperience, AIEducation, AIProject, AISkill } from '../../types/ai-data';

export class FormDataConverter {
  /**
   * Converts FormData (with HTML) to AIFormData (with arrays)
   */
  static toAIFormat(formData: FormData): AIFormData {
    return {
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
      projects: formData.projects.map(proj => ({
        ...proj,
        highlights: this.htmlToArray(proj.highlights)
      }))
    };
  }

  /**
   * Converts AIFormData (with arrays) back to FormData (with HTML)
   */
  static fromAIFormat(aiData: AIFormData, originalFormData: FormData): FormData {
    return {
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
      })),
      projects: aiData.projects.map(proj => ({
        ...proj,
        highlights: this.arrayToHtml(proj.highlights)
      }))
    };
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