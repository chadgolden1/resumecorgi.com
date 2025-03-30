import { FormData, Section } from '../types';
import { initialFormData, initialSections, initialTemplateId } from './DataInitializer';

export const STORAGE_KEY = 'resume-builder-data';

interface StoredData {
  formData: FormData;
  sections: Section[];
  templateId?: string;
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
export const clearStorage = (targetFormData: FormData = initialFormData, targetSections: Section[] = initialSections, targetTemplateId: string = initialTemplateId): StoredData => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
  
  return {
    formData: targetFormData,
    sections: targetSections,
    templateId: targetTemplateId
  };
};