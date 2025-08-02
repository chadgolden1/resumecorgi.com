import { JSX, useState, useRef, useMemo } from 'react';
import Preview from './Preview';
import PersonalInfo from './forms/PersonalInfo';
import Experience from './forms/Experience';
import Education from './forms/Education';
import Card from '../components/Card';
import Skills from './forms/Skills';
import Button from '../components/Button';
import ScrollSpy from '../components/ScrollSpy';
import { FormData } from '../types';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import { createSectionsFromFormData, initialFormData, sampleFormData } from '@/lib/DataInitializer';
import { generateDefaultResumeName } from '@/lib/StorageService';
import Projects from './forms/Projects';
import GenericSection from './forms/GenericSection';
import { downloadResumeAsJson, downloadAllResumesAsJson } from '@/lib/ImportExportService';
import { useResume } from '@/lib/ResumeContext';
import Reference from './forms/Reference';

interface SectionRenderItem {
  id: string;
  title: string;
  renderFunc: () => JSX.Element;
}

function Editor() {
  const [currentMobileView, setCurrentMobileView] = useState<string>('form');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const formContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    formData,
    sections,
    setFormData,
    setSections,
    setCurrentResumeId,
    setResumeName,
  } = useResume();

  const sectionRenderMapping = useMemo<SectionRenderItem[]>(() => [
    {
      id: 'personalInfo',
      title: 'About You',
      renderFunc: () =>
        <>
          <Card>
            <PersonalInfo />
            <div className="-mb-1.5"></div>
          </Card>
        </>
    },
    {
      id: 'experience',
      title: 'Experience',
      renderFunc: () =>
        <>
          <Card>
            <Experience />
          </Card>
        </>
    },
    {
      id: 'education',
      title: 'Education',
      renderFunc: () =>
        <>
          <Card>
            <Education />
          </Card>
        </>
    },
    {
      id: 'skills',
      title: 'Skills',
      renderFunc: () =>
        <>
          <Card>
            <Skills />
          </Card>
        </>
    },
    {
      id: 'projects',
      title: 'Projects',
      renderFunc: () =>
        <>
          <Card>
            <Projects />
          </Card>
        </>
    },
    {
      id: 'references',
      title: 'References',
      renderFunc: () =>
        <>
          <Card>
            <Reference />
          </Card>
        </>
    },
    // Add generic sections
    ...(Object.entries(formData.genericSections || {}).map(([sectionId, section]) => ({
      id: sectionId,
      title: section.title,
      renderFunc: () =>
        <>
          <Card>
            <GenericSection
              sectionId={sectionId}
              onTitleChange={(title) => {
                // When a generic section title changes, update the corresponding section's displayName
                const updatedSections = sections.map(section => 
                  section.id === sectionId ? { ...section, displayName: title } : section
                );
                setSections(updatedSections);
              }}
            />
          </Card>
        </>
    })))
  ], [formData, sections, setSections]);

  const resetToDefaults = () => {
    if (!window.confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
      return;
    }

    const newResumeId = crypto.randomUUID();
    const newResumeName = generateDefaultResumeName(initialFormData);
    
    setFormData(initialFormData);
    setSections(createSectionsFromFormData(initialFormData));
    setCurrentResumeId(newResumeId);
    setResumeName(newResumeName);
  };

  const resetToSampleData = () => {
    if (!window.confirm('Loading sample data will overwrite any edits you have made. This cannot be undone. Would you like to proceed?')) {
      return;
    }
    setFormData(sampleFormData);
    setSections(createSectionsFromFormData(sampleFormData));
  };

  const loadImportedJsonResume = (importedFormData: FormData) => {
    // Create a new resume with the imported data
    const newResumeId = crypto.randomUUID();
    const newResumeName = generateDefaultResumeName(importedFormData);
    
    // Set all the state to switch to this new resume
    setFormData(importedFormData);
    setSections(createSectionsFromFormData(importedFormData));
    setCurrentResumeId(newResumeId);
    setResumeName(newResumeName);
  };

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <SidebarProvider>
        <Navbar menuButton={
          <SidebarTrigger className="
            hover:cursor-pointer dark:text-zinc-200 rounded-full
            dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />
        } />
        <AppSidebar 
          resetData={() => resetToDefaults() }
          sampleData={() => resetToSampleData() }
          onExport={() => downloadResumeAsJson(formData) }
          onExportAll={() => downloadAllResumesAsJson() }
          onImportJsonFormData={formData => loadImportedJsonResume(formData) }
        />
        <div className="grid lg:grid-cols-12 grid-cols-12 gap-0 w-full h-screen">
          <div
            ref={formContainerRef}
            className={`
            ${currentMobileView !== 'form' ? "hidden" : ""} lg:block
            transition-colors
            bg-gray-50 dark:bg-zinc-800
            col-span-12 lg:col-span-5
            border-0 lg:border-zinc-500 dark:border-zinc-700
            overflow-y-auto mt-[74px] lg:mt-[74px]
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-zinc-300
            [&::-webkit-scrollbar-thumb]:bg-zinc-400
            dark:[&::-webkit-scrollbar-track]:bg-zinc-950/25
            dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500/70`}>
            <div className="w-full mb-[75vh]" id="start">
              <ScrollSpy
                containerRef={formContainerRef}
                sectionRefs={sectionRefs}
              />

              <div className="mt-3 px-4">
                {sortedSections
                  .filter(section => section.selected)
                  .map(section => (
                    <div
                      key={section.id}
                      ref={(el: HTMLDivElement | null) => { sectionRefs.current[section.id] = el; }}
                      id={`section-${section.id}`}
                    >
                      {sectionRenderMapping.find(srm => srm.id === section.id)?.renderFunc()}
                    </div>
                  ))}
              </div>

            </div>
          </div>

          <div className={`
            ${currentMobileView !== 'preview' ? "hidden lg:block" : ""}
            transition-colors
            lg:col-span-7 col-span-12
            overflow-x-none overflow-y-scroll mt-[74px] lg:mt-[74px]
            pt-0 pb-3
            bg-zinc-600 dark:bg-zinc-700/75
            border-l-0 lg:border-l-0 border-zinc-950/25
            dark:text-white
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-zinc-300
            [&::-webkit-scrollbar-thumb]:bg-zinc-400
            dark:[&::-webkit-scrollbar-track]:bg-zinc-950/25
            dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500/70`}>
            <Preview />
          </div>
        </div>
        <div className={`
          fixed
          bg-white dark:bg-zinc-800
          bottom-0 left-0 right-0 
          lg:hidden
          px-4 pt-1.5 pb-2
          flex justify-between space-1
          border-t-1 border-gray-900 dark:border-zinc-700`}>
          <div className="flex-1 pe-2">
            <Button
              theme={currentMobileView === 'form' ? 'primary' : 'default'}
              text="Form"
              className="w-full"
              parentClassName="w-full"
              onClick={() => setCurrentMobileView('form')} />
          </div>
          <div className="flex-1">
            <Button
              theme={currentMobileView === 'preview' ? 'primary' : 'default'}
              text="Preview"
              className="w-full"
              parentClassName="w-full"
              onClick={() => setCurrentMobileView('preview')} />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}

export default Editor;