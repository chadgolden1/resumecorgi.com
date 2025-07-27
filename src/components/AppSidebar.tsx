import React, { useState, useRef, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar"
import SortableNav from "./SortableNav";
import { DownloadCloud, EraserIcon, ExternalLink, FileJson, FlaskConical, ListPlus, UploadCloud, Edit2, Check, X, MoreVertical, Copy, FileText, Trash2, SaveAllIcon, FolderOpen, Sheet, File } from "lucide-react";
import Corgi from "./Corgi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ResumeImporter } from "./ResumeImporter";
import { FormData } from "@/types";
import { TemplateSwitcher } from "./TemplateSwitcher";
import { useResume } from '@/lib/ResumeContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { getSavedResumes, saveResumeCopy, loadResumeCopy, deleteResumeCopy } from '@/lib/StorageService';
import { createSectionsFromFormData } from '@/lib/DataInitializer';

interface SidebarProps {
  resetData?: () => void;
  sampleData?: () => void;
  onExport: () => void;
  onImportJsonFormData: (formData: FormData) => void;
}

const clearForm = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, resetData?: () => void) => {
  e.preventDefault();
  resetData?.();
}

const exportJson = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, onExport: () => void) => {
  e.preventDefault();
  onExport();
}

const corgiSize: number = 84;

