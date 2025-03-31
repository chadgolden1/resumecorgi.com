import React from 'react';
import Button from '../../components/Button.js'
import Input from '../../components/Input.js'
import RichTextbox from '../../components/RichTextbox.js';
import { FormData, Experience as ExperienceInfo } from '../../types';
import Separator from '../../components/Separator.js';
import { useResume } from '@/context/ResumeContext';

function Experience() {
  const { formData, setFormData } = useResume();
  const experiences = formData.experience;
  
  const addExperience = () => {
    const newExperience = {
      title: '',
      company: '',
      start: '',
      end: '',
      accomplishments: ''
    };

    setFormData({
      ...formData,
      experience: [...experiences, newExperience]
    });
  };

  const removeExperience = (index: number): void => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setFormData({
      ...formData,
      experience: updatedExperiences
    });
  };

  const updateExperience = (index: number, field: keyof ExperienceInfo, value: string): void => {
    const updatedExperience = { ...experiences[index], [field]: value };
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = updatedExperience;
    setFormData({
      ...formData,
      experience: updatedExperiences
    });
  };

  return (
    <>
      <div className="flex items-center -mt-1 mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="experience">Experience</h2>
      </div>
      <p className="hidden text-slate-800 mb-4 dark:text-gray-200 mb-6 w-2/3">
        Let's jot down where you went to work, starting with your most recent organization.
      </p>

      {experiences.map((experience, index) => (
        <div key={index} className="mb-3">
          {index !== 0 && index !== experiences.length && (
            <Separator />
          )}
          <h3 className="text-medium font-bold mb-1.5 text-gray-900 dark:text-gray-200">
            {index === 0 ? 'Most Recent Position' : `Position #${index + 1}`}
            {index >= 0 && (
              <>
                <span className="ms-3"></span>
                <Button
                  text="Remove"
                  theme="danger"
                  onClick={() => removeExperience(index)}
                  parentClassName="mb-1"
                  className="text-sm"
                />
              </>
            )}
          </h3>

          <Input 
            type="text" 
            label={`Position Title at Company #${index + 1}`} 
            formData={{ 
              id: `title${index}`, 
              name: `title${index}`, 
              value: experience.title
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(index, 'title', e.target.value)} 
          />

          <Input 
            type="text" 
            label={`Name of Company #${index + 1}`} 
            formData={{ 
              id: `company${index}`, 
              name: `company${index}`, 
              value: experience.company
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(index, 'company', e.target.value)} 
          />
          
          <Input 
            type="text" 
            label="Start Date (Examples: February 2022, Feb. 2022, or 2022)" 
            formData={{ 
              id: `start${index}`, 
              name: `start${index}`, 
              value: experience.start 
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(index, 'start', e.target.value)} 
          />
          
          <Input 
            type="text" 
            label="End Date (optional)" 
            formData={{ 
              id: `end${index}`, 
              name: `end${index}`, 
              value: experience.end
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExperience(index, 'end', e.target.value)} 
          />
          
          <span className="block text-sm text-gray-800 dark:text-gray-300 mb-1">
            Accomplishments at Company #{index + 1}
          </span>

          <RichTextbox
             content={experience.accomplishments}
             onInput={(e: React.FormEvent<HTMLElement>) => updateExperience(index, 'accomplishments', e.currentTarget.innerHTML)} />
        </div>
      ))}

      <Button
        text={experiences.length > 0 ? `Add Another Company` : `Add Company`}
        theme="success"
        className="text-sm"
        onClick={addExperience} />
    </>
  )
}

export default Experience