import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormData, Section } from '../types';
import { loadFromStorage, saveToStorage } from '../lib/StorageService';
import { TemplateFactory, TemplateInfo } from '@/lib/LaTeX/TemplateFactory';

interface ResumeContextType {
  formData: FormData;
  sections: Section[];
  selectedTemplate: TemplateInfo;
  setFormData: (data: FormData) => void;
  setSections: (sections: Section[]) => void;
  setSelectedTemplate: (template: TemplateInfo) => void;
  handleChange: (section: string, field: string, value: string | string[]) => void;
  handleSectionSelected: (sectionId: string, checked: boolean) => void;
  handleSectionRemoved: (sectionId: string) => void;
  handleMoveTo: (oldIndex: number, newIndex: number) => void;
  addGenericSection: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  // Load data from localStorage or use initial data
  const { formData: savedFormData, sections: savedSections, templateId: savedTemplateId } = loadFromStorage();

  const [formData, setFormData] = useState<FormData>(savedFormData);
  const [sections, setSections] = useState<Section[]>(savedSections);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(
    TemplateFactory.getAvailableTemplates().find(t => t.id === savedTemplateId) || TemplateFactory.getAvailableTemplates()[0]
  );

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const templateId: string = selectedTemplate.id;
    saveToStorage({ formData, sections, templateId });
  }, [formData, sections, selectedTemplate]);

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
        setFormData,
        setSections,
        setSelectedTemplate,
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