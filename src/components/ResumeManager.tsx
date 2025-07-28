import React, { useState, useRef, useEffect } from "react";
import { Edit2, Check, X, MoreVertical, FileText, SaveAllIcon, FolderOpen, File } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import Button from "./Button";
import { getSavedResumes, loadResumeCopy, deleteResumeCopy, renameResumeCopy, updateOrCreateResumeCopy } from '@/lib/StorageService';
import { useResume } from '@/lib/ResumeContext';
import { toast } from "sonner";

interface ResumeManagerProps {
  onNewResume: () => void;
}

// Format relative time like "3 days ago", "2 weeks ago", etc.
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes === 0) return 'just now';
      if (diffMinutes === 1) return '1 minute ago';
      return `${diffMinutes} minutes ago`;
    }
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  
  // More than a month, show the actual date
  return date.toLocaleDateString();
};

function ResumeManager({ onNewResume }: ResumeManagerProps) {
  const { formData, sections, resumeName, setResumeName, setFormData, setSections, selectedTemplate, currentResumeId, setCurrentResumeId } = useResume();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(resumeName);
  const [savedResumes, setSavedResumes] = useState(getSavedResumes());
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [selectedResumeIds, setSelectedResumeIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempName(resumeName);
    // Refresh saved resumes list when resume name changes (e.g., after loading a different resume)
    setSavedResumes(getSavedResumes());
  }, [resumeName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  // Refresh saved resumes when dialog opens and clear selections
  useEffect(() => {
    if (isOpenDialogOpen) {
      setSavedResumes(getSavedResumes());
      setSelectedResumeIds(new Set());
    }
  }, [isOpenDialogOpen]);

  const handleStartEdit = () => {
    setTempName(resumeName);
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== resumeName) {
      setResumeName(trimmedName);
      // If we have a currentResumeId, update the saved resume's name
      if (currentResumeId) {
        renameResumeCopy(currentResumeId, trimmedName);
        // Refresh the saved resumes list to reflect the change
        setSavedResumes(getSavedResumes());
      }
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
    // Generate auto-incrementing name like "resume-name (1)", "resume-name (2)", etc.
    const baseName = resumeName.replace(/ \(\d+\)$/, ''); // Remove existing (n) suffix if present
    const existingResumes = getSavedResumes();
    const existingNames = existingResumes.map(r => r.name);
    
    let copyNumber = 1;
    let newName = `${baseName} (${copyNumber})`;
    
    // Find the next available number
    while (existingNames.includes(newName)) {
      copyNumber++;
      newName = `${baseName} (${copyNumber})`;
    }
    
    // Create a new resume ID for the copy
    const newResumeId = crypto.randomUUID();
    
    // Save the copy with new ID using updateOrCreateResumeCopy
    updateOrCreateResumeCopy(
      newResumeId, 
      { formData, sections, templateId: selectedTemplate.id, currentResumeId: newResumeId }, 
      newName
    );
    
    // Switch to the new copy - this will trigger auto-save but it will just update the existing entry
    setResumeName(newName);
    setCurrentResumeId(newResumeId);
    setSavedResumes(getSavedResumes());
    toast.success(`Saved as copy: ${newName}`);
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
        // Set the currentResumeId to track which resume is loaded
        setCurrentResumeId(resumeId);
        setIsOpenDialogOpen(false);
      }
    }
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedResumeIds.size;
    if (selectedCount === 0) return;
    
    const message = selectedCount === 1 
      ? 'Are you sure you want to delete this resume?'
      : `Are you sure you want to delete ${selectedCount} resumes?`;
    
    if (window.confirm(message)) {
      let deletedCount = 0;
      selectedResumeIds.forEach(id => {
        if (deleteResumeCopy(id)) {
          deletedCount++;
        }
      });
      
      setSavedResumes(getSavedResumes());
      setSelectedResumeIds(new Set());
      
      if (deletedCount > 0) {
        toast.success(`Deleted ${deletedCount} resume${deletedCount > 1 ? 's' : ''}`);
      }
    }
  };

  const toggleResumeSelection = (resumeId: string) => {
    const newSelection = new Set(selectedResumeIds);
    if (newSelection.has(resumeId)) {
      newSelection.delete(resumeId);
    } else {
      newSelection.add(resumeId);
    }
    setSelectedResumeIds(newSelection);
  };

  const toggleSelectAll = () => {
    const selectableResumes = savedResumes.filter(r => r.id !== currentResumeId);
    if (selectedResumeIds.size === selectableResumes.length) {
      setSelectedResumeIds(new Set());
    } else {
      setSelectedResumeIds(new Set(selectableResumes.map(r => r.id)));
    }
  };

  return (
    <>
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
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-bold truncate">
            {resumeName}
          </span>
          <button
            onClick={handleStartEdit}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Edit resume name"
          >
            <Edit2 className="size-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Resume options"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="mb-0.75 text-xs">Resume</DropdownMenuLabel>
              <DropdownMenuItem className="text-xs" onClick={onNewResume}>
                <File className="mr-0.5 h-4 w-4" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => setIsOpenDialogOpen(true)}>
                <FolderOpen className="mr-0.5 h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={handleSaveAsCopy}>
                <SaveAllIcon className="mr-0.5 h-4 w-4" />
                Save As Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-300 dark:bg-zinc-800" />
              <DropdownMenuLabel className="mb-0.75 text-xs">Recent</DropdownMenuLabel>
              {savedResumes.length > 0 ? (
                <>
                  {savedResumes.slice(0, 5).map((resume) => {
                    const isCurrent = resume.id === currentResumeId;
                    return (
                      <div key={resume.id} className="group/item">
                        <DropdownMenuItem
                          onClick={() => !isCurrent && handleLoadResume(resume.id)}
                          className={`text-xs pr-8 ${isCurrent ? 'opacity-50 cursor-default' : ''}`}
                          disabled={isCurrent}
                        >
                          <FileText className="mr-0.5" />
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate font-medium">
                              {resume.name}
                              {isCurrent && <span className="text-gray-500 dark:text-gray-400 ml-1">(current)</span>}
                            </div>
                            <div className="text-muted-foreground">
                              {formatRelativeTime(resume.lastUpdated)}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    );
                  })}
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

      {/* Open Resume Dialog */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              <FolderOpen className="pb-1 inline me-2 size-6" strokeWidth={1.334} />
              Open
            </DialogTitle>
            <DialogDescription>
              Select a saved resume to open or manage your saved copies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {savedResumes.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">
                    <Checkbox
                      checked={savedResumes.filter(r => r.id !== currentResumeId).length > 0 && 
                               selectedResumeIds.size === savedResumes.filter(r => r.id !== currentResumeId).length}
                      onCheckedChange={() => toggleSelectAll()}
                    />
                    <span className="ms-2">Select all ({savedResumes.filter(r => r.id !== currentResumeId).length})</span>
                  </label>
                </div>
                <Button
                  theme={`${selectedResumeIds.size === 0 ? 'default' : 'danger'}`}
                  text={selectedResumeIds.size > 0 ? `Delete (${selectedResumeIds.size} selected)` : "Delete (None selected)"}
                  onClick={handleDeleteSelected}
                  className={`text-sm py-1.5`}
                />
              </div>
            )}
            <div className="
              overflow-y-auto max-h-[50vh] pr-1
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:bg-zinc-400 
              dark:[&::-webkit-scrollbar-track]:bg-zinc-950/25 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500/70">
              {savedResumes.length > 0 ? (
                <div className="space-y-2">
                  {savedResumes.map((resume) => {
                    const isCurrent = resume.id === currentResumeId;
                    return (
                      <div
                        key={resume.id}
                        className={`group flex items-center justify-between py-2 px-3 border rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700'
                            : selectedResumeIds.has(resume.id) 
                              ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700' 
                              : 'border-gray-300 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedResumeIds.has(resume.id)}
                            onCheckedChange={() => !isCurrent && toggleResumeSelection(resume.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isCurrent}
                          />
                          <div 
                            className={`flex items-center space-x-3 flex-1 min-w-0 ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                            onClick={() => !isCurrent && handleLoadResume(resume.id)}
                          >
                            <FileText className="font-thin h-6 w-6 text-gray-700 dark:text-gray-300 flex-shrink-0" strokeWidth={1.5} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {resume.name}
                                {isCurrent && <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">(current)</span>}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Modified {formatRelativeTime(resume.lastUpdated)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No saved resumes found</p>
                  <p className="text-sm mt-1">Save your current resume using "Save As Copy" to get started</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ResumeManager;