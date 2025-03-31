import { Check, ChevronsUpDown, Info, Palette } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TemplateFactory } from "@/lib/LaTeX/TemplateFactory"
import { useResume } from '@/context/ResumeContext';

const templates = TemplateFactory.getAvailableTemplates();

export function TemplateSwitcher() {
  const { selectedTemplate, setSelectedTemplate } = useResume();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-purple-700 text-sidebar-primary-foreground">
                <Palette className="size-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-md">Theme</span>
                <span className="text-xs">{selectedTemplate.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="/w-[--radix-dropdown-menu-trigger-width] w-80 p-1"
            align="start"
          >
            {templates.map((template) => (
              <DropdownMenuItem
                className="flex flex-col items-start rounded-md p-2.5 hover:cursor-pointer"
                key={template.id}
                onSelect={() => setSelectedTemplate(template)}
              >
                <div className="flex w-full items-center">
                  {/* Template thumbnail preview if available */}
                  {template.imagePath && (
                    <div className="mr-3 h-10 w-16 overflow-hidden rounded border border-gray-200">
                      <img 
                        src={template.imagePath} 
                        alt={`${template.name} preview`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <span className="font-bold text-md">{template.name}</span>
                    {template.description && (
                      <span className="text-xs text-gray-700 dark:text-zinc-300 line-clamp-5">
                        {template.description}
                      </span>
                    )}
                  </div>
                  
                  {template.id === selectedTemplate.id && 
                    <Check className="ml-auto text-lime-700 dark:text-lime-600 size-4" />
                  }
                </div>
                
                {template.credits && (
                  <div className="mt-1 flex w-full items-center text-xs text-gray-400">
                    <Info className="mr-1 size-3" />
                    <span>Credits: {template.credits}</span>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}