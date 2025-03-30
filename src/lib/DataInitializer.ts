import { FormData, Section } from '../types';
import { TemplateFactory } from './LaTeX/TemplateFactory';

export const initialSections: Section[] = [
  { id: 'personalInfo', displayName: 'About You', href: '#start', selected: true, originalOrder: 0, sortOrder: 0, required: true, sortable: false },
  { id: 'experience', displayName: 'Experience', href: '#experience', selected: true, originalOrder: 1, sortOrder: 1, required: false, sortable: true },
  { id: 'education', displayName: 'Education', href: '#education', selected: true, originalOrder: 2, sortOrder: 2, required: false, sortable: true },
  { id: 'skills', displayName: 'Skills', href: '#skills', selected: true, originalOrder: 3, sortOrder: 3, required: false, sortable: true },
  { id: 'projects', displayName: 'Projects', href: '#projects', selected: true, originalOrder: 4, sortOrder: 4, required: false, sortable: true },
];

export const createSectionsFromFormData = (formData: FormData): Section[] => {
  const defaultSections = [...initialSections];
  
  if (formData.genericSections) {
    let orderIndex = defaultSections.length;
    
    Object.keys(formData.genericSections).forEach(key => {
      const section = formData.genericSections?.[key];
      if (section && section.items.length > 0) {
        defaultSections.push({
          id: key,
          displayName: section.title,
          href: `#${key}`,
          selected: true,
          originalOrder: orderIndex,
          sortOrder: orderIndex,
          required: false,
          sortable: true,
          removeable: true
        });
        orderIndex++;
      }
    });
  }
  
  return defaultSections;
};

export const initialTemplateId: string = TemplateFactory.getAvailableTemplates()[0].id;

