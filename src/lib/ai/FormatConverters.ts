/**
 * Utility functions to convert between different data formats
 * for AI processing and UI display
 */

/**
 * Converts an array of bullet points to HTML list format
 */
export function bulletsToHtml(bullets: string[]): string {
  if (!bullets || bullets.length === 0) {
    return '';
  }
  
  const listItems = bullets
    .filter(bullet => bullet && bullet.trim().length > 0)
    .map(bullet => `<li>${bullet.trim()}</li>`)
    .join('');
  
  return `<ul>${listItems}</ul>`;
}

/**
 * Converts HTML list format to array of bullet points
 */
export function htmlToBullets(html: string): string[] {
  if (!html || !html.trim()) {
    return [];
  }
  
  // Simple regex-based extraction for server-side compatibility
  const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
  const bullets: string[] = [];
  let match;
  
  while ((match = liRegex.exec(html)) !== null) {
    const content = match[1]
      .replace(/<[^>]+>/g, '') // Remove any nested HTML tags
      .trim();
    if (content) {
      bullets.push(content);
    }
  }
  
  return bullets;
}

/**
 * Converts resume data to AI-friendly format (HTML to arrays)
 */
export function resumeToAIFormat(resumeData: any): any {
  const converted = { ...resumeData };
  
  // Convert experience accomplishments
  if (converted.experience) {
    converted.experience = converted.experience.map((exp: any) => ({
      ...exp,
      accomplishments: htmlToBullets(exp.accomplishments)
    }));
  }
  
  // Convert education accomplishments
  if (converted.education) {
    converted.education = converted.education.map((edu: any) => ({
      ...edu,
      accomplishments: htmlToBullets(edu.accomplishments)
    }));
  }
  
  // Convert project highlights
  if (converted.projects) {
    converted.projects = converted.projects.map((proj: any) => ({
      ...proj,
      highlights: htmlToBullets(proj.highlights)
    }));
  }
  
  // Convert generic sections
  if (converted.genericSections) {
    Object.keys(converted.genericSections).forEach(sectionKey => {
      const section = converted.genericSections[sectionKey];
      if (section.items) {
        section.items = section.items.map((item: any) => ({
          ...item,
          details: htmlToBullets(item.details)
        }));
      }
    });
  }
  
  return converted;
}

/**
 * Converts AI response back to resume format (arrays to HTML)
 */
export function aiFormatToResume(aiData: any): any {
  const converted = { ...aiData };
  
  // Convert experience accomplishments
  if (converted.experience) {
    converted.experience = converted.experience.map((exp: any) => ({
      ...exp,
      accomplishments: Array.isArray(exp.accomplishments) 
        ? bulletsToHtml(exp.accomplishments)
        : exp.accomplishments
    }));
  }
  
  // Convert education accomplishments
  if (converted.education) {
    converted.education = converted.education.map((edu: any) => ({
      ...edu,
      accomplishments: Array.isArray(edu.accomplishments)
        ? bulletsToHtml(edu.accomplishments)
        : edu.accomplishments
    }));
  }
  
  // Convert project highlights
  if (converted.projects) {
    converted.projects = converted.projects.map((proj: any) => ({
      ...proj,
      highlights: Array.isArray(proj.highlights)
        ? bulletsToHtml(proj.highlights)
        : proj.highlights
    }));
  }
  
  // Convert generic sections
  if (converted.genericSections) {
    Object.keys(converted.genericSections).forEach(sectionKey => {
      const section = converted.genericSections[sectionKey];
      if (section.items) {
        section.items = section.items.map((item: any) => ({
          ...item,
          details: Array.isArray(item.details)
            ? bulletsToHtml(item.details)
            : item.details
        }));
      }
    });
  }
  
  return converted;
}