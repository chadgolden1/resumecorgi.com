import { latexGenerator, SectionFormatter } from '../../src/lib/LaTeXService';
import { FormData, Section } from '../../src/types';

// Mock document for testing
document.createElement = jest.fn().mockImplementation((tag) => {
  if (tag === 'div') {
    return {
      innerHTML: '',
      querySelectorAll: jest.fn().mockReturnValue([
        { textContent: 'Test bullet 1' },
        { textContent: 'Test bullet 2' }
      ])
    };
  }
  return {};
});

describe('LaTeXResumeGenerator', () => {
  // Sample test data
  const mockFormData: FormData = {
    personalInfo: {
      name: 'John Doe',
      contact0: 'john@example.com',
      contact1: 'linkedin.com/in/johndoe',
      contact2: '',
      contact3: '',
      contact4: '',
      summary: 'Experienced developer'
    },
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Inc.',
        start: '2020',
        end: 'Present',
        accomplishments: '<ul><li>Led team</li><li>Improved performance</li></ul>'
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'University',
        graduationDate: '2018',
        location: 'New York',
        gpa: '3.8',
        accomplishments: '<ul><li>Dean\'s List</li></ul>'
      }
    ],
    skills: [
      {
        category: 'Programming',
        skillList: 'JavaScript, TypeScript'
      }
    ],
    projects: [],
  };

  const mockSections: Section[] = [
    {
      id: 'experience',
      selected: true,
      sortOrder: 0,
      displayName: 'Experience',
      href: '#experience',
      originalOrder: 0,
      required: false,
      sortable: false
    },
    {
      id: 'education',
      selected: true,
      sortOrder: 1,
      displayName: 'Education',
      href: '#education',
      originalOrder: 1,
      required: false,
      sortable: true
    },
    {
      id: 'skills',
      selected: true,
      sortOrder: 2,
      displayName: 'Skills',
      href: '#skills',
      originalOrder: 2,
      required: false,
      sortable: false
    }
  ];

  describe('Core functionality', () => {
    test('should generate LaTeX document with default template', () => {
      const result = latexGenerator.generateLaTeX(mockFormData, mockSections);
      
      // Check for essential document parts
      expect(result).toContain('\\documentclass');
      expect(result).toContain('\\begin{document}');
      expect(result).toContain('\\end{document}');
      
      // Check for personal info
      expect(result).toContain('John Doe');
      expect(result).toContain('john@example.com');
      
      // Check for sections
      expect(result).toContain('\\section*{Experience}');
      expect(result).toContain('\\section*{Education}');
      expect(result).toContain('\\section*{Skills}');
    });

    test('should only include selected sections', () => {
      const partialSections = [
        {
          id: 'experience',
          selected: true,
          sortOrder: 0,
          displayName: 'Experience',
          href: '#experience',
          originalOrder: 0,
          required: false,
          sortable: true
        },
        {
          id: 'education',
          selected: false, // not selected
          sortOrder: 1,
          displayName: 'Education',
          href: '#education',
          originalOrder: 1,
          required: false,
          sortable: true
        },
        {
          id: 'skills',
          selected: true,
          sortOrder: 2,
          displayName: 'Skills',
          href: '#skills',
          originalOrder: 2,
          required: false,
          sortable: true
        }
      ];
      
      const result = latexGenerator.generateLaTeX(mockFormData, partialSections);
      
      expect(result).toContain('\\section*{Experience}');
      expect(result).not.toContain('\\section*{Education}');
      expect(result).toContain('\\section*{Skills}');
    });

    test('should respect section ordering', () => {
      const reorderedSections = [
        {
          id: 'skills',
          selected: true,
          sortOrder: 0,
          displayName: 'Skills',
          href: '#skills',
          originalOrder: 2,
          required: false,
          sortable: true
        },
        {
          id: 'experience',
          selected: true,
          sortOrder: 1,
          displayName: 'Experience',
          href: '#experience',
          originalOrder: 0,
          required: false,
          sortable: true
        },
        {
          id: 'education',
          selected: true,
          sortOrder: 2,
          displayName: 'Education',
          href: '#education',
          originalOrder: 1,
          required: false,
          sortable: true
        },
      ];
      
      const result = latexGenerator.generateLaTeX(mockFormData, reorderedSections);
      
      // Find the positions of each section
      const skillsPos = result.indexOf('\\section*{Skills}');
      const experiencePos = result.indexOf('\\section*{Experience}');
      const educationPos = result.indexOf('\\section*{Education}');
      
      // Check correct ordering
      expect(skillsPos).toBeLessThan(experiencePos);
      expect(experiencePos).toBeLessThan(educationPos);
    });
  });

  describe('Template system', () => {
    test('should register and use a custom template', () => {
      // Create a simple test template
      const testTemplate = {
        preamble: '\\documentclass{article}',
        documentHeader: (name: string, contacts: string) => `\\begin{document}\n${name}\n${contacts}`,
        sectionFormatters: {
          experience: () => 'TEST_EXPERIENCE_SECTION',
          education: () => 'TEST_EDUCATION_SECTION',
          skills: () => 'TEST_SKILLS_SECTION'
        },
        documentFooter: '\\end{document}'
      };
      
      // Register template
      latexGenerator.registerTemplate('test-template', testTemplate);
      
      // Generate LaTeX with custom template
      const result = latexGenerator.generateLaTeX(mockFormData, mockSections, 'test-template');
      
      // Check template was used
      expect(result).toContain('\\documentclass{article}');
      expect(result).toContain('TEST_EXPERIENCE_SECTION');
      expect(result).toContain('TEST_EDUCATION_SECTION');
      expect(result).toContain('TEST_SKILLS_SECTION');
    });

    test('should be able to list available templates', () => {
      // Register a test template if not already done
      if (!latexGenerator.getAvailableTemplates().includes('test-template')) {
        latexGenerator.registerTemplate('test-template', {
          preamble: '',
          documentHeader: () => '',
          sectionFormatters: {},
          documentFooter: ''
        });
      }
      
      const templates = latexGenerator.getAvailableTemplates();
      
      // Should have at least standard and test template
      expect(templates).toContain('standard');
      expect(templates).toContain('test-template');
    });
    
    test('should add a section formatter to a template', () => {
      // Create test formatter
      const testFormatter: SectionFormatter = () => 'TEST_NEW_SECTION';
      
      // Add to standard template
      latexGenerator.addSectionFormatter('standard', 'new-section', testFormatter);
      
      // Create mock data with new section
      const dataWithNewSection = {
        ...mockFormData,
        'new-section': [{ title: 'Test' }]
      } as unknown as FormData;
      
      const sectionsWithNew = [
        ...mockSections,
        { id: 'new-section', selected: true, sortOrder: 3 }
      ] as unknown as Section[];
      
      // Generate LaTeX
      const result = latexGenerator.generateLaTeX(dataWithNewSection, sectionsWithNew);
      
      // Check new section is included
      expect(result).toContain('TEST_NEW_SECTION');
    });
  });

  describe('LaTeXUtils', () => {
    const utils = latexGenerator.getUtils();
    
    test('should generate correct href for different contact types', () => {
      expect(utils.getHref('user@example.com')).toBe('mailto:user@example.com');
      expect(utils.getHref('linkedin.com/in/user')).toBe('https://www.linkedin.com/in/user');
      expect(utils.getHref('https://github.com/user')).toBe('https://github.com/user');
      expect(utils.getHref('example.com')).toBe('https://example.com');
    });
    
    test('should extract bullet points from HTML', () => {
      const html = '<ul><li>Point 1</li><li>Point 2</li></ul>';
      const result = utils.extractBulletPoints(html);
      
      // Should contain the extracted bullet points
      expect(result).toContain('\\item Test bullet 1');
      expect(result).toContain('\\item Test bullet 2');
    });

    test('should format itemize environment with custom spacing', () => {
      const items = '\\item Test 1\n\\item Test 2';
      const result = utils.formatItemize(items, { vspaceBefore: '-12pt', vspaceAfter: '-6pt' });
      
      expect(result).toContain('\\begin{itemize}');
      expect(result).toContain('\\vspace{-12pt}');
      expect(result).toContain('\\item Test 1');
      expect(result).toContain('\\item Test 2');
      expect(result).toContain('\\end{itemize}');
      expect(result).toContain('\\vspace{-6pt}');
    });

    test('should handle empty or null input in formatItemize', () => {
      expect(utils.formatItemize('')).toBe('');
      expect(utils.formatItemize(null as any)).toBe('');
    });
    
    test('should escape LaTeX special characters', () => {
      const text = 'Special chars: & % $ # _ { } ^ ~';
      const result = utils.escapeLaTeX(text);
      
      // All special chars should be escaped
      expect(result).toContain('\\&');
      expect(result).toContain('\\%');
      expect(result).toContain('\\$');
      expect(result).toContain('\\#');
      expect(result).toContain('\\_');
      expect(result).toContain('\\{');
      expect(result).toContain('\\}');
      expect(result).toContain('\\textasciicircum{}');
      expect(result).toContain('\\textasciitilde{}');
    });

    test('should handle Unicode characters in escapeLaTeX', () => {
      const text = 'Math: ± × ÷ ≤ ≥ ≠ ∞ π\nAccents: é è ê ë á à â ä ñ\nQuotes: " " \'\nDashes: — –';
      const result = utils.escapeLaTeX(text);
      
      expect(result).toContain('$\\pm$');
      expect(result).toContain('$\\times$');
      expect(result).toContain('$\\div$');
      expect(result).toContain('$\\leq$');
      expect(result).toContain('$\\geq$');
      expect(result).toContain('$\\neq$');
      expect(result).toContain('$\\infty$');
      expect(result).toContain('$\\pi$');
      expect(result).toContain('\\\'e');
      expect(result).toContain('\\`e');
      expect(result).toContain('\\^e');
      expect(result).toContain('\\\'a');
      expect(result).toContain('\\`a');
      expect(result).toContain('\\^a');
      expect(result).toContain('\\~n');
      expect(result).toContain('``');
      expect(result).toContain('---');
      expect(result).toContain('--');
    });
  });

  describe('Section Formatters', () => {
    test('should format summary section', () => {
      const formData = {
        ...mockFormData,
        personalInfo: {
          ...mockFormData.personalInfo,
          summary: 'Test summary with special chars: & % $'
        }
      };
      
      const result = latexGenerator.generateLaTeX(formData, [
        {
          id: 'summary',
          selected: true,
          sortOrder: 0,
          displayName: 'Summary',
          href: '#summary',
          originalOrder: 0,
          required: false,
          sortable: false
        }
      ]);
      
      expect(result).toContain('\\section*{Summary}');
      expect(result).toContain('Test summary with special chars: \\& \\% \\$');
    });

    test('should format projects section', () => {
      const formData = {
        ...mockFormData,
        projects: [
          {
            name: 'Test Project',
            description: 'Project description',
            startDate: '2020',
            endDate: '2021',
            highlights: '<ul><li>Highlight 1</li><li>Highlight 2</li></ul>',
            url: 'https://github.com/test/project'
          }
        ]
      };
      
      const result = latexGenerator.generateLaTeX(formData, [
        {
          id: 'projects',
          selected: true,
          sortOrder: 0,
          displayName: 'Projects',
          href: '#projects',
          originalOrder: 0,
          required: false,
          sortable: false
        }
      ]);
      
      expect(result).toContain('\\section*{Projects}');
      expect(result).toContain('\\textbf{Test Project}');
      expect(result).toContain('\\textit{Project description}');
      expect(result).toContain('2020 -- 2021');
      expect(result).toContain('\\href{https://github.com/test/project}');
      expect(result).toContain('\\item Test bullet 1');
      expect(result).toContain('\\item Test bullet 2');
    });

    test('should format generic section', () => {
      const mockFormData: FormData = {
        personalInfo: {
          name: 'John Doe',
          contact0: 'john@example.com',
          contact1: 'linkedin.com/in/johndoe',
          contact2: '',
          contact3: '',
          contact4: '',
          summary: 'Experienced developer'
        },
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Inc.',
            start: '2020',
            end: 'Present',
            accomplishments: '<ul><li>Led team</li><li>Improved performance</li></ul>'
          }
        ],
        education: [
          {
            degree: 'BS Computer Science',
            institution: 'University',
            graduationDate: '2018',
            location: 'New York',
            gpa: '3.8',
            accomplishments: '<ul><li>Dean\'s List</li></ul>'
          }
        ],
        skills: [
          {
            category: 'Programming',
            skillList: 'JavaScript, TypeScript'
          }
        ],
        projects: [],
        genericSections: {
          "genericSection0": {
            title: 'Custom Section',
            items: [
              {
                name: 'Item 1',
                description: 'Description 1',
                details: '<ul><li></li></ul>'
              },
              {
                name: 'Item 2',
                description: 'Description 2',
                details: '<ul><li></li></ul>'
              },
          ]}
        }
      };
      
      const result = latexGenerator.generateLaTeX(mockFormData, [
        {
          id: 'genericSection0',
          selected: true,
          sortOrder: 0,
          displayName: 'Custom Section',
          href: '#customSection',
          originalOrder: 0,
          required: false,
          sortable: false
        }
      ]);
      
      expect(result).toContain('\\section*{Custom Section}');
      expect(result).toContain('\\textbf{Item 1}');
      expect(result).toContain('\\textbf{,} Description 1');
      expect(result).toContain('\\textbf{Item 2}');
      expect(result).toContain('\\textbf{,} Description 2');
    });
  });

  describe('Template Registry', () => {
    test('should handle template registration and retrieval', () => {
      const testTemplate = {
        preamble: '\\documentclass{article}',
        documentHeader: () => '\\begin{document}',
        sectionFormatters: {},
        documentFooter: '\\end{document}'
      };
      
      latexGenerator.registerTemplate('test-template', testTemplate);
      const templates = latexGenerator.getAvailableTemplates();
      
      expect(templates).toContain('test-template');
      
      // Test adding a section formatter to the template
      const testFormatter: SectionFormatter = () => 'TEST_SECTION';
      latexGenerator.addSectionFormatter('test-template', 'test-section', testFormatter);
      
      const result = latexGenerator.generateLaTeX(mockFormData, [
        {
          id: 'test-section',
          selected: true,
          sortOrder: 0,
          displayName: 'Test Section',
          href: '#test-section',
          originalOrder: 0,
          required: false,
          sortable: false
        }
      ], 'test-template');
      
      expect(result).toContain('TEST_SECTION');
    });
  });
});