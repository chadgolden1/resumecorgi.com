import { exportToJsonResume, importFromJsonResume } from '../../src/lib/ImportExportService';
import { FormData } from '../../src/types';

describe('ImportExportService', () => {
  const mockFormData: FormData = {
    personalInfo: {
      name: 'John Doe',
      contacts: [
        'john@example.com',
        '+1 (555) 123-4567',
        'https://linkedin.com/in/johndoe',
        'https://github.com/johndoe'
      ],
      summary: 'Experienced software engineer with a passion for building great products.'
    },
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        start: '2020-01',
        end: '2023-12',
        accomplishments: '<ul><li>Led team of 5 engineers</li><li>Delivered major product features</li><li>Improved system performance by 50%</li></ul>'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Technology',
        location: 'San Francisco, CA',
        graduationDate: '2019-05',
        gpa: '3.8',
        accomplishments: '<ul><li>Dean\'s List</li><li>Graduated with Honors</li></ul>'
      }
    ],
    skills: [
      {
        category: 'Programming Languages',
        skillList: 'TypeScript, Python, Java, C++'
      },
      {
        category: 'Frameworks',
        skillList: 'React, Node.js, Express'
      }
    ],
    projects: [
      {
        name: 'Resume Builder',
        startDate: '2023-01',
        endDate: '2023-12',
        description: 'A modern resume builder application',
        highlights: '<ul><li>Built with React and TypeScript</li><li>Supports multiple templates</li><li>JSON Resume compatible</li></ul>',
        url: 'https://github.com/johndoe/resume-builder'
      }
    ]
  };

  describe('exportToJsonResume', () => {
    it('should correctly convert personal info', () => {
      const result = exportToJsonResume(mockFormData);
      
      expect(result.basics).toBeDefined();
      expect(result.basics?.name).toBe('John Doe');
      expect(result.basics?.email).toBe('john@example.com');
      expect(result.basics?.phone).toBe('+1 (555) 123-4567');
      expect(result.basics?.summary).toBe('Experienced software engineer with a passion for building great products.');
      
      // Check profiles
      expect(result.basics?.profiles).toHaveLength(2);
      expect(result.basics?.profiles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            network: 'Linkedin',
            url: 'https://linkedin.com/in/johndoe'
          }),
          expect.objectContaining({
            network: 'Github',
            url: 'https://github.com/johndoe'
          })
        ])
      );
    });

    it('should correctly convert work experience', () => {
      const result = exportToJsonResume(mockFormData);
      
      expect(result.work).toHaveLength(1);
      expect(result.work?.[0]).toEqual({
        name: 'Tech Corp',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        endDate: '2023-12',
        highlights: [
          'Led team of 5 engineers',
          'Delivered major product features',
          'Improved system performance by 50%'
        ]
      });
    });

    it('should correctly convert education', () => {
      const result = exportToJsonResume(mockFormData);

      expect(result.education).toHaveLength(1);
      expect(result.education?.[0]).toEqual({
        institution: 'University of Technology',
        area: 'Bachelor of Science in Computer Science',
        score: '3.8',
        startDate: '',
        endDate: '2019-05',
        highlights: [
          'Dean\'s List',
          'Graduated with Honors'
        ]
      });
    });

    it('should correctly convert skills', () => {
      const result = exportToJsonResume(mockFormData);
      
      expect(result.skills).toHaveLength(2);
      expect(result.skills?.[0]).toEqual({
        name: 'Programming Languages',
        keywords: ['TypeScript', 'Python', 'Java', 'C++']
      });
      expect(result.skills?.[1]).toEqual({
        name: 'Frameworks',
        keywords: ['React', 'Node.js', 'Express']
      });
    });

    it('should correctly convert projects', () => {
      const result = exportToJsonResume(mockFormData);
      
      expect(result.projects).toHaveLength(1);
      expect(result.projects?.[0]).toEqual({
        name: 'Resume Builder',
        description: 'A modern resume builder application',
        highlights: [
          'Built with React and TypeScript',
          'Supports multiple templates',
          'JSON Resume compatible'
        ],
        startDate: '2023-01',
        endDate: '2023-12',
        url: 'https://github.com/johndoe/resume-builder'
      });
    });

    it('should include meta information', () => {
      const result = exportToJsonResume(mockFormData);
      
      expect(result.meta).toBeDefined();
      expect(result.meta?.version).toBe('1.0.0');
      expect(result.meta?.lastModified).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    });
  });

  describe('importFromJsonResume', () => {
    it('should correctly import a full JSON Resume', () => {
      const exported = exportToJsonResume(mockFormData);
      const result = importFromJsonResume(exported);

      // Test personal info
      expect(result.personalInfo.name).toBe(mockFormData.personalInfo.name);
      expect(result.personalInfo.summary).toBe(mockFormData.personalInfo.summary);
      expect(result.personalInfo.contacts).toEqual(
        expect.arrayContaining(mockFormData.personalInfo.contacts)
      );

      // Test experience
      expect(result.experience).toHaveLength(mockFormData.experience.length);
      expect(result.experience[0].title).toBe(mockFormData.experience[0].title);
      expect(result.experience[0].company).toBe(mockFormData.experience[0].company);
      expect(result.experience[0].start).toBe(mockFormData.experience[0].start);
      expect(result.experience[0].end).toBe(mockFormData.experience[0].end);
      
      // Test education
      expect(result.education).toHaveLength(mockFormData.education.length);
      expect(result.education[0].degree).toBe(mockFormData.education[0].degree);
      expect(result.education[0].institution).toBe(mockFormData.education[0].institution);
      expect(result.education[0].gpa).toBe(mockFormData.education[0].gpa);

      // Test skills
      expect(result.skills).toHaveLength(mockFormData.skills.length);
      expect(result.skills[0].category).toBe(mockFormData.skills[0].category);
      expect(result.skills[0].skillList).toBe(mockFormData.skills[0].skillList);

      // Test projects
      expect(result.projects).toHaveLength(mockFormData.projects.length);
      expect(result.projects[0].name).toBe(mockFormData.projects[0].name);
      expect(result.projects[0].description).toBe(mockFormData.projects[0].description);
      expect(result.projects[0].highlights).toBe(mockFormData.projects[0].highlights);
    });

    it('should handle missing or empty fields', () => {
      const emptyResume = {
        basics: {
          name: 'John Doe'
        }
      };

      const result = importFromJsonResume(emptyResume);

      expect(result.personalInfo.name).toBe('John Doe');
      expect(result.personalInfo.contacts).toEqual([]);
      expect(result.personalInfo.summary).toBe('');
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.projects).toEqual([]);
    });
  });
}); 