function AppSidebar({
  resetData,
  sampleData,
  onExport,
  onImportJsonFormData,
}: SidebarProps) {
  const { formData, sections, addGenericSection, resumeName, setResumeName, setFormData, setSections, selectedTemplate } = useResume();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(resumeName);
  const [savedResumes, setSavedResumes] = useState(getSavedResumes());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempName(resumeName);
  }, [resumeName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleStartEdit = () => {
    setTempName(resumeName);
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== resumeName) {
      setResumeName(trimmedName);
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(resumeName);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleSaveAsCopy = () => {
    const newName = prompt('Enter name for the resume copy:', `${resumeName}-copy`);
    if (newName && newName.trim()) {
      const resumeId = saveResumeCopy({ formData, sections, templateId: selectedTemplate.id }, newName.trim());
      if (resumeId) {
        setSavedResumes(getSavedResumes());
        alert('Resume copy saved successfully!');
      }
    }
  };

  const handleLoadResume = (resumeId: string) => {
    if (window.confirm('Loading this resume will replace your current work. Continue?')) {
      const resumeData = loadResumeCopy(resumeId);
      if (resumeData) {
        setFormData(resumeData.formData);
        setSections(resumeData.sections);
        // Update the name from the saved copy
        const savedCopy = savedResumes.find(r => r.id === resumeId);
        if (savedCopy) {
          setResumeName(savedCopy.name);
        }
      }
    }
  };

  const handleDeleteResume = (resumeId: string, resumeName: string) => {
    if (window.confirm(`Are you sure you want to delete "${resumeName}"?`)) {
      if (deleteResumeCopy(resumeId)) {
        setSavedResumes(getSavedResumes());
      }
    }
  };

  return (
    <Sidebar
      className="
        border-r-0 border-t-0 border-gray-300/75 dark:border-zinc-900 bg-gray-100 dark:bg-zinc-800/60
      ">
      <SidebarContent
        className="
          transition-colors
          mt-0 lg:mt-[75px] bg-gray-100/10 dark:bg-zinc-800/60
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-zinc-300
          [&::-webkit-scrollbar-thumb]:bg-zinc-400
          dark:[&::-webkit-scrollbar-track]:bg-zinc-800
          dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700
        ">

        <SidebarGroup>
          <SidebarGroupContent>
            <TemplateSwitcher />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 dark:text-zinc-300">Resume Name</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            {isEditingName ? (
              <div className="flex items-center space-x-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Resume name"
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  title="Save name"
                >
                  <Check className="size-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Cancel edit"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 group">
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  {resumeName}
                </span>
                <button
                  onClick={handleStartEdit}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit resume name"
                >
                  <Edit2 className="size-3" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Resume options"
                    >
                      <MoreVertical className="size-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>My Resumes</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <File className="mr-0.5 h-4 w-4" />
                      New
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FolderOpen className="mr-0.5 h-4 w-4" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveAsCopy}>
                      <SaveAllIcon className="mr-0.5 h-4 w-4" />
                      Save As Copy
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-sm">Recent Resumes</DropdownMenuLabel>
                    {savedResumes.length > 0 ? (
                      <>
                        {savedResumes.map((resume) => (
                          <div key={resume.id} className="group/item">
                            <DropdownMenuItem
                              onClick={() => handleLoadResume(resume.id)}
                              className="pr-8"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <div className="flex-1 overflow-hidden">
                                <div className="truncate text-sm">{resume.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(resume.lastUpdated).toLocaleDateString()}
                                </div>
                              </div>
                            </DropdownMenuItem>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResume(resume.id, resume.name);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete resume"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <DropdownMenuItem disabled>
                        <span className="text-muted-foreground">No recent resumes</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="block lg:hidden py-0">
          <SidebarGroupContent>
            <SidebarTrigger className="
              hover:cursor-pointer dark:text-zinc-200 rounded-full
              dark:hover:bg-zinc-800 dark:hover:text-zinc-200" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 dark:text-zinc-300">Sections</SidebarGroupLabel>
          <SidebarGroupContent
            className="
              overflow-hidden
            ">
            <div className="px-2">
              <SortableNav />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 dark:text-zinc-300">Customization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem key={"new-custom-section"}>
                  <SidebarMenuButton asChild className="py-0 hover:bg-gray-200 dark:hover:bg-zinc-950/70">
                    <a href={`#`}
                      onClick={(e) => { e.preventDefault(); addGenericSection?.() }}>
                      <ListPlus />
                      <span>New Section</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key={"menu-export-resume"}>
                <SidebarMenuButton asChild className="hover:bg-gray-200 dark:hover:bg-zinc-950/70">
                  <a href={"#"} onClick={(e) => exportJson(e, onExport)}>
                    <DownloadCloud />
                    <span>Export</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key={"menu-import-resume"}>
                <Dialog>
                  <DialogTrigger asChild>
                    <SidebarMenuButton asChild className="hover:bg-gray-200 dark:hover:bg-zinc-950/70">
                      <a href={"#"}>
                        <UploadCloud />
                        <span>Import</span>
                      </a>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        <FileJson className="pb-1 inline me-1 size-6" strokeWidth={1.334} />
                        Import Resume
                      </DialogTitle>
                      <DialogDescription>
                        Import a file containing your resume content using the JSON Resume format.
                        See
                        <a href="https://jsonresume.org/schema" target="_blank" className="ms-1.5 me-0.5 text-purple-800 dark:text-purple-400 font-bold hover:underline">
                          JSON Resume <ExternalLink className="inline size-4 pb-1" />
                        </a> 
                        for more details.
                      </DialogDescription>
                    </DialogHeader>
                    <ResumeImporter onComplete={onImportJsonFormData} />
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
              <SidebarMenuItem key={"menu-clear-resume"}>
                <SidebarMenuButton asChild className="hover:bg-gray-200 dark:hover:bg-zinc-950/70">
                  <a href={"#"} onClick={(e) => clearForm(e, resetData)}>
                    <EraserIcon />
                    <span>Clear Form</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key={"menu-sample-resume"}>
                <SidebarMenuButton asChild className="hover:bg-gray-200 dark:hover:bg-zinc-950/70">
                  <a href={"#"} onClick={(e) => { e.preventDefault(); sampleData?.() }}>
                    <FlaskConical />
                    <span>Load Sample</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent className="text-center">
            <div className="px-5 pt-3 pb-1">
              <div className="hidden lg:block"><Corgi size={corgiSize} /></div>
              <div className="block lg:hidden"><Corgi size={Math.round(corgiSize * 0.777)} /></div>
            </div>

            <div className="px-5 mt-1 lg:mt-2 mb-2 lg:mb-3">
              <span className="text-xs text-gray-800 dark:text-gray-300">You've got this!</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-center bg-gray-100/10 dark:bg-zinc-800/60">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Copyright &copy; 2025 Chad Golden
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar;
