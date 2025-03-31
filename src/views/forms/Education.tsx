import React from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import RichTextbox from '../../components/RichTextbox';
import { FormData, Education as EducationInfo } from '../../types';
import Separator from '../../components/Separator';
import { useResume } from '@/context/ResumeContext';

function Education() {
  const { formData, setFormData } = useResume();
  const education = formData.education;
  
  const addEducation = (): void => {
    const newEducation: EducationInfo = {
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: '',
      accomplishments: ''
    };
    
    setFormData({
      ...formData,
      education: [...education, newEducation]
    });
  };

  const removeEducation = (index: number): void => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const updateEducation = (index: number, field: keyof EducationInfo, value: string): void => {
    const updatedEducation = { ...education[index], [field]: value };
    const updatedEducations = [...education];
    updatedEducations[index] = updatedEducation;
    setFormData({
      ...formData,
      education: updatedEducations
    });
  };

  return (
    <>
      <div className="flex items-center -mt-1 mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="education">Education</h2>
      </div>
      <p className="hidden text-slate-800 mb-4 dark:text-gray-200 mb-6 w-2/3">
        Let's add your educational background, starting with your most recent degree.
      </p>

      {education.map((edu, index) => (
        <div key={index} className="mb-3">
          {index !== 0 && index !== education.length && (
            <Separator />
          )}
          <h3 className="text-medium font-bold mb-1.5 text-gray-900 dark:text-gray-200">
            {index === 0 ? 'Most Recent Education' : `Education #${index + 1}`}
            {index >= 0 && (
              <>
                <span className="ms-3"></span>
                <Button
                  text="Remove"
                  onClick={() => removeEducation(index)}
                  parentClassName="mb-1"
                  className="text-sm"
                  theme="danger"
                />
              </>
            )}
          </h3>

          <Input 
            type="text" 
            label={`Degree/Certificate #${index + 1}`} 
            formData={{ 
              id: `degree${index}`, 
              name: `degree${index}`, 
              value: edu.degree
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'degree', e.target.value)} 
          />

          <Input 
            type="text" 
            label={`Institution #${index + 1}`} 
            formData={{ 
              id: `institution${index}`, 
              name: `institution${index}`, 
              value: edu.institution
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'institution', e.target.value)} 
          />

          <Input 
            type="text" 
            label={`Location #${index + 1} (optional)`} 
            formData={{ 
              id: `institutionLocation${index}`, 
              name: `institutionLocation${index}`, 
              value: edu.location
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'location', e.target.value)} 
          />
          
          <Input 
            type="text" 
            label="Graduation Year/Month (optional)" 
            formData={{ 
              id: `graduationDate${index}`, 
              name: `graduationDate${index}`, 
              value: edu.graduationDate 
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'graduationDate', e.target.value)} 
          />
          
          <Input 
            type="text" 
            label="GPA (optional)" 
            formData={{ 
              id: `gpa${index}`, 
              name: `gpa${index}`, 
              value: edu.gpa
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEducation(index, 'gpa', e.target.value)} 
          />
          
          <span className="block text-sm text-gray-800 dark:text-gray-300 mb-1">
            Accomplishments at Institution #{index + 1} (optional)
          </span>

          <RichTextbox
             content={edu.accomplishments || ''}
             onInput={(e: React.FormEvent<HTMLElement>) => updateEducation(index, 'accomplishments', e.currentTarget.innerHTML)} />
        </div>
      ))}

      <Button
        text={education.length > 0 ? `Add Another Education` : `Add Education`}
        theme="success"
        className="text-sm"
        onClick={addEducation} />
    </>
  );
}

export default Education;