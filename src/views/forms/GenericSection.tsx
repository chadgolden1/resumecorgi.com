import React from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import type { FormData, GenericSection as GenericSectionType } from '../../types';
import Separator from '../../components/Separator';
import RichTextbox from '../../components/RichTextbox';
import { useResume } from '@/lib/ResumeContext';

interface GenericSectionProps {
  sectionId: string;
  onTitleChange?: (title: string) => void;
}

function GenericSection({ sectionId, onTitleChange }: GenericSectionProps) {
  const { formData, setFormData } = useResume();
  const section = formData.genericSections?.[sectionId] || { 
    title: '', 
    items: [] as { name: string; description: string; details: string; }[] 
  };

  const addItem = () => {
    setFormData({
      ...formData,
      genericSections: {
        ...(formData.genericSections || {}),
        [sectionId]: {
          ...section,
          items: [...section.items, { name: '', description: '', details: '' }]
        }
      }
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      genericSections: {
        ...(formData.genericSections || {}),
        [sectionId]: {
          ...section,
          items: section.items.filter((_, i) => i !== index)
        }
      }
    });
  };

  const updateSectionTitle = (title: string) => {
    setFormData({
      ...formData,
      genericSections: {
        ...(formData.genericSections || {}),
        [sectionId]: {
          ...section,
          title
        }
      }
    });
    
    // Notify parent component about the title change
    if (onTitleChange) {
      onTitleChange(title);
    }
  };

  const updateItem = (index: number, field: 'name' | 'description' | 'details', value: string) => {
    setFormData({
      ...formData,
      genericSections: {
        ...(formData.genericSections || {}),
        [sectionId]: {
          ...section,
          items: section.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
          )
        }
      }
    });
  };

  return (
    <>
      <div className="flex items-center -mt-1 mb-2">
        <h2 className="sr-only">{section.title || "Section Title" }</h2>
        <div>
          <label htmlFor={`${sectionId}-title`} className="sr-only text-sm text-gray-800 dark:text-zinc-200 mb-1">Section Title</label>
          <div className="relative inline-block w-full group mb-3">
            <input
              type="text"
              id={`${sectionId}-title`}
              name={`${sectionId}-title`}
              value={section.title}
              onChange={e => updateSectionTitle(e.target.value)}
              className="relative w-full p-2 text-black dark:text-white text-xl font-bold
                        bg-gray-50 dark:bg-zinc-800
                        border-1 border-gray-200 dark:border-zinc-700 rounded-lg
                        hover:border-purple-200 dark:hover:border-purple-600
                        hover:bg-purple-50 dark:hover:bg-purple-900
                        focus:outline-purple-600/75 focus:outline-3 focus:border-purple-600/75 focus:ring-purple-600/75 dark:focus:border-purple-600/75 dark:focus:border-transparent
                        focus:bg-purple-50 dark:focus:bg-purple-950"
              placeholder={"Section Title"}
            />
          </div>
        </div>
      </div>

      {section.items.map((item, index) => (
        <div key={index} className="mb-4">
          {index !== 0 && index !== section.items.length && (
            <Separator />
          )}
          
          <div className="flex items-center mb-2">
            <h3 className="text-medium font-bold mb-1.5 text-gray-900 dark:text-gray-200">
              {`Item #${index + 1}`}
            </h3>
            {index >= 0 && (
              <>
                <span className="ms-3"></span>
                <Button
                  text="Remove Item"
                  theme="danger"
                  onClick={() => removeItem(index)}
                  parentClassName="mb-1 ml-2"
                  className="text-sm"
                />
              </>
            )}
          </div>

          <Input 
            type="text" 
            label={`Name`} 
            formData={{ 
              id: `${sectionId}-name-${index}`, 
              name: `${sectionId}-name-${index}`, 
              value: item.name
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, 'name', e.target.value)} 
          />

          <Input 
            type="text" 
            label={`Description (Optional)`} 
            formData={{ 
              id: `${sectionId}-description-${index}`, 
              name: `${sectionId}-description-${index}`, 
              value: item.description
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, 'description', e.target.value)} 
          />
          
          <span className="block text-sm text-gray-800 dark:text-gray-300 mb-1">Details (optional)</span>
          <RichTextbox
            content={item.details}
            onInput={(e: React.FormEvent<HTMLElement>) => updateItem(index, 'details', e.currentTarget.innerHTML)}
          />
        </div>
      ))}

      <Button
        text={section.items.length > 0 ? `Add Another Item` : `Add Item`}
        theme="success"
        className="text-sm"
        onClick={addItem}
      />
    </>
  );
}

export default GenericSection;