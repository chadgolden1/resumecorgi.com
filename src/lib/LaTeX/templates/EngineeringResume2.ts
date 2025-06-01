import { GenericSection } from '@/types';
import { TemplateAdapter } from '../TemplateAdapter';

export class EngineeringResume2 extends TemplateAdapter {
  protected generatePreamble(): string {
    return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=1.25 cm, % seperation between body and page edge from the top
    bottom=1.25 cm, % seperation between body and page edge from the bottom
    left=1.25 cm, % seperation between body and page edge from the left
    right=1.25 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 0, 0} % define primary color
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={${this.utils.escapeLaTeX(this.formData.personalInfo.name || "Resume")}},
    pdfauthor={${this.utils.escapeLaTeX(this.formData.personalInfo.name || "Candidate")}},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex
\\usepackage{etoolbox} % for patching commands and environments

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

\\usepackage{charter}

% Some settings:
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0.15cm} % set column seperation
\\pagenumbering{gobble} % no page numbering

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights


\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0 cm + 0.00001 cm
    }{
        0 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 6cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{threecolentry}[3][]{
    \\onecolentry
    \\def\\thirdColumn{#3}
    \\setcolumnwidth{, \\fill, 4.5 cm}
    \\begin{paracol}{3}
    {\\raggedright #2} \\switchcolumn
}{
    \\switchcolumn \\raggedleft \\thirdColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for three column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep
    \\begin{center}
    \\begin{minipage}{0.85\\textwidth} % Makes header 80% of text width
    \\centering\\linespread{1.075}
}{
    \\end{minipage}
    \\end{center}
    \\par\\kern\\topsep
} % new environment for the header

\\newcommand{\\placelastupdatedtext}{% \\placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \\AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \\put(
        \\LenToUnit{\\paperwidth-2 cm-0 cm+0.05cm},
        \\LenToUnit{\\paperheight-1.0 cm}
    ){\\vtop{{\\null}\\makebox[0pt][c]{
        \\small\\color{gray}\\textit{Last updated in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}\\hspace{\\widthof{Last updated in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}}
    }}}%
  }%
}%

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href`;
  }

  protected generateHeader(): string {
    const { name, contacts } = this.formData.personalInfo;
    const escapedName = this.utils.escapeLaTeX(name || "Your Name");

    // Format contacts for the header
    const contactsSection = this.formatContactsForHeader(contacts || []);

    return `\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{$|$}

    \\begin{header}
        \\fontsize{25 pt}{25 pt}\\selectfont ${escapedName}

        \\vspace{1pt}

        \\normalsize
        ${contactsSection}
    \\end{header}

    \\vspace{-0cm}
    
    % summary, if provided
    ${this.formatSummary()}`;
  }

  private formatContactsForHeader(contacts: string[]): string {
    if (!contacts.length) return '';

    return contacts
      .filter(contact => contact && contact.trim().length > 0)
      .map((contact, index) => {
        const trimmedContact = contact.trim();
        let formattedContact = '';

        // Add prefix based on the first entry
        if (index === 0) {
          formattedContact = `\\mbox{${this.utils.escapeLaTeX(trimmedContact)}}`;
        } else {
          // Format based on contact type
          if (trimmedContact.includes('@')) {
            formattedContact = `\\mbox{\\hrefWithoutArrow{mailto:${trimmedContact}}{${this.utils.escapeLaTeX(trimmedContact)}}}`;
          } else if (trimmedContact.match(/^\+?[\d\s()-]+$/)) {
            formattedContact = `\\mbox{\\hrefWithoutArrow{tel:${trimmedContact.replace(/\s+/g, '-')}}{${this.utils.escapeLaTeX(trimmedContact)}}}`;
          } else if (trimmedContact.includes('linkedin.com')) {
            const displayText = trimmedContact.replace(/^https?:\/\/(www\.)?/, '');
            formattedContact = `\\mbox{\\hrefWithoutArrow{${trimmedContact}}{${this.utils.escapeLaTeX(displayText)}}}`;
          } else if (trimmedContact.includes('github.com')) {
            const displayText = trimmedContact.replace(/^https?:\/\/(www\.)?/, '');
            formattedContact = `\\mbox{\\hrefWithoutArrow{${trimmedContact}}{${this.utils.escapeLaTeX(displayText)}}}`;
          } else if (trimmedContact.includes('http')) {
            const displayText = trimmedContact.replace(/^https?:\/\/(www\.)?/, '');
            formattedContact = `\\mbox{\\hrefWithoutArrow{${trimmedContact}}{${this.utils.escapeLaTeX(displayText)}}}`;
          } else {
            formattedContact = `\\mbox{${this.utils.escapeLaTeX(trimmedContact)}}`;
          }
        }

        // Add separators between entries
        if (index < contacts.length - 1) {
          return `${formattedContact}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%`;
        }
        
        return formattedContact;
      })
      .join('\n        ');
  }

  protected generateFooter(): string {
    return `\\end{document}`;
  }

  protected formatSummary(): string {
    const summary = this.formData.personalInfo.summary;
    if (!summary || !summary.length) {
      return '';
    }

    return `\\section{Summary}
        
        \\begin{onecolentry}
            ${this.utils.escapeLaTeX(summary)}
        \\end{onecolentry}`;
  }

  protected formatExperience(): string {
    const experience = this.formData.experience;
    if (!experience || !experience.length) {
      return '';
    }

    const sectionHeading = `\\section{Experience}`;

    const experienceEntries = experience.map((job, index) => {
      const title = job.title || 'Position Title';
      const company = job.company || 'Company Name';
      const startDate = job.start || '';
      const endDate = job.end || 'Present';
      const dateRange = `${startDate} – ${endDate}`;

      const accomplishmentsArray: string[] = this.utils.extractBulletPointList(job.accomplishments);
      
      const accomplishments = accomplishmentsArray.map(item => 
        `                \\item ${this.utils.escapeLaTeX(item)}`
      ).join('\n');

      const isLastItem = index === experience.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      return `
        \\begin{twocolentry}{
            ${this.utils.escapeLaTeX(dateRange)}
        }
            \\textbf{${this.utils.escapeLaTeX(title)}}, ${this.utils.escapeLaTeX(company)}\\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
${accomplishments}
            \\end{highlights}
        \\end{onecolentry}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${experienceEntries}`;
  }

  protected formatEducation(): string {
    const education = this.formData.education;
    if (!education || !education.length) {
      return '';
    }

    const sectionHeading = `\\section{Education}`;

    const educationEntries = education.map((edu, index) => {
      const degree = edu.degree || 'Degree';
      const institution = edu.institution || 'Institution';
      const location = edu.location || '';
      const graduationDate = edu.graduationDate || '';
      const gpa = edu.gpa || '';

      const dateRange = graduationDate ? graduationDate : '';
      const accomplishmentsArray = this.utils.extractBulletPointList(edu.accomplishments);
      
      let highlights = '';
      if (accomplishmentsArray.length > 0 || gpa) {
        const items = [];
        
        // Add GPA if available
        if (gpa) {
          items.push(`                \\item \\textbf{GPA:} ${this.utils.escapeLaTeX(gpa)}`);
        }
        
        // Add other accomplishments
        accomplishmentsArray.forEach(item => {
          items.push(`                \\item ${this.utils.escapeLaTeX(item)}`);
        });
        
        highlights = `
        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
${items.join('\n')}
            \\end{highlights}
        \\end{onecolentry}`;
      }

      const isLastItem = index === education.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      return `
        \\begin{twocolentry}{
            ${this.utils.escapeLaTeX(dateRange)}
        }
            \\textbf{${this.utils.escapeLaTeX(institution)}}, ${this.utils.escapeLaTeX(degree)}${location ? ` -- ${this.utils.escapeLaTeX(location)}` : ''}\\end{twocolentry}${highlights}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${educationEntries}`;
  }

  protected formatSkills(): string {
    const skills = this.formData.skills;
    if (!skills || !skills.length) {
      return '';
    }

    const sectionHeading = `\\section{Skills}`;

    const skillEntries = skills.map((skill, index) => {
      const category = skill.category || "Category";
      const skillList = skill.skillList || "";
      
      const isLastItem = index === skills.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.05 cm}\n';

      return `
        \\begin{onecolentry}
            \\textbf{${this.utils.escapeLaTeX(category)}:} ${this.utils.escapeLaTeX(skillList)}
        \\end{onecolentry}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${skillEntries}`;
  }

  protected formatProjects(): string {
    const projects = this.formData.projects;
    if (!projects || !projects.length) {
      return '';
    }

    const sectionHeading = `\\section{Projects}`;

    const projectEntries = projects.map((project, index) => {
      const name = project.name || 'Project Title';
      const description = project.description || '';
      const startDate = project.startDate || '';
      const endDate = project.endDate || 'Present';
      const url = project.url || '';

      const highlightsArray = this.utils.extractBulletPointList(project.highlights);
      
      const highlights = highlightsArray.map(item => 
        `                \\item ${this.utils.escapeLaTeX(item)}`
      ).join('\n');

      // For the right column, use URL if available, otherwise use date range
      const rightColumn = url 
        ? `\\href{${url}}{${this.utils.escapeLaTeX(url.replace(/^https?:\/\/(www\.)?/, ''))}}`
        : startDate ? (endDate ? `${startDate} – ${endDate}` : startDate) : '';

      const isLastItem = index === projects.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      return `
        \\begin{twocolentry}{
            ${rightColumn}
        }
            \\textbf{${this.utils.escapeLaTeX(name)}}${description ? `\\\\ \\textit{${this.utils.escapeLaTeX(description)}}` : ` `}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
${highlights}
            \\end{highlights}
        \\end{onecolentry}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${projectEntries}`;
  }

  protected formatReferences(): string {
    const references = this.formData.references;
    if (!references || !references.length) {
      return '';
    }

    const sectionHeading = `\\section{References}`;

    const educationEntries = references.map((ref, index) => {
      const name = ref.name || '';
      const title = ref.title || '';
      const company = ref.company || '';
      const contactPhone = ref.contactPhone || '';
      const contactEmail = ref.contactEmail || '';

      const isLastItem = index === references.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      const companyAndTitle = `${company ? company : ''}${company && title ? ' (' : ''}${title ? this.utils.escapeLaTeX(title) : ''}${company && title ? ')' : ''}`;
      const contactLine = `${contactPhone ? `${this.utils.escapeLaTeX(contactPhone)}` : ''}${contactPhone && contactEmail ? ', ' : ''}${contactEmail ? `${this.utils.escapeLaTeX(contactEmail)}` : ''}`;

      return `
        \\begin{onecolentry}
            \\textbf{${this.utils.escapeLaTeX(name)}}${companyAndTitle ? ',' : ''} ${this.utils.escapeLaTeX(companyAndTitle)} \\\\
            ${this.utils.escapeLaTeX(contactLine)}
        \\end{onecolentry}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${educationEntries}`;
  }

  protected formatGenericSection(section: GenericSection): string {
    if (!section || !section.items.length) {
      return '';
    }

    const sectionHeading = `\\section{${this.utils.escapeLaTeX(section.title)}}`;

    const entries = section.items.map((item, index) => {
      const name = item.name || `Item ${index + 1}`;
      const description = item.description || '';

      const detailsArray: string[] = this.utils.extractBulletPointList(item.details);
      
      let formattedDetails = '';
      if (detailsArray.length > 0) {
        const bulletItems = detailsArray.map(detail => 
          `                \\item ${this.utils.escapeLaTeX(detail)}`
        ).join('\n');
        
        formattedDetails = `
        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
${bulletItems}
            \\end{highlights}
        \\end{onecolentry}`;
      }

      const isLastItem = index === section.items.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      // For generic sections, use a one-column entry or two-column entry based on content
      if (description) {
        return `
        \\begin{twocolentry}{
            ${this.utils.escapeLaTeX(description)}
        }
            \\textbf{${this.utils.escapeLaTeX(name)}}\\end{twocolentry}${formattedDetails}${spacingAfter}`;
      } else {
        return `
        \\begin{onecolentry}
            \\textbf{${this.utils.escapeLaTeX(name)}}
        \\end{onecolentry}${formattedDetails}${spacingAfter}`;
      }
    }).join('');

    return `${sectionHeading}${entries}`;
  }
}