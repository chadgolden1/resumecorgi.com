import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { useResume } from '../../lib/ResumeContext';
import { AIService } from '../../lib/ai/AIService';
import { SecureStorage } from '../../lib/ai/SecureStorage';
import { TailorResponse, AIProcessingStatus, AnthropicModel } from '../../types/ai';
import { ModelPreferences } from '../../lib/ai/ModelPreferences';
import APIKeyManager from './APIKeyManager';
import JobURLInput from './JobURLInput';
import ResumeDiffViewer from './ResumeDiffViewer';
import ModelSelector from './ModelSelector';
import TailoringStrength from './TailoringStrength';
import AiSpinner from '../AiSpinner';
import { StarsIcon } from 'lucide-react';
import AiButton from '../AiButton';

interface AITailorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ModalStep = 'api-key' | 'job-input' | 'processing' | 'results';

const AITailorModal: React.FC<AITailorModalProps> = ({ open, onOpenChange }) => {
  const { formData, setFormData } = useResume();
  const [currentStep, setCurrentStep] = useState<ModalStep>('api-key');
  const [selectedModel, setSelectedModel] = useState<AnthropicModel>(ModelPreferences.getPreferredModel());
  const [tailoringStrength, setTailoringStrength] = useState<number>(4);
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
        targetSections: ['experience', 'skills', 'projects'],
        model: selectedModel,
        tailoringStrength: tailoringStrength
      });

      console.log('AI Tailoring Results:', results);
      console.log('Tailored Resume:', results.tailoredResume);
      console.log('Experience in tailored resume:', results.tailoredResume?.experience);

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
    if (!tailorResults?.success || !tailorResults.tailoredResume) return;
    
    console.log('Applying all changes with tailored resume:', tailorResults.tailoredResume);
    console.log('Experience before apply:', formData.experience);
    console.log('Experience in tailored resume:', tailorResults.tailoredResume.experience);
    
    // Use the complete tailored resume from the AI response
    setFormData(tailorResults.tailoredResume);
    onOpenChange(false);
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
          <>
            <ModelSelector
              value={selectedModel}
              onChange={(model) => {
                setSelectedModel(model);
                ModelPreferences.setPreferredModel(model);
              }}
              disabled={false}
            />
            <TailoringStrength
              value={tailoringStrength}
              onChange={setTailoringStrength}
              disabled={false}
            />
            <JobURLInput 
              onJobSubmit={handleJobSubmit}
              disabled={false}
            />
          </>
        );

      case 'processing':
        return (
          <div className="text-center py-8 space-y-4">
            <AiSpinner className="text-center mx-auto" />
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">{processingStatus.message}</p>
            </div>
            {processingStatus.stage === 'error' && (
              <div className="mt-4">
                <AiButton
                  onClick={handleStartOver}>
                    Try Again
                </AiButton>
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
        return 'Configure Royal Assistant';
      case 'job-input':
        return 'Tailor with Smart Match';
      case 'processing':
        return 'Optimizing Your Resume';
      case 'results':
        return 'Resume Optimization Results';
      default:
        return 'Smart Match Resume Tailoring';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-full sm:w-3/4 lg:w-2/3 xl:max-w-4xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center font-bold space-x-2 text-gray-900 dark:text-gray-100">
            <span>
              <StarsIcon className="text-yellow-500 dark:text-yellow-300" size={18} />
            </span>
            <span>{getTitle()}</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 px-4">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AITailorModal;