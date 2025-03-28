import { importResumeFromJson } from "@/lib/ImportExportService";
import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Alert } from "./Alert";
import Button from "./Button";
import { FormData } from "@/types";
import { DialogClose } from "./ui/dialog";

interface ResumeImporterProps {
  onComplete: (formData: FormData) => void;
}

export const ResumeImporter = ({ onComplete }: ResumeImporterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [uploadedFormData, setUploadedFormData] = useState<FormData | null>(null);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = await importResumeFromJson(file);
      setUploadedFormData(formData);
      console.log('Resume imported successfully', formData);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <label htmlFor="resumeJsonImport" className="text-sm">
        <div className="ms-1 mb-1">Resume (.json)</div>
        <Input 
          id="resumeJsonImport" 
          type="file" 
          accept=".json"
          onChange={handleFileChange} 
          disabled={isLoading || uploadComplete}
        />
      </label>
      {isLoading && <div>Importing resume...</div>}
      {error && 
        <>
          <Alert title="Error" description="There was an issue uploading your resume content. Please ensure the content conforms to the JSON resume format and try again." variant="danger" />
        </>
      }
      {!isLoading && !uploadComplete && success && 
        <>
          <Alert title="Confirm Upload" description="Your resume was successfully uploaded. Please confirm to overwrite your current edits with the uploaded resume content." variant="info" />
          <div className="pt-1">
            <Button 
              text="Confirm Upload" 
              theme="interaction" 
              className="mb-0 text-sm"
              onClick={() => { onComplete(uploadedFormData!); setUploadComplete(true); }} />
          </div>
        </>
      }
      {uploadComplete &&
        <>
          <DialogClose className="text-left">
            <Alert title="Import Complete" description="You can now close this dialog." variant="success" />
            <div className="mb-5"></div>
            <Button 
                text="Close" 
                theme="interaction" 
                className="mb-0 text-sm" />
          </DialogClose>
        </>
      }
    </>
  );
};