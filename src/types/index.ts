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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compileLaTeX(): Promise<any>;
  compileFormat(): Promise<any>;
  loadEngine: () => Promise<void>;
  setTexliveEndpoint(url: string): void;
}

export interface PersonalInfo {
  name: string;
  contacts: string[];
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

export interface Reference {
  name: string;
  title: string;
  company: string;
  contactEmail: string;
  contactPhone: string;
}

export interface GenericSection {
  title: string;
  items: {
    name: string;
    description: string;
    details: string;
  }[];
}

export interface FormData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key:string]: any;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  references: Reference[];
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