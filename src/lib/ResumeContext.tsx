import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormData, Section } from '../types';
import { loadFromStorage, saveToStorage, generateDefaultResumeName, updateOrCreateResumeCopy } from './StorageService';
import { TemplateFactory, TemplateInfo } from '@/lib/LaTeX/TemplateFactory';

interface ResumeContextType {
  formData: FormData;
  sections: Section[];
  selectedTemplate: TemplateInfo;
  resumeName: string;
  currentResumeId?: string;
  setFormData: (data: FormData) => void;
  setSections: (sections: Section[]) => void;
  setSelectedTemplate: (template: TemplateInfo) => void;
  setResumeName: (name: string) => void;
  setCurrentResumeId: (id: string | undefined) => void;
  handleChange: (section: string, field: string, value: string | string[]) => void;
  handleSectionSelected: (sectionId: string, checked: boolean) => void;
  handleSectionRemoved: (sectionId: string) => void;
  handleMoveTo: (oldIndex: number, newIndex: number) => void;
  addGenericSection: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  // Load data from localStorage or use initial data
  const { formData: savedFormData, sections: savedSections, templateId: savedTemplateId, resumeName: savedResumeName, currentResumeId: savedCurrentResumeId } = loadFromStorage();

  const [formData, setFormData] = useState<FormData>(savedFormData);
  const [sections, setSections] = useState<Section[]>(savedSections);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(
    TemplateFactory.getAvailableTemplates().find(t => t.id === savedTemplateId) || TemplateFactory.getAvailableTemplates()[0]
  );
  const [resumeName, setResumeName] = useState<string>(
    savedResumeName || generateDefaultResumeName(savedFormData)
  );
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>(
    savedCurrentResumeId || crypto.randomUUID()
  );

  useEffect(() => {
    persistChangesOnChange();

    function persistChangesOnChange() {
      const templateId: string = selectedTemplate.id;
      const dataToSave = { formData, sections, templateId, resumeName, currentResumeId };
      
      // Save to working storage
      saveToStorage(dataToSave);
      
      // Also save/update in saved copies if we have a currentResumeId
      if (currentResumeId) {
        updateOrCreateResumeCopy(currentResumeId, dataToSave, resumeName);
      }
    }
  }, [formData, sections, selectedTemplate, resumeName, currentResumeId]);

  const handleChange = (section: string, field: string, value: string | string[]): void => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section as keyof FormData],
        [field]: value
      }
    }));
  };

  const handleSectionSelected = (sectionId: string, checked: boolean): void => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, selected: checked } : section
      )
    );
  };

  const handleSectionRemoved = (sectionId: string): void => {
    setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
  };

  const handleMoveTo = (oldIndex: number, newIndex: number): void => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const [movedSection] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, movedSection);
      return newSections.map((section, index) => ({
        ...section,
        sortOrder: index
      }));
    });
  };

  const addGenericSection = () => {
    const newSectionId = `genericSection${Object.keys(formData.genericSections || {}).length}`;
    
    setFormData(prevData => ({
      ...prevData,
      genericSections: {
        ...(prevData.genericSections || {}),
        [newSectionId]: {
          title: 'New Section',
          items: []
        }
      }
    }));

    setSections(prevSections => [
      ...prevSections,
      {
        id: newSectionId,
        displayName: 'New Section',
        href: `#${newSectionId}`,
        selected: true,
        originalOrder: prevSections.length,
        sortOrder: prevSections.length,
        required: false,
        sortable: true,
        removeable: true,
      }
    ]);
  };

  return (
    <ResumeContext.Provider
      value={{
        formData,
        sections,
        selectedTemplate,
        resumeName,
        currentResumeId,
        setFormData,
        setSections,
        setSelectedTemplate,
        setResumeName,
        setCurrentResumeId,
        handleChange,
        handleSectionSelected,
        handleSectionRemoved,
        handleMoveTo,
        addGenericSection,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
} 