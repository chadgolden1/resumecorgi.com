import { FormData, GenericSection, Section } from "@/types";
import { Utils } from "./Utils";

export abstract class TemplateAdapter {
  protected utils: Utils;
  protected formData: FormData;
  protected selectedSections: Section[];

  constructor(formData: FormData, selectedSections: Section[]) {
    this.utils = new Utils();
    this.formData = formData;
    this.selectedSections = [...selectedSections].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public generateLaTeX(): string {
    const preamble = this.generatePreamble();
    const header = this.generateHeader();
    const sections = this.generateSections();
    const footer = this.generateFooter();

    return `${preamble}
${header}
${sections}
${footer}`;
  }

  protected generateSections(): string {
    return this.selectedSections
      .filter(section => section.selected)
      .map((section, index) => {
        const sectionContent = this.formatSection(section.id);
        
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
  }

  protected formatSection(sectionId: string): string {
    switch (sectionId) {
      case 'summary':
        return this.formatSummary();
      case 'experience':
        return this.formatExperience();
      case 'education':
        return this.formatEducation();
      case 'skills':
        return this.formatSkills();
      case 'projects':
        return this.formatProjects();
      default:
        // Check if it's a generic section
        if (this.formData.genericSections && this.formData.genericSections[sectionId]) {
          return this.formatGenericSection(this.formData.genericSections[sectionId]);
        }
        return '';
    }
  }

  protected abstract generatePreamble(): string;
  protected abstract generateHeader(): string;
  protected abstract generateFooter(): string;

  protected abstract formatSummary(): string;
  protected abstract formatExperience(): string;
  protected abstract formatEducation(): string;
  protected abstract formatSkills(): string;
  protected abstract formatProjects(): string;
  protected abstract formatGenericSection(section: GenericSection): string;
}