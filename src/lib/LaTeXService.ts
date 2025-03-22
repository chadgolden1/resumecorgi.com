import { Experience, Education, Skill, FormData, Section, GenericSection, Project } from "../types";

/**
 * Resume LaTeX Generator
 * Converts form data into LaTeX resume format
 */

export interface TemplateConfig {
  preamble: string;
  documentHeader: (name: string, contacts: string) => string;
  sectionFormatters: Record<string, SectionFormatter>;
  documentFooter: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionFormatter = (data: any, options?: any) => string;

class LaTeXUtils {
  /**
   * Generates appropriate href based on contact type
   */
  getHref(contact: string): string {
    if (contact.includes('@')) return `mailto:${contact}`;
    if (contact.includes('linkedin')) return `https://www.${contact.replace(/^(https?:\/\/)?(www\.)?/, '')}`;
    if (contact.includes('http')) return contact;
    return `https://${contact}`;
  }

  /**
   * Extracts bullet points from HTML content
   */
  extractBulletPoints(htmlContent?: string, defaultContent: string = ''): string {
    if (!htmlContent) return defaultContent;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    return Array.from(tempDiv.querySelectorAll('li'))
      .map(li => li.textContent?.trim() || '')
      .filter(item => item && item.length > 0)
      .map(item => `  \\item ${item}`)
      .join('\n');
  }
  
  /**
   * Format LaTeX itemize environment
   */
  formatItemize(items: string, options: {vspaceBefore?: string, vspaceAfter?: string} = {}): string {
    const vspaceBefore = options.vspaceBefore || '-6pt';
    const vspaceAfter = options.vspaceAfter || '-3pt';
    
    return items && items.length > 0
      ? `\\begin{itemize}
\\vspace{${vspaceBefore}}
${items}
\\end{itemize}
\\vspace{${vspaceAfter}}`
      : "";
  }
  
  escapeLaTeX(text: string): string {
    return text
      // Handle LaTeX special characters
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}')
      // Handle brackets
      .replace(/</g, '\\textless{}')
      .replace(/>/g, '\\textgreater{}')
      // Handle non-breaking space and other special spaces
      .replace(/[\u00A0\u1680\u180e\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
      // Handle other special Unicode characters
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...');
  }
}

// Section formatters as a class
class SectionFormatters {
  private utils: LaTeXUtils;
  
  constructor(utils: LaTeXUtils) {
    this.utils = utils;
  }

  /**
   * Formats summary section
   */
  formatSummary(summary?: string): string {
    if (!summary || !summary.length) {
      return '';
    }

    return `
\\section*{Summary}
{${this.utils.escapeLaTeX(summary)}}
\\vspace{-3pt}
`;
  }

