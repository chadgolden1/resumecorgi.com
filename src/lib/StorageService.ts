import { FormData, Section } from '../types';
import { initialFormData, initialSections, initialTemplateId } from './DataInitializer';

export const STORAGE_KEY = 'resume-builder-data';
export const SAVED_RESUMES_KEY = 'resume-builder-saved-copies';

interface StoredData {
  formData: FormData;
  sections: Section[];
  templateId?: string;
  resumeName?: string;
  currentResumeId?: string;
}

interface SavedResumeMetadata {
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
}

interface SavedResume extends SavedResumeMetadata {
  data: StoredData;
}

/**
 * Load data from localStorage
 * @returns Object containing formData and sections, or initial values if none found
 */
export const loadFromStorage = (): StoredData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        formData: parsedData.formData || initialFormData,
        sections: parsedData.sections || initialSections,
        templateId: parsedData.templateId || initialTemplateId,
        resumeName: parsedData.resumeName,
        currentResumeId: parsedData.currentResumeId,
      };
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  return {
    formData: initialFormData,
    sections: initialSections,
    templateId: initialTemplateId,
  };
};

/**
 * Save data to localStorage
 * @param data Object containing formData and sections
 */
export const saveToStorage = (data: StoredData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

/**
 * Clear all stored data and return to initial defaults
 * @returns Object containing initial formData and sections
 */
export const clearStorage = (targetFormData: FormData = initialFormData, targetSections: Section[] = initialSections, targetTemplateId: string = initialTemplateId, targetResumeName?: string, targetResumeId?: string): StoredData => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  
  return {
    formData: targetFormData,
    sections: targetSections,
    templateId: targetTemplateId,
    resumeName: targetResumeName,
    currentResumeId: targetResumeId
  };
};

/**
 * Generate a default name for a resume based on personal info
 * @param formData The form data to extract name from
 * @returns A default resume name in kebab-case with epoch timestamp
 */
export const generateDefaultResumeName = (formData: FormData): string => {
  const { personalInfo } = formData;
  const epochSeconds = Math.floor(Date.now() / 1000);
  
  if (personalInfo?.name && personalInfo?.name !== 'Your Name') {
    // Convert name to kebab-case: "John Doe" -> "john-doe"
    const kebabName = personalInfo.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
    
    return `${kebabName}-resume-${epochSeconds}`;
  }
  
  return `my-resume-${epochSeconds}`;
};

/**
 * Get all saved resume copies from localStorage
 * @returns Array of saved resume metadata, sorted by lastUpdated (newest first)
 */
export const getSavedResumes = (): SavedResumeMetadata[] => {
  try {
    const savedData = localStorage.getItem(SAVED_RESUMES_KEY);
    if (savedData) {
      const resumes: SavedResume[] = JSON.parse(savedData);
      return resumes
        .map(resume => ({
          id: resume.id,
          name: resume.name,
          createdAt: resume.createdAt,
          lastUpdated: resume.lastUpdated
        }))
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }
  } catch (error) {
    console.error('Error loading saved resumes:', error);
  }
  return [];
};

/**
 * Save a copy of the current resume with a given name
 * @param data The resume data to save
 * @param name The name for this resume copy
 * @returns The ID of the saved resume
 */
export const saveResumeCopy = (data: StoredData, name?: string): string => {
  try {
    const resumeId = crypto.randomUUID();
    const now = new Date().toISOString();
    const resumeName = name || generateDefaultResumeName(data.formData);
    
    const savedResume: SavedResume = {
      id: resumeId,
      name: resumeName,
      createdAt: now,
      lastUpdated: now,
      data
    };
    
    const existingResumes = getSavedResumesFull();
    const updatedResumes = [...existingResumes, savedResume];
    
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(updatedResumes));
    return resumeId;
  } catch (error) {
    console.error('Error saving resume copy:', error);
    throw new Error('Failed to save resume copy');
  }
};

/**
 * Load a saved resume copy by ID
 * @param id The ID of the resume to load
 * @returns The stored data or null if not found
 */
export const loadResumeCopy = (id: string): StoredData | null => {
  try {
    const savedResumes = getSavedResumesFull();
    const resume = savedResumes.find(r => r.id === id);
    return resume ? resume.data : null;
  } catch (error) {
    console.error('Error loading resume copy:', error);
    return null;
  }
};

/**
 * Delete a saved resume copy by ID
 * @param id The ID of the resume to delete
 * @returns True if successfully deleted, false otherwise
 */
export const deleteResumeCopy = (id: string): boolean => {
  try {
    const savedResumes = getSavedResumesFull();
    const filteredResumes = savedResumes.filter(r => r.id !== id);
    
    if (filteredResumes.length === savedResumes.length) {
      return false; // Resume not found
    }
    
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(filteredResumes));
    return true;
  } catch (error) {
    console.error('Error deleting resume copy:', error);
    return false;
  }
};

/**
 * Update the name of a saved resume copy
 * @param id The ID of the resume to rename
 * @param newName The new name for the resume
 * @returns True if successfully renamed, false otherwise
 */
export const renameResumeCopy = (id: string, newName: string): boolean => {
  try {
    const savedResumes = getSavedResumesFull();
    const resumeIndex = savedResumes.findIndex(r => r.id === id);
    
    if (resumeIndex === -1) {
      return false; // Resume not found
    }
    
    savedResumes[resumeIndex].name = newName;
    savedResumes[resumeIndex].lastUpdated = new Date().toISOString();
    
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(savedResumes));
    return true;
  } catch (error) {
    console.error('Error renaming resume copy:', error);
    return false;
  }
};

/**
 * Update or create a saved resume copy
 * @param id The ID of the resume
 * @param data The resume data to save
 * @param name The name for this resume
 * @returns The ID of the saved resume
 */
export const updateOrCreateResumeCopy = (id: string, data: StoredData, name: string): string => {
  try {
    const savedResumes = getSavedResumesFull();
    const existingIndex = savedResumes.findIndex(r => r.id === id);
    const now = new Date().toISOString();
    
    if (existingIndex !== -1) {
      // Update existing resume
      savedResumes[existingIndex] = {
        ...savedResumes[existingIndex],
        name,
        lastUpdated: now,
        data
      };
    } else {
      // Create new resume entry
      const newResume: SavedResume = {
        id,
        name,
        createdAt: now,
        lastUpdated: now,
        data
      };
      savedResumes.push(newResume);
    }
    
    localStorage.setItem(SAVED_RESUMES_KEY, JSON.stringify(savedResumes));
    return id;
  } catch (error) {
    console.error('Error updating/creating resume copy:', error);
    throw new Error('Failed to update/create resume copy');
  }
};

/**
 * Helper function to get full saved resumes data (internal use)
 */
const getSavedResumesFull = (): SavedResume[] => {
  try {
    const savedData = localStorage.getItem(SAVED_RESUMES_KEY);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error('Error loading saved resumes:', error);
    return [];
  }
};