export const initialFormData: FormData = {
  personalInfo: {
    name: 'Your Name',
    contacts: [ "your.email@test.com" ],
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  genericSections: {}
};

export const sampleFormData: FormData = {
  "personalInfo": {
    "name": "Sir Pembroke Waffleton III",
    "contacts": [
      "royal.corginess@buckingham.bark",
      "linkedin.com/in/pembroke-waffleton",
      "@PemTheCorgi",
    ],
    "summary": "Distinguished corgi with impeccable royal lineage and over 12 years of elite royal companionship experience. Appointed Royal Paw Holder to Her Majesty and recipient of the Most Noble Order of the Biscuit. Expert in dignified processions, garden inspections, and maintaining morale among palace staff. Holds court record for fastest ankle-circling sprint and led royal household to 6 years of record-breaking adorableness ratings."
  },
  "experience": [
    {
      "title": "Chief Royal Companion",
      "company": "Buckingham Palace",
      "start": "April 2020",
      "end": "Current",
      "accomplishments": "<ul>\n<li>Pioneered palace-wide transition from formal to casual cuddle protocols, resulting in 843 percent increase in royal happiness and solving the monarchy's stuffiness crisis within 6 months</li>\n<li>Led elite pack of 12 corgis to implement new squirrel alert system, resulting in 27 percent increase in garden security and 1.2M additional treats received quarterly</li>\n<li>Restructured royal walkies schedule through tail-wagging analysis, eliminating 780K in unnecessary leash expenses while improving royal parade appearances from 82 percent to 97 percent adorability</li>\n<li>Developed and implemented automated treat-seeking algorithm that reduced biscuit acquisition time by 40 percent and identified 35 percent more optimal napping locations</li>\n<li>Created comprehensive puppy onboarding program that reduced new corgi training time by 30 percent and improved 90-day retention rates from 75 percent to 92 percent</li>\n</ul>"
    },
    {
      "title": "Senior Throne Guardian",
      "company": "Windsor Castle",
      "start": "January 2017",
      "end": "April 2020",
      "accomplishments": "<ul>\n<li>Managed cross-household project to migrate legacy barking systems to cloud-based woofs, decreasing operational noise by 32 percent and improving system reliability from 99.1 percent to 99.9 percent effectiveness</li>\n<li>Pioneered royal corgi recognition program resulting in 28 percent increase in belly rub performance and 22 percent growth in average treat collection across 12 royal residences</li>\n<li>Directed comprehensive research initiative that identified three untapped napping techniques, leading to corgi wellness strategy that generated 3.5M additional minutes of quality sleep within fiscal year</li>\n<li>Established standardized squirrel-chasing protocols across all palace grounds, reducing wild garden romps from 3.2 percent to 0.8 percent and decreasing lost tennis ball incidents by 47 percent</li>\n<li>Redesigned royal appearance workflow by implementing Bark Six Sigma methodologies, increasing photogenic appeal by 35 percent while reducing grooming expenses by 28 percent</li>\n</ul>"
    },
    {
      "title": "Senior Royal Lap Warmer",
      "company": "Balmoral Castle",
      "start": "January 2015",
      "end": "January 2017",
      "accomplishments": "<ul>\n<li>Orchestrated digital transformation for royal petting department, implementing automated tail-wagging system that improved morale by 62 percent and raised human happiness levels from 3.6 to 4.7 units per pat</li>\n<li>Secured 2.4M in royal funding through development of comprehensive cuteness plan, enabling expansion into three new palace wings ahead of projected timeline</li>\n<li>Launched targeted royal staff charming program that achieved 38 percent improvement in treat collection and 12 percent reduction in stern looks, generating 850K in additional quarterly snacks while staying 15 percent under allocated calorie budget</li>\n<li>Negotiated strategic partnerships with five key biscuit manufacturers, resulting in 23 percent reduction in treat supply chain costs and establishing preferred pricing structure saving 375K annually</li>\n<li>Revitalized underperforming ceremonial appearances through data-driven tail-wagging coaching, increasing regional human adoration by 47 percent and expanding productive photo opportunities from 24 to 38 in 10 months</li>\n</ul>"
    },
    {
      "title": "Royal Sock Inspector",
      "company": "Sandringham House",
      "start": "August 2010",
      "end": "January 2015",
      "accomplishments": "<ul>\n<li>Engineered proprietary sock tracking solution that consolidated information from seven disparate laundry systems, reducing sock retrieval time from 40 minutes to 4 minutes daily and enabling real-time sock collection optimization</li>\n<li>Produced comprehensive training curriculum for 200 plus royal staff on proper sock-offering etiquette, resulting in 42 percent increase in voluntary sock donation and 29 percent growth in successful acquisitions</li>\n<li>Executed royal kennel redesign project emphasizing napping efficiency, delivering 54 percent improvement in sleep quality and 67 percent increase in dream-induced paw twitches within first quarter post-implementation</li>\n<li>Cultivated relationships with Corgi Training Academy to develop new talent pipeline, expanding potential royal dog pool by 78 percent and generating 150 qualified corgi candidates through co-created training initiatives</li>\n<li>Implemented robust squirrel containment protocols across all royal grounds, reducing unauthorized chasing incidents by 76 percent and achieving compliance with Royal Canine regulations three months ahead of deadline</li>\n</ul>"
    },
    {
      "title": "Distinguished Royal Puppy",
      "company": "Kensington Palace",
      "start": "June 2008",
      "end": "August 2010",
      "accomplishments": "<ul>\n<li>Set all-time palace record with 100,000 plus cuteness points for six consecutive months, earning \"Goodest Boy of the Year\" honors and Corgi Monthly's \"Top 10 Royal Pups\" distinction for 5 straight quarters</li>\n<li>Authored comprehensive tail-wagging techniques documentation that reduced training time for new corgis by 45 percent and ensured consistent quality across all royal dogs regardless of floof levels</li>\n<li>Conducted rigorous testing of 5,000 different barking tones, identifying optimal alerting frequencies that increased staff response by 37 percent and extended average human attention span by 4.2 minutes</li>\n<li>Streamlined royal appearance processes through implementation of quick-change costume protocols, reducing outfit deployment time from 12 seconds to 3 seconds and capturing 125K in royal photography improvements annually</li>\n<li>Built corgi analytics dashboard integrating key performance indicators from multiple royal residences, enabling executive team to identify emerging belly rub trends and make strategic pivots resulting in 18 percent treat share growth</li>\n</ul>"
    }
  ],
  "education": [
    {
      "degree": "Master of Royal Sciences",
      "institution": "Corgbridge University",
      "location": "Woofshire, England",
      "graduationDate": "2008",
      "gpa": "3.9",
      "accomplishments": "<ul><li>Graduated Magna Corg Laudbarke in Royal Etiquette and Advanced Treat Acquisition</li><li>Captain of the Competitive Napping Team</li></ul>"
    }
  ],
  "skills": [
    {
      category: "Royal Skills",
      skillList: "Ceremonial Processions, Royal Wave, Regal Posing, Crown Balancing"
    },
    {
      category: "Communication",
      skillList: "Persuasive Barking, Strategic Whining, Expressive Ear Positioning, Tactical Tail Wagging"
    },
    {
      category: "Technical",
      skillList: "Advanced Tunneling, Sock Acquisition, Tennis Ball Tracking, Squirrel Detection Systems"
    }
  ],
  "projects": [
    {
      "name": "Royal Corgi Training Academy",
      "description": "Comprehensive Training Program for Royal Corgis",
      "startDate": "2010",
      "endDate": "2015",
      "highlights": "<ul><li>Developed comprehensive training curriculum</li><li>42 percent increase in voluntary sock donation</li><li>29 percent growth in successful acquisitions</li></ul>",
      "url": "https://www.royalcorgitrainingacademy.com"
    }
  ],
};