  /**
   * Formats experience section
   */
  formatExperience(experience?: Experience[]): string {
    if (!experience || !experience.length) {
      return '';
    }

    const sectionHeading = `\\section*{Experience}
`;

    return sectionHeading + experience.map((job, index) => {
      const title = job.title || 'Position Title';
      const company = job.company || 'Company Name';
      const dateRange = `${job.start || 'Start'} -- ${job.end || 'End'}`;
      const accomplishments = this.utils.extractBulletPoints(this.utils.escapeLaTeX(job.accomplishments));
      const isLastItem = index === experience.length - 1;

      return `% experience section
\\textbf{${this.utils.escapeLaTeX(title)},} {${this.utils.escapeLaTeX(company)}} \\hfill ${this.utils.escapeLaTeX(dateRange)} \\\\
${this.utils.formatItemize(accomplishments, {vspaceBefore: '-9pt', vspaceAfter: '-3pt'})}
\\vspace{${isLastItem && accomplishments.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  /**
   * Formats education section
   */
  formatEducation(education?: Education[]): string {
    if (!education || !education.length) {
      return '';
    }
    
    const sectionHeading = `% education section
\\section*{Education}
`;

    return sectionHeading + education.map((edu, index) => {
      const degree = edu.degree || 'Degree';
      const institution = edu.institution || 'Institution';
      const year = edu.graduationDate || '';
      const accomplishments = this.utils.extractBulletPoints(this.utils.escapeLaTeX(edu.accomplishments));

      const locationText = edu.location && edu.location.length > 0 ? ` -- ${this.utils.escapeLaTeX(edu.location)}` : "";
      const mainLine = `\\textbf{${this.utils.escapeLaTeX(degree)},} ${this.utils.escapeLaTeX(institution)}${locationText} \\hfill ${this.utils.escapeLaTeX(year)} \\\\`;
      const gpaLine = edu.gpa && edu.gpa.length > 0 ? `\\textbf{GPA:} ${this.utils.escapeLaTeX(edu.gpa)} \\\\` : "";
      const isLastItem = index === education.length - 1;

      return `${mainLine}
${gpaLine}
${this.utils.formatItemize(accomplishments, {vspaceBefore: '-9pt', vspaceAfter: '-3pt'})}
\\vspace{${isLastItem && accomplishments.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  /**
   * Formats skills section
   */
  formatSkills(skills?: Skill[]): string {
    if (!skills || !skills.length) {
      return '';
    }

    const sectionHeading = `% skills section
\\section*{Skills}
`;
      
    return sectionHeading + skills.map((skill, index) => {
      const category = skill.category || "Category";
      const skillsList = skill.skillList || "";
      const isLastItem = index === skills.length - 1;

      return `\\textbf{${this.utils.escapeLaTeX(category)}:} ${this.utils.escapeLaTeX(skillsList)}
\\vspace{${isLastItem ? '-3pt' : '0pt'}}`;
    }).join('\n\n');
  }
  
  /**
   * Formats projects section (example of adding a new section)
   */
  formatProjects(projects?: Project[]): string {
    if (!projects || !projects.length) {
      return '';
    }

    const sectionHeading = `% projects section
\\section*{Projects}
`;

    return sectionHeading + projects.map((project, index) => {
      const title = project.name || 'Project Title';
      const description = project.description || '';
      const startDate = project.startDate || '';
      const endDate = project.endDate || '';
      const dateRange = startDate && endDate ? `${startDate} -- ${endDate}` : startDate || endDate || '';
      const highlights = this.utils.extractBulletPoints(project.highlights);
      const url = project.url || '';
      const isLastItem = index === projects.length - 1;
      
      const urlLine = url ? `\\href{${this.utils.getHref(url)}}{${url}} \\\\` : '';

      return `% project details
\\textbf{${title}} \\hfill ${urlLine}
\\textit{${description}} \\hfill ${dateRange} \\\\
${this.utils.formatItemize(highlights, {vspaceBefore: '-9pt', vspaceAfter: '-3pt'})}
\\vspace{${isLastItem && highlights.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  /**
   * Formats a generic section
   */
  formatGenericSection(section: GenericSection): string {
    if (!section || !section.items.length) {
      return '';
    }

    const sectionHeading = `% ${section.title} section
\\section*{${this.utils.escapeLaTeX(section.title)}}
`;

    return sectionHeading + section.items.map((item: { name: string; description?: string; details?: string }, index: number) => {
      const itemName = item.name.length > 0 ? `${this.utils.escapeLaTeX(item.name)}` : `Item \\#${index + 1}`;
      const description = item && item.description && item.description.length > 0 ? `\\textbf{,} ${this.utils.escapeLaTeX(item.description)}` : ""
      const nameLine = `\\textbf{${itemName}}${description} \\\\`;
      const details = this.utils.extractBulletPoints(item.details);
      const isLastItem = index === section.items.length - 1;
      return `${nameLine}
\\vspace{2pt}
${this.utils.formatItemize(details, {vspaceBefore: '-12pt', vspaceAfter: '-3pt'})}
\\vspace{${isLastItem && details.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }
}

// Template registry
class TemplateRegistry {
  private templates: Record<string, TemplateConfig> = {};
  
  register(name: string, template: TemplateConfig): void {
    this.templates[name] = template;
  }
  
  get(name: string): TemplateConfig {
    if (!this.templates[name]) {
      throw new Error(`Template "${name}" not found`);
    }
    return this.templates[name];
  }
  
  getAvailableTemplates(): string[] {
    return Object.keys(this.templates);
  }
}

// Define standard template
const standardTemplate: TemplateConfig = {
  preamble: `\\documentclass[11pt]{article}
\\usepackage[letterpaper, top=0.5in, bottom=0.5in, left=0.5in, right=0.5in]{geometry}
\\usepackage{XCharter}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\raggedright
\\pagestyle{empty}

\\input{glyphtounicode}
\\pdfgentounicode=1

\\titleformat{\\section}{\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule\\vspace{-6.5pt}]
\\titlespacing{\\section}{0pt}{10pt}{12pt}
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\setlist[itemize]{itemsep=-2pt, leftmargin=12pt, topsep=7pt}`,
  
  documentHeader: (name: string, contacts: string) => `
\\begin{document}

% name
\\centerline{\\Huge ${name}}

\\vspace{5pt}

% contact information
${contacts}
`,
  
  sectionFormatters: {},  // Will be populated with formatters
  
  documentFooter: `
\\end{document}`
};

// Main Generator class
class LaTeXResumeGenerator {
  private utils: LaTeXUtils;
  private formatters: SectionFormatters;
  private templateRegistry: TemplateRegistry;
  
  constructor() {
    this.utils = new LaTeXUtils();
    this.formatters = new SectionFormatters(this.utils);
    this.templateRegistry = new TemplateRegistry();
    
    // Register default template
    const defaultTemplate = {...standardTemplate};
    defaultTemplate.sectionFormatters = {
      summary: this.formatters.formatSummary.bind(this.formatters),
      experience: this.formatters.formatExperience.bind(this.formatters),
      education: this.formatters.formatEducation.bind(this.formatters),
      skills: this.formatters.formatSkills.bind(this.formatters),
      projects: this.formatters.formatProjects.bind(this.formatters)
    };
    
    this.templateRegistry.register('standard', defaultTemplate);
  }
  
  /**
   * Generates LaTeX from form data
   */
  generateLaTeX(formData: FormData, selectedSections: Section[], templateName = 'standard'): string {
    const template = this.templateRegistry.get(templateName);
    const sortedSections = [...selectedSections].sort((a, b) => a.sortOrder - b.sortOrder);
    
    // Register formatters for generic sections
    if (formData.genericSections) {
      Object.keys(formData.genericSections).forEach(sectionId => {
        template.sectionFormatters[sectionId] = (data: GenericSection) => 
          this.formatters.formatGenericSection(data);
      });
    }

    const name = formData.personalInfo.name || 'Your Name';
    
    const formatContacts = (contacts: string[]) => {
      if (!contacts.length) return '';
      
      const items = contacts.map(c => `\\href{${this.utils.getHref(this.utils.escapeLaTeX(c))}}{${this.utils.escapeLaTeX(c)}}`);
      const MAX_ITEMS_PER_LINE = 3;
      let result = [];
      
      for (let i = 0; i < items.length; i += MAX_ITEMS_PER_LINE) {
        const chunk = items.slice(i, i + MAX_ITEMS_PER_LINE);
        result.push(chunk.join(' | '));
      }
      
      return `
        \\vspace{-0.5cm}
        \\begin{center}
          ${result.join(' \\\\\n      ')}
        \\end{center}\\vspace{-0.5cm}
      `;
    };

    const contacts = [
      formData.personalInfo.contact0,
      formData.personalInfo.contact1,
      formData.personalInfo.contact2,
      formData.personalInfo.contact3,
      formData.personalInfo.contact4
    ].filter(Boolean);

    const contactLine = formatContacts(contacts);
    
    // Start building document
    let output = template.preamble;
    output += template.documentHeader(name, contactLine);
    
    // Add summary if included
    if (formData.personalInfo.summary) {
      output += this.formatters.formatSummary(formData.personalInfo.summary);
    }
    
    // Add selected sections
    output += sortedSections
      .filter(section => section.selected && template.sectionFormatters[section.id])
      .map((section, index) => {
        const formatter = template.sectionFormatters[section.id];

        let sectionContent: string = ""

        if (section.id.includes("genericSection") && formData.genericSections) {
          sectionContent = formatter(formData.genericSections[section.id as keyof FormData]);
        }
        else {
          sectionContent = formatter(formData[section.id as keyof FormData]);
        }
        
        // If not the first section and not empty, ensure consistent spacing
        if (index > 0 && sectionContent.trim().length > 0) {
          // Ensure section starts with proper spacing
          if (!sectionContent.startsWith('\n\n')) {
            return `\n\n${sectionContent}`;
          }
        }
        return sectionContent;
      })
      .join('\n');
    
    output += template.documentFooter;
    
    return output;
  }
  
  /**
   * Register a new template
   */
  registerTemplate(name: string, template: TemplateConfig): void {
    this.templateRegistry.register(name, template);
  }
  
  /**
   * Get available template names
   */
  getAvailableTemplates(): string[] {
    return this.templateRegistry.getAvailableTemplates();
  }
  
  /**
   * Get utils for external use
   */
  getUtils(): LaTeXUtils {
    return this.utils;
  }
  
  /**
   * Add a new section formatter to a template
   */
  addSectionFormatter(templateName: string, sectionId: string, formatter: SectionFormatter): void {
    const template = this.templateRegistry.get(templateName);
    template.sectionFormatters[sectionId] = formatter;
  }
}

// Export the generator
export const latexGenerator = new LaTeXResumeGenerator();

export { LaTeXUtils, SectionFormatters };