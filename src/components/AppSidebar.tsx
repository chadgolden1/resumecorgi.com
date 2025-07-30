import React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar"
import SortableNav from "./SortableNav";
import { DownloadCloud, ExternalLink, FileJson, FlaskConical, ListPlus, UploadCloud, ChevronDown } from "lucide-react";
import Corgi from "./Corgi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ResumeImporter } from "./ResumeImporter";
import { FormData } from "@/types";
import { TemplateSwitcher } from "./TemplateSwitcher";
import { useResume } from '@/lib/ResumeContext';
import ResumeManager from "./ResumeManager";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface SidebarProps {
  resetData?: () => void;
  sampleData?: () => void;
  onExport: () => void;
  onExportAll?: () => void;
  onImportJsonFormData: (formData: FormData) => void;
}

const corgiSize: number = 84;

function AppSidebar({
  resetData,
  sampleData,
  onExport,
  onExportAll,
  onImportJsonFormData,
}: SidebarProps) {
  const { addGenericSection } = useResume();

  const handleNewResume = () => {
    if (window.confirm('Creating a new resume will clear your current work. Continue?')) {
      resetData?.();
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
          <SidebarGroupLabel className="text-gray-700 dark:text-zinc-300">Resume</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <ResumeManager onNewResume={handleNewResume} />
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
              <SidebarMenuItem key={"menu-export"}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="hover:bg-gray-200 dark:hover:bg-zinc-950/70 cursor-pointer">
                      <DownloadCloud />
                      <span>Export</span>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuItem onClick={() => onExport()}>
                      <FileJson className="mr-2 h-4 w-4" />
                      Current Resume
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExportAll?.()}>
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      All Resumes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
