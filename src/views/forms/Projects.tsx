import React from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Separator from "@/components/Separator";
import { Project, FormData } from "@/types";
import RichTextbox from "@/components/RichTextbox";
import { useResume } from '@/lib/ResumeContext';

function Projects() {
  const { formData, setFormData } = useResume();
  const projects = formData.projects;

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...projects, { name: '', description: '', startDate: '', endDate: '', highlights: '', url: '' }]
    });
  };

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: projects.filter((_, i) => i !== index)
    });
  };

  const updateProject = (index: number, field: keyof Project, value: string): void => {
    const updatedProject = { ...projects[index], [field]: value };
    const updatedProjects = [...projects];
    updatedProjects[index] = updatedProject;
    setFormData({
      ...formData,
      projects: updatedProjects
    });
  };

  return (
    <>
      <div className="flex items-center -mt-1 mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="projects">Projects</h2>
      </div>
      <p className="hidden text-slate-800 mb-4 dark:text-gray-200 mb-6 w-2/3">
        Let's jot down where you went to work, starting with your most recent organization.
      </p>

      {projects.map((project, index) => (
        <div key={index} className="mb-3">
          {index !== 0 && index !== projects.length && (
            <Separator />
          )}
          <h3 className="text-medium font-bold mb-1.5 text-gray-900 dark:text-gray-200">
            {`Project #${index + 1}`}
            {index >= 0 && (
              <>
                <span className="ms-3"></span>
                <Button
                  text="Remove Project"
                  theme="danger"
                  onClick={() => removeProject(index)}
                  parentClassName="mb-1"
                  className="text-sm"
                />
              </>
            )}
          </h3>

          <Input 
            type="text" 
            label={`Project #${index + 1} Name`} 
            formData={{ 
              id: `name${index}`, 
              name: `name${index}`, 
              value: project.name
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(index, 'name', e.target.value)} 
          />

          <Input 
            type="text" 
            label={`Project #${index + 1} Description (optional)`} 
            formData={{ 
              id: `description${index}`, 
              name: `description${index}`, 
              value: project.description
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(index, 'description', e.target.value)} 
          />
          
          <Input 
            type="text" 
            label="Start Date (optional, examples: February 2022, Feb. 2022, or 2022)" 
            formData={{ 
              id: `startDate${index}`, 
              name: `startDate${index}`, 
              value: project.startDate 
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(index, 'startDate', e.target.value)} 
          />
          
          <Input 
            type="text" 
            label="End Date (optional)" 
            formData={{ 
              id: `endDate${index}`, 
              name: `endDate${index}`, 
              value: project.endDate
            }} 
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProject(index, 'endDate', e.target.value)} 
          />
          
          <span className="block text-sm text-gray-800 dark:text-gray-300 mb-1">
            Highlights at Project #{index + 1}
          </span>

          <RichTextbox
             content={project.highlights}
             onInput={(e: React.FormEvent<HTMLElement>) => updateProject(index, 'highlights', e.currentTarget.innerHTML)} />
        </div>
      ))}

      <Button
        text={projects.length > 0 ? `Add Another Project` : `Add Project`}
        theme="success"
        className="text-sm"
        onClick={addProject} />
    </>
  );
}

export default Projects;