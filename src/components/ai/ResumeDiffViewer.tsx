import React from 'react';
import { ChangeRecord } from '../../types/ai';
import Button from '../Button';

// Helper function to render HTML content or plain text
const renderContent = (content: string) => {
  // Check if content contains HTML list tags
  if (content.includes('<ul>') || content.includes('<li>')) {
    // Extract list items and render as plain text
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    if (items.length > 0) {
      return (
        <ul className="list-disc list-outside space-y-0.5 ml-5">
          {items.map((item, index) => {
            const text = item.replace(/<\/?li[^>]*>/gi, '').trim();
            return <li key={index}>{text}</li>;
          })}
        </ul>
      );
    }
  }
  
  // For comma-separated skills or plain text
  return <span>{content}</span>;
};

interface ResumeDiffViewerProps {
  changes: ChangeRecord[];
  suggestions: string[];
  onApplyChanges: (changeIds: string[]) => void;
  onApplyAll: () => void;
}

const ResumeDiffViewer: React.FC<ResumeDiffViewerProps> = ({
  changes,
  suggestions,
  onApplyChanges,
  onApplyAll
}) => {
  const [selectedChanges, setSelectedChanges] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Select all changes by default
    setSelectedChanges(new Set(changes.map((_, index) => index.toString())));
  }, [changes]);

  const handleToggleChange = (index: string) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedChanges(newSelected);
  };

  const handleApplySelected = () => {
    onApplyChanges(Array.from(selectedChanges));
  };

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>✨ Your resume is already well-optimized for this job!</p>
        <p className="text-sm mt-2">No significant changes were suggested.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100">
          Optimization Summary
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Found {changes.length} improvement{changes.length !== 1 ? 's' : ''} to better match the job requirements.
        </p>
      </div>

      {/* Changes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl">Proposed Changes</h3>
          <div className="space-x-2">
            <Button
              theme="interaction"
              text="Select All"
              className="text-xs"
              onClick={() => setSelectedChanges(new Set(changes.map((_, i) => i.toString())))} />
            <Button
              theme="default"
              text="Select None"
              className="text-xs"
              onClick={() => setSelectedChanges(new Set())} />
          </div>
        </div>

        <div className="space-y-3">
          {changes.map((change, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-zinc-900 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedChanges.has(index.toString())}
                  onChange={() => handleToggleChange(index.toString())}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium py-1 text-gray-900 dark:text-gray-100 rounded">
                      {change.section}
                      {change.itemIndex !== undefined && ` #${change.itemIndex + 1}`}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{change.field}</span>
                  </div>
                  
                  {/* Before */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-red-800 dark:text-red-400">Before:</p>
                    <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-200 dark:border-red-800 p-2 text-xs text-red-900 dark:text-red-100">
                      {renderContent(change.before)}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-green-800 dark:text-green-400">After:</p>
                    <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-200 dark:border-green-800 p-2 text-xs text-green-900 dark:text-green-100">
                      {renderContent(change.after)}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-200 dark:border-blue-800 p-2 text-xs text-blue-800 dark:text-blue-100 mt-4">
                    <strong>Why:</strong> {change.reason}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Additional Suggestions</h3>
          <div className="bg-lime-50 dark:bg-lime-950 border-l-4 border-lime-200 dark:border-lime-800 p-3">
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-lime-900 dark:text-lime-100 flex items-start space-x-2">
                  <span className="text-lime-600 mt-0.5">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex space-x-3 pt-4">

        <Button
          text="Apply All Changes"
          onClick={onApplyAll}
          theme="success"
          parentClassName="flex-1"
        />

        <Button
          text="Apply Selected"
          onClick={handleApplySelected}
          theme="interaction"
          parentClassName="flex-1"
        />

      </div>
    </div>
  );
};

export default ResumeDiffViewer;