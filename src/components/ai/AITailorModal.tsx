import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useResume } from '../../lib/ResumeContext';
import { AIService } from '../../lib/ai/AIService';
import { SecureStorage } from '../../lib/ai/SecureStorage';
import { TailorResponse, AIProcessingStatus } from '../../types/ai';
import APIKeyManager from './APIKeyManager';
import JobURLInput from './JobURLInput';
import ResumeDiffViewer from './ResumeDiffViewer';
import AiSpinner from '../AiSpinner';

interface AITailorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalStep = 'api-key' | 'job-input' | 'processing' | 'results';

const AITailorModal: React.FC<AITailorModalProps> = ({ open, onOpenChange }) => {
  const { formData, setFormData } = useResume();
  const [currentStep, setCurrentStep] = useState<ModalStep>('api-key');
  const [processingStatus, setProcessingStatus] = useState<AIProcessingStatus>({
    stage: 'idle',
    message: '',
    progress: 0
  });
  const [tailorResults, setTailorResults] = useState<TailorResponse | null>(null);

  React.useEffect(() => {
    if (open) {
      // Check if API key is already configured
      if (SecureStorage.hasAPIKey()) {
        setCurrentStep('job-input');
      } else {
        setCurrentStep('api-key');
      }
    }
  }, [open]);

  React.useEffect(() => {
    // Set up status callback for AI service
    AIService.setStatusCallback(setProcessingStatus);
  }, []);

  const handleAPIKeyConfigured = () => {
    setCurrentStep('job-input');
  };

  const handleJobSubmit = async (jobData: { url?: string; description?: string }) => {
    setCurrentStep('processing');
    
    try {
      const results: TailorResponse = await AIService.tailorResume({
        jobUrl: jobData.url,
        jobDescription: jobData.description,
        resumeData: formData,
        targetSections: ['experience', 'skills', 'projects']
      });

      console.log(results);

      setTailorResults(results);
      setCurrentStep('results');
    } catch (error) {
      console.error('Failed to tailor resume:', error);
      setProcessingStatus({
        stage: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        progress: 0
      });
    }
  };

  const handleApplyChanges = (changeIds: string[]) => {
    if (!tailorResults?.success) return;

    const changes = tailorResults.changes.filter((_, index) => 
      changeIds.includes(index.toString())
    );

    // Apply selected changes to the form data
    let updatedFormData = { ...formData };

    changes.forEach(change => {
      if (change.section === 'experience' && change.itemIndex !== undefined) {
        const newExperience = [...(updatedFormData.experience || [])];
        if (newExperience[change.itemIndex]) {
          newExperience[change.itemIndex] = {
            ...newExperience[change.itemIndex],
            [change.field]: change.after
          };
          updatedFormData.experience = newExperience;
        }
      } else if (change.section === 'skills') {
        // For skills, we need to handle the skill format properly
        // Assuming change.after contains the skill list for a category
        if (change.itemIndex !== undefined && updatedFormData.skills) {
          const newSkills = [...updatedFormData.skills];
          if (newSkills[change.itemIndex]) {
            newSkills[change.itemIndex] = {
              ...newSkills[change.itemIndex],
              skillList: change.after
            };
            updatedFormData.skills = newSkills;
          }
        }
      } else if (change.section === 'projects' && change.itemIndex !== undefined) {
        const newProjects = [...(updatedFormData.projects || [])];
        if (newProjects[change.itemIndex]) {
          newProjects[change.itemIndex] = {
            ...newProjects[change.itemIndex],
            [change.field]: change.after
          };
          updatedFormData.projects = newProjects;
        }
      }
    });

    setFormData(updatedFormData);
    onOpenChange(false);
  };

  const handleApplyAll = () => {
    if (!tailorResults?.success) return;
    
    const allChangeIds = tailorResults.changes.map((_, index) => index.toString());
    handleApplyChanges(allChangeIds);
  };

  const handleStartOver = () => {
    setCurrentStep('job-input');
    setTailorResults(null);
    setProcessingStatus({ stage: 'idle', message: '', progress: 0 });
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'api-key':
        return (
          <APIKeyManager onKeyConfigured={handleAPIKeyConfigured} />
        );

      case 'job-input':
        return (
          <JobURLInput 
            onJobSubmit={handleJobSubmit}
            disabled={false}
          />
        );

      case 'processing':
        return (
          <div className="text-center py-8 space-y-4">
            <AiSpinner className="text-center mx-auto" />
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{processingStatus.message}</p>
              {processingStatus.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingStatus.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
            {processingStatus.stage === 'error' && (
              <div className="mt-4">
                <button
                  onClick={handleStartOver}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        );

      case 'results':
        if (!tailorResults) return null;
        
        return (
          <div className="space-y-4">
            {tailorResults.success ? (
              <ResumeDiffViewer
                changes={tailorResults.changes}
                suggestions={tailorResults.suggestions}
                onApplyChanges={handleApplyChanges}
                onApplyAll={handleApplyAll}
              />
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-red-500 text-4xl">❌</div>
                <p className="font-medium text-gray-900">Failed to optimize resume</p>
                <p className="text-sm text-gray-600">{tailorResults.error}</p>
                <button
                  onClick={handleStartOver}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleStartOver}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Tailor for Another Job
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 'api-key':
        return 'Configure AI Assistant';
      case 'job-input':
        return 'AI Resume Tailoring';
      case 'processing':
        return 'Optimizing Your Resume';
      case 'results':
        return 'Resume Optimization Results';
      default:
        return 'AI Resume Tailoring';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <span>✨</span>
            <span>{getTitle()}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AITailorModal;