declare global {
  interface Window {
    PdfTeXEngine: new () => PdfTeXEngine;
    pdfjsLib: {
      version: string;
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

export interface PdfTeXEngine {
  writeMemFSFile(fileName: string, compiledLaTeX: string): void;
  setEngineMainFile(fileName: string): void;
  compileLaTeX(): Promise<any>;
  loadEngine: () => Promise<void>;
}

export interface PersonalInfo {
  name: string;
  contact0: string;
  contact1: string;
  contact2: string;
  contact3: string;
  contact4: string; // TODO, refactor into JSON resume well-knonw schema array format, etc.
  summary: string;
}

export interface Experience {
  title: string;
  company: string;
  start: string;
  end: string;
  accomplishments: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
  accomplishments: string;
}

export interface Skill {
  category: string;
  skillList: string;
}

export interface Project {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string;
  url: string;
}

export interface GenericSection {
  title: string;
  items: {
    name: string;
    description?: string;
    details?: string;
  }[];
}

export interface FormData {
  [key:string]: any;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  genericSections?: { [key: string]: GenericSection };
}

export interface Removable {
  removeable?: boolean;
}

export interface Sortable {
  id: string;
  sortable: boolean;
  sortOrder: number;
  originalOrder?: number;
}

export interface NavSection extends Sortable, Removable {
  id: string;
  displayName: string;
  href: string;
  selected: boolean;
  required: boolean;
}

export interface Section extends Sortable, NavSection {
  id: string;
  displayName: string;
  href: string;
  selected: boolean;
  originalOrder: number;
  sortOrder: number;
  required: boolean;
  sortable: boolean;
}