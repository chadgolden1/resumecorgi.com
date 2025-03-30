import { PersonalInfo } from "@/types";

export interface TemplateConfig {
  preamble: string;
  documentHeader: (personalInfo: PersonalInfo) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatSection: (sectionId: string, data: any, options?: any) => string;
  documentFooter: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionFormatter = (data: any, options?: any) => string;