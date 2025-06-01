import { GenericSection } from "@/types";
import { TemplateAdapter } from "../TemplateAdapter";

export class EngineeringResume extends TemplateAdapter {
  protected generatePreamble(): string {
    return `\\documentclass[11pt]{article}
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
\\setlist[itemize]{itemsep=-2pt, leftmargin=12pt, topsep=7pt}`;
  }

  protected generateHeader(): string {
    const { name, contacts } = this.formData.personalInfo;
    const escapedName = this.utils.escapeLaTeX(name || 'Your Name');
    const formattedContacts = this.utils.formatContacts(contacts || []);

    return `\\begin{document}

% name
\\centerline{\\Huge ${escapedName}}

\\vspace{5pt}

% contact information
${formattedContacts}

% summary, if provided
${this.formatSummary()}`;
  }

  protected generateFooter(): string {
    return `
\\end{document}`;
  }

  protected formatSummary(): string {
    const summary = this.formData.personalInfo.summary;
    if (!summary || !summary.length) {
      return '';
    }

    return `
\\section*{Summary}
{${this.utils.escapeLaTeX(summary)}}
\\vspace{-3pt}
`;
  }

  protected formatExperience(): string {
    const experience = this.formData.experience;
    if (!experience || !experience.length) {
      return '';
    }

    const sectionHeading = `\\section*{Experience}
`;

    return sectionHeading + experience.map((job, index) => {
      const title = job.title || 'Position Title';
      const company = job.company || 'Company Name';
      const dateRange = `${job.start || 'Start'} -- ${job.end || 'End'}`;
      const accomplishments = this.utils.extractBulletPointItems(job.accomplishments);
      const isLastItem = index === experience.length - 1;

      return `% experience section
\\textbf{${this.utils.escapeLaTeX(title)},} {${this.utils.escapeLaTeX(company)}} \\hfill ${this.utils.escapeLaTeX(dateRange)} \\\\
${this.utils.formatItemize(accomplishments, { vspaceBefore: '-9pt', vspaceAfter: '-3pt' })}
\\vspace{${isLastItem && accomplishments.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  protected formatEducation(): string {
    const education = this.formData.education;
    if (!education || !education.length) {
      return '';
    }

    const sectionHeading = `% education section
\\section*{Education}
`;

    return sectionHeading + education.map((edu, index) => {
      const degree = edu.degree || 'Degree';
      const institution = edu.institution || 'Institution';
      const year = edu.graduationDate || ' ';
      const accomplishments = this.utils.extractBulletPointItems(this.utils.escapeLaTeX(edu.accomplishments));

      const locationText = edu.location && edu.location.length > 0 ? ` -- ${this.utils.escapeLaTeX(edu.location)}` : "";
      const mainLine = `\\textbf{${this.utils.escapeLaTeX(degree)},} ${this.utils.escapeLaTeX(institution)}${locationText} \\hfill ${this.utils.escapeLaTeX(year)} \\\\`;
      const gpaLine = edu.gpa && edu.gpa.length > 0 ? `\\textbf{GPA:} ${this.utils.escapeLaTeX(edu.gpa)} \\\\` : "";
      const isLastItem = index === education.length - 1;

      return `${mainLine}
${gpaLine}
${this.utils.formatItemize(accomplishments, { vspaceBefore: '-9pt', vspaceAfter: '-3pt' })}
\\vspace{${isLastItem && accomplishments.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  protected formatSkills(): string {
    const skills = this.formData.skills;
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

  protected formatProjects(): string {
    const projects = this.formData.projects;
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
      const highlights = this.utils.extractBulletPointItems(project.highlights);
      const url = project.url || '';
      const isLastItem = index === projects.length - 1;

      const urlLine = url ? `\\href{${url}}{${this.utils.escapeLaTeX(url.replace(/^https?:\/\/(www\.)?/, ''))}} \\\\` : ' \\\\';

      return `% project details
\\textbf{${this.utils.escapeLaTeX(title)}} \\hfill ${urlLine}
\\textit{${this.utils.escapeLaTeX(description)}} \\hfill ${this.utils.escapeLaTeX(dateRange)} \\\\
${this.utils.formatItemize(highlights, { vspaceBefore: '-9pt', vspaceAfter: '-3pt' })}
\\vspace{${isLastItem && highlights.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  protected formatReferences(): string {
    const references = this.formData.references;
    if (!references || !references.length) {
      return '';
    }

    const sectionHeading = `% references section
\\section*{References}
`;

    return sectionHeading + references.map((ref, index) => {
      const name = ref.name || '';
      const title = ref.title || '';
      const company = ref.company || '';
      const contactPhone = ref.contactPhone || '';
      const contactEmail = ref.contactEmail || '';

      const companyAndTitle = `${company ? company : ''}${company && title ? ' (' : ''}${title ? this.utils.escapeLaTeX(title) : ''}${company && title ? ')' : ''}`;
      const mainLine = `\\textbf{${this.utils.escapeLaTeX(name)}${companyAndTitle ? ',' : ''}} ${this.utils.escapeLaTeX(companyAndTitle)} \\\\`;
      const contactLine = `${contactPhone ? `${this.utils.escapeLaTeX(contactPhone)}` : ''}${contactPhone && contactEmail ? ', ' : ''}${contactEmail ? `${this.utils.escapeLaTeX(contactEmail)}` : ''}`;
      const isLastItem = index === references.length - 1;

      return `${mainLine}
${contactLine}
\\vspace{${isLastItem ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }

  protected formatGenericSection(section: GenericSection): string {
    if (!section || !section.items.length) {
      return '';
    }

    const sectionHeading = `% ${section.title} section
\\section*{${this.utils.escapeLaTeX(section.title)}}
`;

    return sectionHeading + section.items.map((item: { name: string; description?: string; details?: string }, index: number) => {
      const itemName = item.name.length > 0 ? `${this.utils.escapeLaTeX(item.name)}` : `Item \\#${index + 1}`;
      const description = item && item.description && item.description.length > 0 ? `\\textbf{,} ${this.utils.escapeLaTeX(item.description)}` : "";
      const details = this.utils.extractBulletPointItems(item.details);
      const nameLine = `\\textbf{${itemName}}${this.utils.escapeLaTeX(description)}\n${details ? `\\begin{itemize}\n${details}\n\\end{itemize}` : '\\vspace{6pt}'} \\\\`;
      const isLastItem = index === section.items.length - 1;

      return `${nameLine}
\\vspace{2pt}
${this.utils.formatItemize(details, { vspaceBefore: '-12pt', vspaceAfter: '-3pt' })}
\\vspace{${isLastItem && details.length > 0 ? '-9pt' : '-3pt'}}`;
    }).join('\n\n');
  }
}