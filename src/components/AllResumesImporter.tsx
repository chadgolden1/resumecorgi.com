import { importAllResumesFromJson } from "@/lib/ImportExportService";
import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Alert } from "./Alert";
import Button from "./Button";
import { DialogClose } from "./ui/dialog";

interface AllResumesImporterProps {
  onComplete: () => void;
}

export const AllResumesImporter = ({ onComplete }: AllResumesImporterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; renamed: number } | null>(null);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await importAllResumesFromJson(file);
      setImportResult(result);
      console.log('Resumes imported successfully', result);
    } catch (err) {
      setError((err as Error).message);
      setImportResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    onComplete();
    setUploadComplete(true);
  };
  
  return (
    <>
      <label htmlFor="allResumesJsonImport" className="text-sm">
        <div className="ms-1 mb-1">All Resumes Export (.json)</div>
        <Input 
          id="allResumesJsonImport" 
          type="file" 
          accept=".json"
          onChange={handleFileChange} 
          disabled={isLoading || uploadComplete}
        />
      </label>
      {isLoading && <div>Importing resumes...</div>}
      {error && 
        <>
          <Alert title="Error" description={`Failed to import resumes: ${error}`} variant="danger" />
        </>
      }
      {!isLoading && !uploadComplete && importResult && 
        <>
          <Alert 
            title="Import Summary" 
            description={
              <>
                <div>Successfully imported: {importResult.imported} resume{importResult.imported !== 1 ? 's' : ''}</div>
                {importResult.renamed > 0 && (
                  <div>Renamed due to conflicts: {importResult.renamed}</div>
                )}
                {importResult.skipped > 0 && (
                  <div>Skipped due to errors: {importResult.skipped}</div>
                )}
              </>
            } 
            variant={importResult.skipped > 0 ? "warning" : "success"} 
          />
          <div className="pt-1">
            <Button 
              text="Done" 
              theme="interaction" 
              className="mb-0 text-sm"
              onClick={handleConfirm} />
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