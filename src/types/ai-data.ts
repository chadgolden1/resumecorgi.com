/**
 * AI-friendly data formats that use arrays instead of HTML
 */

export interface AIPersonalInfo {
  name: string;
  contacts: string[];
  summary: string;
}

export interface AIExperience {
  title: string;
  company: string;
  start: string;
  end: string;
  accomplishments: string[]; // Array instead of HTML
}

export interface AIEducation {
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
  accomplishments: string[]; // Array instead of HTML
}

export interface AISkill {
  category: string;
  skills: string[]; // Array instead of comma-separated string
}

export interface AIProject {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[]; // Array instead of HTML
  url: string;
}

export interface AIFormData {
  personalInfo: AIPersonalInfo;
  experience: AIExperience[];
  education: AIEducation[];
  skills: AISkill[];
  projects: AIProject[];
  // References and generic sections can be added as needed
}