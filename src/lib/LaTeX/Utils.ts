export class Utils {
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
  extractBulletPointItems(htmlContent?: string, defaultContent: string = ''): string {
    if (!htmlContent) return defaultContent;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    return Array.from(tempDiv.querySelectorAll('li'))
      .map(li => li.textContent?.trim() || '')
      .filter(item => item && item.length > 0)
      .map(item => `  \\item ${this.escapeLaTeX(item)}`)
      .join('\n');
  }

  /**
   * Extracts bullet points from HTML content
   */
  extractBulletPointList(htmlContent?: string): string[] {
    if (!htmlContent) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    return Array.from(tempDiv.querySelectorAll('li'))
      .map(li => li.textContent?.trim() || '')
      .filter(item => item && item.length > 0)
      .map(item => `${item}`);
  }

  formatItemize(items: string, options: { vspaceBefore?: string, vspaceAfter?: string } = {}): string {
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
    if (!text) return '';

    // handle hidden characters and non-breaking spaces
    const cleanedText = text
      // Replace non-breaking spaces with regular spaces
      .replace(/\u00A0/g, ' ')
      // Replace zero-width spaces
      .replace(/\u200B/g, '')
      // Replace zero-width non-joiners
      .replace(/\u200C/g, '')
      // Replace zero-width joiners
      .replace(/\u200D/g, '')
      // Replace left-to-right marks
      .replace(/\u200E/g, '')
      // Replace right-to-left marks
      .replace(/\u200F/g, '')
      // Replace various other invisible Unicode characters
      .replace(/[\u2000-\u200F\u2028-\u202F\u205F-\u206F]/g, ' ')
      // Replace tab characters with spaces
      .replace(/\t/g, ' ')
      // Normalize multiple spaces to single space
      .replace(/ +/g, ' ');

    // Replace special LaTeX characters with their escaped versions
    return cleanedText
      // Handle LaTeX special characters
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/%/g, '\\%')

      // Handle special Unicode characters using LaTeX encodings
      // Math symbols
      .replace(/±/g, '$\\pm$')
      .replace(/×/g, '$\\times$')
      .replace(/÷/g, '$\\div$')
      .replace(/≤/g, '$\\leq$')
      .replace(/≥/g, '$\\geq$')
      .replace(/≠/g, '$\\neq$')
      .replace(/∞/g, '$\\infty$')
      .replace(/π/g, '$\\pi$')

      // Common accented characters
      .replace(/é/g, '\\\'e')
      .replace(/è/g, '\\`e')
      .replace(/ê/g, '\\^e')
      .replace(/ë/g, '\\"e')
      .replace(/á/g, '\\\'a')
      .replace(/à/g, '\\`a')
      .replace(/â/g, '\\^a')
      .replace(/ä/g, '\\"a')
      .replace(/ñ/g, '\\~n')

      // Handle quotes
      .replace(/"/g, '``')  // Opening quotes
      .replace(/"/g, "''")  // Closing quotes
      .replace(/'/g, "'")   // Apostrophe/single quote

      // Em dash and en dash
      .replace(/—/g, '---')
      .replace(/–/g, '--');
  }

  /**
   * Format contacts list with consistent styling
   */
  formatContacts(contacts: string[]): string {
    if (!contacts.length) return '';

    const items = contacts
      .filter(c => c && c.length > 0)
      .map(c => `\\href{${this.escapeLaTeX(this.getHref(c))}}{${this.escapeLaTeX(c)}}`);
    
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
  }
}
