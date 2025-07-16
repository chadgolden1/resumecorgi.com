import { FormData } from '../../types';
import { ChangeRecord } from '../../types/ai';

export class FormDataDiff {
  /**
   * Compares two FormData objects and generates change records
   */
  static generateDiff(original: FormData, modified: FormData): ChangeRecord[] {
    const changes: ChangeRecord[] = [];

    // Compare experience section
    if (original.experience && modified.experience) {
      changes.push(...this.compareExperience(original.experience, modified.experience));
    }

    // Compare skills section
    if (original.skills && modified.skills) {
      changes.push(...this.compareSkills(original.skills, modified.skills));
    }

    // Compare projects section
    if (original.projects && modified.projects) {
      changes.push(...this.compareProjects(original.projects, modified.projects));
    }

    // Compare education section
    if (original.education && modified.education) {
      changes.push(...this.compareEducation(original.education, modified.education));
    }

    // Compare personal info
    if (original.personalInfo && modified.personalInfo) {
      changes.push(...this.comparePersonalInfo(original.personalInfo, modified.personalInfo));
    }

    return changes;
  }

  private static compareExperience(original: any[], modified: any[]): ChangeRecord[] {
    const changes: ChangeRecord[] = [];
    const maxLength = Math.max(original.length, modified.length);

    for (let i = 0; i < maxLength; i++) {
      const origItem = original[i];
      const modItem = modified[i];

      if (!origItem || !modItem) continue;

      // Compare title
      if (origItem.title !== modItem.title) {
        changes.push({
          section: 'experience',
          field: 'title',
          itemIndex: i,
          before: origItem.title,
          after: modItem.title,
          reason: 'Updated job title for better alignment'
        });
      }

      // Compare accomplishments (HTML format)
      if (origItem.accomplishments !== modItem.accomplishments) {
        changes.push({
          section: 'experience',
          field: 'accomplishments',
          itemIndex: i,
          before: origItem.accomplishments,
          after: modItem.accomplishments,
          reason: 'Optimized accomplishments to highlight relevant skills and impact'
        });
      }

      // Compare other fields as needed
      if (origItem.company !== modItem.company) {
        changes.push({
          section: 'experience',
          field: 'company',
          itemIndex: i,
          before: origItem.company,
          after: modItem.company,
          reason: 'Updated company information'
        });
      }
    }

    return changes;
  }

  private static compareSkills(original: any[], modified: any[]): ChangeRecord[] {
    const changes: ChangeRecord[] = [];

    // Create maps for easier comparison
    const origMap = new Map(original.map(s => [s.category, s.skillList]));
    const modMap = new Map(modified.map(s => [s.category, s.skillList]));

    // Check for changes in existing categories
    for (const [category, origSkills] of origMap) {
      const modSkills = modMap.get(category);
      if (modSkills && origSkills !== modSkills) {
        const index = original.findIndex(s => s.category === category);
        changes.push({
          section: 'skills',
          field: 'skillList',
          itemIndex: index,
          before: origSkills,
          after: modSkills,
          reason: 'Reordered skills to prioritize job-relevant technologies'
        });
      }
    }

    // Check for new categories
    for (const [category, skills] of modMap) {
      if (!origMap.has(category)) {
        changes.push({
          section: 'skills',
          field: 'category',
          before: '',
          after: `${category}: ${skills}`,
          reason: 'Added new skill category to match job requirements'
        });
      }
    }

    return changes;
  }

  private static compareProjects(original: any[], modified: any[]): ChangeRecord[] {
    const changes: ChangeRecord[] = [];
    const maxLength = Math.max(original.length, modified.length);

    for (let i = 0; i < maxLength; i++) {
      const origItem = original[i];
      const modItem = modified[i];

      if (!origItem || !modItem) continue;

      // Compare project name
      if (origItem.name !== modItem.name) {
        changes.push({
          section: 'projects',
          field: 'name',
          itemIndex: i,
          before: origItem.name,
          after: modItem.name,
          reason: 'Updated project name for clarity'
        });
      }

      // Compare description
      if (origItem.description !== modItem.description) {
        changes.push({
          section: 'projects',
          field: 'description',
          itemIndex: i,
          before: origItem.description,
          after: modItem.description,
          reason: 'Enhanced project description to emphasize relevant technologies'
        });
      }

      // Compare highlights (HTML format)
      if (origItem.highlights !== modItem.highlights) {
        changes.push({
          section: 'projects',
          field: 'highlights',
          itemIndex: i,
          before: origItem.highlights,
          after: modItem.highlights,
          reason: 'Updated project highlights to showcase relevant achievements'
        });
      }
    }

    return changes;
  }

  private static compareEducation(original: any[], modified: any[]): ChangeRecord[] {
    const changes: ChangeRecord[] = [];
    const maxLength = Math.max(original.length, modified.length);

    for (let i = 0; i < maxLength; i++) {
      const origItem = original[i];
      const modItem = modified[i];

      if (!origItem || !modItem) continue;

      // Compare accomplishments (HTML format)
      if (origItem.accomplishments !== modItem.accomplishments) {
        changes.push({
          section: 'education',
          field: 'accomplishments',
          itemIndex: i,
          before: origItem.accomplishments,
          after: modItem.accomplishments,
          reason: 'Highlighted relevant coursework and achievements'
        });
      }
    }

    return changes;
  }

  private static comparePersonalInfo(original: any, modified: any): ChangeRecord[] {
    const changes: ChangeRecord[] = [];

    if (original.summary !== modified.summary) {
      changes.push({
        section: 'personalInfo',
        field: 'summary',
        before: original.summary,
        after: modified.summary,
        reason: 'Tailored summary to match job requirements'
      });
    }

    return changes;
  }

  /**
   * Extracts bullet points from HTML list for granular comparison
   */
  static extractBullets(html: string): string[] {
    if (!html || !html.trim()) return [];
    
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    const bullets: string[] = [];
    let match;
    
    while ((match = liRegex.exec(html)) !== null) {
      const content = match[1]
        .replace(/<[^>]+>/g, '')
        .trim();
      if (content) {
        bullets.push(content);
      }
    }
    
    return bullets;
  }

  /**
   * Creates HTML list from bullet points
   */
  static createHtmlList(bullets: string[]): string {
    if (!bullets || bullets.length === 0) return '';
    
    const listItems = bullets
      .filter(bullet => bullet && bullet.trim().length > 0)
      .map(bullet => `<li>${bullet.trim()}</li>`)
      .join('');
    
    return `<ul>${listItems}</ul>`;
  }
}