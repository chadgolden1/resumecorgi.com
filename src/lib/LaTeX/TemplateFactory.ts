import { FormData, Section } from "@/types";
import { TemplateAdapter } from "./TemplateAdapter";
import { EngineeringResume } from "./templates/EngineeringResume";
import { EngineeringResume2 } from "./templates/EngineeringResume2";
import { ClassicResume } from "./templates/ClassicResume";

export interface TemplateInfo {
  id: string;
  name: string;
  description?: string;
  imagePath?: string;
  credits?:string;
}

export class TemplateFactory {
  static createTemplate(templateType: string, formData: FormData, selectedSections: Section[]): TemplateAdapter {
    switch (templateType.toLowerCase()) {
      case 'engineering':
        return new EngineeringResume(formData, selectedSections);
      case 'engineering2':
        return new EngineeringResume2(formData, selectedSections);
      case 'classic':
        return new ClassicResume(formData, selectedSections);
      default:
        return new EngineeringResume(formData, selectedSections);
    }
  }

  static getAvailableTemplates(): TemplateInfo[] {
    return [
      {
        id: "engineering",
        name: "Engineering",
        description: "The original template used on Resume Corgi, adapted from the helpful community at r/EngineeringResumes."
      },
      {
        id: "engineering2",
        name: "Engineering #2",
        description: "A variant of the Engineering template with changes to font-sizing, spacing, and layout adapted from RenderCV's \"engineeringresumes\" theme."
      },
      {
        id: "classic",
        name: "RenderCV Classic",
        description: "A traditional, yet stylish professional resume template based on RenderCV's \"classic\" theme."
      }
    ]
  }
}