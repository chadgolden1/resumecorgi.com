import { FormData, GenericSection } from '../types';
import { getSavedResumes, loadResumeCopy, updateOrCreateResumeCopy } from './StorageService';

interface JsonResumeBasics {
  name: string;
  label?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  };
  profiles?: Array<{
    network: string;
    username?: string;
    url?: string;
  }>;
}

interface JsonResumeWork {
  name: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
}

interface JsonResumeEducation {
  institution: string;
  location?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  highlights?: string[];
}

interface JsonResumeSkill {
  name: string;
  level?: string;
  keywords?: string[];
}

interface JsonResumeProject {
  name: string;
  description?: string;
  highlights?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
}

interface JsonGenericSection {
  name: string;
  items?: JsonGenericSectionItem[];
}

interface JsonGenericSectionItem {
  name: string;
  description?: string;
  details?: string[];
}

interface JsonResume {
  basics?: JsonResumeBasics;
  work?: JsonResumeWork[];
  education?: JsonResumeEducation[];
  skills?: JsonResumeSkill[];
  projects?: JsonResumeProject[];
  meta?: {
    version?: string;
    lastModified?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Convert internal contact format to JSON Resume profile format
 */
const parseContacts = (contacts: string[]): { email?: string; phone?: string; profiles: Array<{ network: string; url: string }> } => {
  const result = {
    email: undefined as string | undefined,
    phone: undefined as string | undefined,
    profiles: [] as Array<{ network: string; url: string }>
  };

  contacts?.forEach(contact => {
    if (contact.startsWith('@')) {
      result.profiles.push({
        network: 'Twitter',
        url: contact
      });
    } else if (contact.includes('@')) {
      result.email = contact;
    } else if (contact.match(/^\+?[\d\s-()]+$/)) {
      result.phone = contact;
    } else if (contact.startsWith('http')) {
      try {
        // Try to determine the network from the URL
        const url = new URL(contact);
        
        // Extract the domain parts
        const hostParts = url.hostname.split('.');
        
        // Find the main domain name (usually the second-to-last part)
        // For example: from "www.linkedin.com" we want "linkedin"
        // From "subdomain.example.co.uk" we want "example"
        let network = '';
        
        if (hostParts.length >= 2) {
          // Check for country code TLDs with organizational domains (like .co.uk)
          if (hostParts.length >= 3 && 
              hostParts[hostParts.length - 2].length <= 3 && 
              hostParts[hostParts.length - 1].length <= 3) {
            network = hostParts[hostParts.length - 3];
          } else {
            network = hostParts[hostParts.length - 2];
          }
        } else {
          network = 'website';
        }
        
        result.profiles.push({
          network: network.charAt(0).toUpperCase() + network.slice(1),
          url: contact
        });
      } catch (error) {
        if (error instanceof Error) {
          console.log('Encountered error parsing contact', contact, error.message)
        }
        result.profiles.push({
          network: 'Website',
          url: contact
        });
      }
    } else {
      result.profiles.push({
        network: 'Unknown',
        url: contact
      });
    }
  });

  return result;
};

/**
 * Convert JSON Resume profile format to internal contacts format
 */
const formatContacts = (basics: JsonResumeBasics): string[] => {
  const contacts: string[] = [];
  
  if (basics.email) contacts.push(basics.email);
  if (basics.phone) contacts.push(basics.phone);
  if (basics.url) contacts.push(basics.url);
  if (basics.profiles) {
    basics.profiles.forEach(profile => {
      if (profile.url) contacts.push(profile.url);
    });
  }

  return contacts;
};

function extractListItems(htmlString: string | null): string[] {
  if (!htmlString || htmlString.length === 0) {
    return [];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const listItems = doc.querySelectorAll('li');
  return Array.from(listItems).map(item => item.textContent?.trim()).filter(text => text !== undefined);
}

function createUnorderedList(items: string[]): string {
  if (!items || items.length === 0) {
    return "";
  }

  const listItems = items.map(item => `<li>${item}</li>`).join('');
  return `<ul>${listItems}</ul>`;
}

/**
 * Export internal resume data to JSON Resume format
 */
export const exportToJsonResume = (formData: FormData): JsonResume => {
  const { personalInfo, experience, education, skills, projects } = formData;
  const contactInfo = parseContacts(personalInfo.contacts);

  let resumeExport: JsonResume = {
    basics: {
      name: personalInfo.name,
      email: contactInfo.email,
      phone: contactInfo.phone,
      summary: personalInfo.summary,
      profiles: contactInfo.profiles
    },
    work: experience.map(exp => {
      let item: JsonResumeWork = {
        name: exp.company,
        position: exp.title,
        startDate: exp.start,
        endDate: exp.end,
        highlights: extractListItems(exp.accomplishments)
      };

      return item;
    }),
    education: education.map(edu => ({
      institution: edu.institution,
      area: edu.degree,
      score: edu.gpa,
      startDate: '',
      endDate: edu.graduationDate,
      highlights: extractListItems(edu.accomplishments),
    })),
    skills: skills.map(skill => ({
      name: skill.category,
      keywords: skill.skillList.split(',').map(s => s.trim())
    })),
    projects: projects.map(project => ({
      name: project.name,
      description: project.description,
      highlights: extractListItems(project.highlights),
      startDate: project.startDate,
      endDate: project.endDate,
      url: project.url
    })),
    meta: {
      version: '1.0.0',
      lastModified: new Date().toISOString()
    }
  };

  // export custom generic sections
  Object.keys(formData.genericSections || {}).forEach(key => {
    const section = formData.genericSections?.[key];

    if (section) {
      const title = section.title.replace(" ", "");
      const genericSection: JsonGenericSection = {
        name: title,
        items: section.items.map(item => ({
          name: item.name,
          description: item.description || "",
          details: extractListItems(item.details || "")
        }))
      } 
      resumeExport[title] = genericSection;
    }
  });

  return resumeExport;
};

/**
 * Import from JSON Resume format to internal format
 */
export const importFromJsonResume = (jsonResume: JsonResume): FormData => {
  const formData: FormData = {
    personalInfo: {
      name: jsonResume.basics?.name || '',
      contacts: jsonResume.basics ? formatContacts(jsonResume.basics) : [],
      summary: jsonResume.basics?.summary || ''
    },
    experience: (jsonResume.work || []).map(work => ({
      title: work.position || '',
      company: work.name || '',
      start: work.startDate || '',
      end: work.endDate || '',
      accomplishments: createUnorderedList(work.highlights || []),
    })),
    education: (jsonResume.education || []).map(edu => ({
      degree: edu.area || '',
      institution: edu.institution || '',
      location: edu.location || '',
      graduationDate: edu.endDate || '',
      gpa: edu.score || '',
      accomplishments: createUnorderedList(edu.highlights || []),
    })),
    skills: (jsonResume.skills || []).map(skill => ({
      category: skill.name || '',
      skillList: (skill.keywords || []).join(', ')
    })),
    projects: (jsonResume.projects || []).map(project => ({
      name: project.name || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      description: project.description || '',
      highlights: createUnorderedList(project.highlights || []),
      url: project.url || ''
    })),
    references: [],
  };

  // Find custom sections (any key not in standard sections)
  const genericSections: { [key: string]: GenericSection } = {};
  const standardKeys = ['basics', 'work', 'education', 'skills', 'projects', 'meta'];
  Object.keys(jsonResume).forEach(key => {
    if (!standardKeys.includes(key)) {
      const section: JsonGenericSection = jsonResume[key];
      if (section && typeof section === 'object') {
        genericSections[key] = {
          title: section.name || key,
          items: Array.isArray(section.items) ? section.items.map(item => ({
            name: item.name || '',
            description: item.description || '',
            details: Array.isArray(item.details) ? createUnorderedList(item.details) : ''
          })) : []
        };
      }
    }
  });

  formData.genericSections = genericSections;

  return formData;
};

/**
 * Export resume data to a downloadable JSON file
 */
export const downloadResumeAsJson = (formData: FormData): void => {
  const jsonResume = exportToJsonResume(formData);
  const jsonString = JSON.stringify(jsonResume, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume-${
    new Date().toISOString().split('T')[0]
   }-${
    new Date().toLocaleTimeString('en-US', {hour12: false}).replace(/:/g, '')
   }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Import resume data from a JSON file
 * @returns Promise that resolves with the imported FormData
 */
export const importResumeFromJson = async (file: File): Promise<FormData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonResume = JSON.parse(e.target?.result as string);
        const formData = importFromJsonResume(jsonResume);
        resolve(formData);
      } catch (error) {
        if (error instanceof Error) {
          reject(new Error(error.message))
        } else {
          reject(new Error('Failed to parse resume JSON file'));
        }
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read resume file'));
    reader.readAsText(file);
  });
};

interface ExportedResume {
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
  templateId?: string;
  jsonResume: JsonResume;
}

interface AllResumesExport {
  version: string;
  exportDate: string;
  resumes: ExportedResume[];
}

/**
 * Export all saved resumes to a downloadable JSON file
 */
export const downloadAllResumesAsJson = (): void => {
  const savedResumes = getSavedResumes();
  
  // Convert each saved resume to the export format
  const exportedResumes: ExportedResume[] = savedResumes.map(metadata => {
    const resumeData = loadResumeCopy(metadata.id);
    if (!resumeData) {
      throw new Error(`Could not load resume with ID: ${metadata.id}`);
    }
    
    return {
      id: metadata.id,
      name: metadata.name,
      createdAt: metadata.createdAt,
      lastUpdated: metadata.lastUpdated,
      templateId: resumeData.templateId,
      jsonResume: exportToJsonResume(resumeData.formData)
    };
  });

  const allResumesExport: AllResumesExport = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    resumes: exportedResumes
  };
  
  const jsonString = JSON.stringify(allResumesExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `all-resumes-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

interface ImportResult {
  imported: number;
  skipped: number;
  renamed: number;
}

/**
 * Import all resumes from a JSON file using suffix strategy for conflicts
 * @returns Promise that resolves with import statistics
 */
export const importAllResumesFromJson = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData: AllResumesExport = JSON.parse(e.target?.result as string);
        
        if (!importData.resumes || !Array.isArray(importData.resumes)) {
          throw new Error('Invalid import file format');
        }
        
        const existingResumes = getSavedResumes();
        const existingNames = new Set(existingResumes.map(r => r.name));
        
        let imported = 0;
        let skipped = 0;
        let renamed = 0;
        
        importData.resumes.forEach(exportedResume => {
          try {
            // Import the form data from JSON Resume format
            const formData = importFromJsonResume(exportedResume.jsonResume);
            let finalName = exportedResume.name;
            
            // Check for name conflicts
            if (existingNames.has(finalName)) {
              // Find a unique name with suffix
              let suffix = 1;
              let newName = `${finalName} (imported)`;
              while (existingNames.has(newName)) {
                suffix++;
                newName = `${finalName} (imported ${suffix})`;
              }
              finalName = newName;
              renamed++;
            }
            
            // Create the resume with a new ID (don't reuse the exported ID to avoid conflicts)
            const newId = crypto.randomUUID();
            updateOrCreateResumeCopy(
              newId,
              {
                formData,
                sections: [], // This will be populated by the app when the resume is loaded
                templateId: exportedResume.templateId,
                currentResumeId: newId
              },
              finalName
            );
            
            existingNames.add(finalName);
            imported++;
          } catch (error) {
            console.error(`Failed to import resume "${exportedResume.name}":`, error);
            skipped++;
          }
        });
        
        resolve({ imported, skipped, renamed });
      } catch (error) {
        if (error instanceof Error) {
          reject(new Error(error.message));
        } else {
          reject(new Error('Failed to parse import file'));
        }
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read import file'));
    reader.readAsText(file);
  });
}; 