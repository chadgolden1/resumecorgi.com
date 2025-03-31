import React from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FormData, Skill } from '../../types';
import Separator from '../../components/Separator';
import { useResume } from '@/lib/ResumeContext';

function Skills() {
  const { formData, setFormData } = useResume();
  const skills = formData.skills;
  
  const addSkillCategory = (): void => {
    const newSkillCategory: Skill = {
      category: "",
      skillList: ""
    };
    
    setFormData({
      ...formData,
      skills: [...skills, newSkillCategory]
    });
  };

  const removeSkillCategory = (index: number): void => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  const updateSkillCategory = (index: number, value: string): void => {
    const updatedSkills = [...skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      category: value
    };
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  const updateSkills = (categoryIndex: number, value: string): void => {
    const updatedSkills = [...skills];
    updatedSkills[categoryIndex] = {
      ...updatedSkills[categoryIndex],
      skillList: value
    };
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  return (
    <>
      <div className="flex items-center -mt-1 mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="skills">Skills</h2>
      </div>
      <p className="hidden text-slate-800 mb-4 dark:text-gray-200 mb-6 w-2/3">
        Add skills organized by category to highlight your expertise.
      </p>

      {skills.map((skillCategory, categoryIndex) => (
        <div key={categoryIndex} className="mb-4">
          {categoryIndex !== 0 && categoryIndex !== skills.length && (
            <Separator />
          )}
          
          <div className="flex items-center mb-2">
            <h3 className="text-medium font-bold mb-1.5 text-gray-900 dark:text-gray-200">
              {`Skill Category #${categoryIndex + 1}`}
            </h3>
            {categoryIndex >= 0 && (
              <>
                <span className="ms-3"></span>
                <Button
                  text="Remove Category"
                  theme="danger"
                  onClick={() => removeSkillCategory(categoryIndex)}
                  parentClassName="mb-1 ml-2"
                  className="text-sm"
                />
              </>
            )}
          </div>

          <Input 
            type="text" 
            label={`Category Name`} 
            formData={{ 
              id: `category${categoryIndex}`, 
              name: `category${categoryIndex}`, 
              value: skillCategory.category
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSkillCategory(categoryIndex, e.target.value)} 
          />
          
          <Input 
            type="text" 
            label={`Skills (comma-separated)`} 
            formData={{ 
              id: `skills${categoryIndex}`, 
              name: `skills${categoryIndex}`, 
              value: skillCategory.skillList
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSkills(categoryIndex, e.target.value)}
            placeholder="Example: JavaScript, React, Node.js" 
          />
        </div>
      ))}

      <Button
        text={skills.length > 0 ? `Add Another Skill Category` : `Add Skill Category`}
        theme="success"
        className="text-sm"
        onClick={addSkillCategory} 
      />
    </>
  );
}

export default Skills;