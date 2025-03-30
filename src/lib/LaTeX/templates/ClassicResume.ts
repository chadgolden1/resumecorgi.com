import { TemplateAdapter } from '../TemplateAdapter';
import { GenericSection, } from '@/types';

export class ClassicResume extends TemplateAdapter {
  protected generatePreamble(): string {
    return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=1.75 cm, % seperation between body and page edge from the top
    bottom=1.75 cm, % seperation between body and page edge from the bottom
    left=1.75 cm, % seperation between body and page edge from the left
    right=1.75 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage[explicit]{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{38, 74, 142}
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={${this.utils.escapeLaTeX(this.formData.personalInfo.name || "Resume")}},
    pdfauthor={${this.utils.escapeLaTeX(this.formData.personalInfo.name || "Candidate")}},
    pdfcreator={LaTeX with Resume Generator},
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

\\usepackage[default, type1]{sourcesanspro} 

% Some settings:
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0.05cm} % set column seperation
\\makeatletter
\\let\\ps@customFooterStyle\\ps@plain % Copy the plain style to customFooterStyle
\\patchcmd{\\ps@customFooterStyle}{\\thepage}{
    \\color{gray}\\textit{\\small ${this.utils.escapeLaTeX(this.formData.personalInfo.name || "Candidate")} - Page \\thepage{} of \\pageref*{LastPage}}
}{}{} % replace number by desired string
\\makeatother
%\\pagestyle{customFooterStyle}

\\titleformat{\\section}{
    % avoid page braking right after the section title
    \\needspace{4\\baselineskip}
    % make the font size of the section title large and color it with the primary color
    \\Large\\color{primaryColor}
}{
}{
}{
    % print bold title, give 0.15 cm space and draw a line of 0.8 pt thickness
    % from the end of the title to the end of the body
    \\textbf{#1}\\hspace{0.15cm}\\titlerule[0.8pt]\\hspace{-0.1cm}
}[] % section title formatting

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

% \\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0.5 cm
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
        0.15 cm + 0.00001 cm
    }{
        0.15 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{threecolentry}[3][]{
    \\onecolentry
    \\def\\thirdColumn{#3}
    \\setcolumnwidth{1 cm, \\fill, 4.5 cm}
    \\begin{paracol}{3}
    {\\raggedright #2} \\switchcolumn
}{
    \\switchcolumn \\raggedleft \\thirdColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for three column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\color{primaryColor}\\linespread{1.5}
}{
    \\par\\kern\\topsep
} % new environment for the header

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

% new command for external links:
\\renewcommand{\\href}[2]{\\hrefWithoutArrow{#1}{\\ifthenelse{\\equal{#2}{}}{}{#2 }\\raisebox{0ex}{\\footnotesize \\faExternalLink*}}}`;
  }

  protected generateHeader(): string {
    const { name, contacts } = this.formData.personalInfo;
    const escapedName = this.utils.escapeLaTeX(name || "Your Name");

    return `\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{}

    \\begin{header}
        \\fontsize{30 pt}{30 pt}
        \\textbf{${escapedName}}

        \\vspace{0cm}

        \\normalsize
        ${this.formatContactsForHeader(contacts || [])}
    \\end{header}

    \\vspace{0.2cm}
    
    ${this.formatSummary()}`;
  }

  private formatContactsForHeader(contacts: string[]): string {
    if (!contacts.length) return '';

    return contacts
      .filter(contact => contact && contact.trim().length > 0)
      .map((contact, index) => {
        const trimmedContact = contact.trim();
        let formattedContact = '';
        
        // Format based on contact type with icons
        if (trimmedContact.includes('@') && !trimmedContact.startsWith('@')) {
          formattedContact = `\\mbox{\\hrefWithoutArrow{mailto:${trimmedContact}}{{\\footnotesize\\faEnvelope[regular]}\\hspace*{0.13cm}${this.utils.escapeLaTeX(trimmedContact)}}}`;
        } else if (trimmedContact.match(/^\+?[\d\s()-]+$/)) {
          formattedContact = `\\mbox{\\hrefWithoutArrow{tel:${trimmedContact.replace(/\s+/g, '-')}}{{\\footnotesize\\faPhone*}\\hspace*{0.13cm}${this.utils.escapeLaTeX(trimmedContact)}}}`;
        } else if (trimmedContact.includes('linkedin.com')) {
          // For LinkedIn, just show the username
          const username = trimmedContact.split('/').pop() || trimmedContact;
          formattedContact = `\\mbox{\\hrefWithoutArrow{${this.utils.getHref(trimmedContact)}}{{\\footnotesize\\faLinkedinIn}\\hspace*{0.13cm}${this.utils.escapeLaTeX(username)}}}`;
        } else if (trimmedContact.includes('github.com')) {
          // For GitHub, just show the username
          const username = trimmedContact.split('/').pop() || trimmedContact;
          formattedContact = `\\mbox{\\hrefWithoutArrow{${this.utils.getHref(trimmedContact)}}{{\\footnotesize\\faGithub}\\hspace*{0.13cm}${this.utils.escapeLaTeX(username)}}}`;
        } else if (trimmedContact.includes('http')) {
          // For websites, clean up the URL for display
          const displayText = trimmedContact.replace(/^https?:\/\/(www\.)?/, '');
          formattedContact = `\\mbox{\\hrefWithoutArrow{${this.utils.getHref(trimmedContact)}}{{\\footnotesize\\faLink}\\hspace*{0.13cm}${this.utils.escapeLaTeX(displayText)}}}`;
        } else {
          // For websites, clean up the URL for display
          const displayText = trimmedContact.replace(/^https?:\/\/(www\.)?/, '');
          formattedContact = `\\mbox{\\hspace*{0.06cm}${this.utils.escapeLaTeX(displayText)}}`;
        }

        // Add separators between entries
        if (index < contacts.length - 1) {
          return `${formattedContact}%
        \\kern 0.25 cm%
        \\AND%
        \\kern 0.25 cm%`;
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

      const accomplishmentsArray = this.utils.extractBulletPointList(job.accomplishments);
      
      const accomplishments = accomplishmentsArray.map(item => 
        `                \\item ${this.utils.escapeLaTeX(item)}`
      ).join('\n');

      const isLastItem = index === experience.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      const location = '';
      const locationAndDateRange = location ? 
        `${this.utils.escapeLaTeX(location)}\n\n        ${this.utils.escapeLaTeX(dateRange)}` : 
        this.utils.escapeLaTeX(dateRange);

      return `
        \\begin{twocolentry}{
            ${locationAndDateRange}
        }
            \\textbf{${this.utils.escapeLaTeX(company)}}, ${this.utils.escapeLaTeX(title)}
            \\begin{highlights}
${accomplishments || "\\item "}
            \\end{highlights}
        \\end{twocolentry}${spacingAfter}`;
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
      
      const accomplishmentsArray = this.utils.extractBulletPointList(edu.accomplishments);
      
      let highlightItems = [];
      
      // Add GPA if available
      if (gpa) {
        highlightItems.push(`                \\item GPA: ${this.utils.escapeLaTeX(gpa)}`);
      }
      
      // Add other accomplishments
      accomplishmentsArray.forEach(item => {
        highlightItems.push(`                \\item ${this.utils.escapeLaTeX(item)}`);
      });
      
      const highlights = highlightItems.length > 0 ? 
        `            \\begin{highlights}\n${highlightItems.join('\n')}\n            \\end{highlights}` : '';

      const isLastItem = index === education.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n';

      return `
        \\begin{twocolentry}{ ${this.utils.escapeLaTeX(graduationDate)} }
          \\textbf{${this.utils.escapeLaTeX(degree)}, } ${this.utils.escapeLaTeX(institution)} ${location ? ` -- ${this.utils.escapeLaTeX(location)}` : ``}
  ${highlights}
        \\end{twocolentry}${spacingAfter}`;
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
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.15 cm}\n';

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
      const url = project.url || '';
      
      const highlightsArray = this.utils.extractBulletPointList(project.highlights);
      
      const highlights = highlightsArray.map(item => 
        `                \\item ${this.utils.escapeLaTeX(item)}`
      ).join('\n');

      const isLastItem = index === projects.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      return `
        \\begin{twocolentry}{
            ${project.startDate || ''} ${project.startDate && project.endDate ? "--" : ""} ${project.endDate || ''}
        }
            \\textbf{${this.utils.escapeLaTeX(name)}} ${ description ? `\\\\ ${this.utils.escapeLaTeX(description)}` : ""} ${ url ? `\\\\ \\href{${url}}{${this.utils.escapeLaTeX(url.replace(/^https?:\/\/(www\.)?/, ''))}} ` : ""}

${highlights
  ? `
            \\begin{highlights}
            ${highlights}
            \\end{highlights}`
  : ``
}
        \\end{twocolentry}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${projectEntries}`;
  }

  protected formatGenericSection(section: GenericSection): string {
    if (!section || !section.items.length) {
      return '';
    }

    const sectionHeading = `\\section{${this.utils.escapeLaTeX(section.title)}}`;

    const entries = section.items.map((item, index) => {
      const name = item.name || `Item ${index + 1}`;
      const description = item.description || '';

      const detailsArray = this.utils.extractBulletPointList(item.details);
      
      const bulletItems = detailsArray.map(detail => 
        `                \\item ${this.utils.escapeLaTeX(detail)}`
      ).join('\n');

      const isLastItem = index === section.items.length - 1;
      const spacingAfter = isLastItem ? '' : '\n\n        \\vspace{0.2 cm}\n';

      return `
        \\begin{twocolentry}{
            ${this.utils.escapeLaTeX(description)}
        }
            \\textbf{${this.utils.escapeLaTeX(name)}}
            ${bulletItems ? `\\begin{highlights}\n${bulletItems}\n            \\end{highlights}` : ''}
        \\end{twocolentry}${spacingAfter}`;
    }).join('');

    return `${sectionHeading}${entries}`;
  }
}