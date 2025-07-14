import React from 'react';
import { ChangeRecord } from '../../types/ai';

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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          Optimization Summary
        </h3>
        <p className="text-sm text-blue-700">
          Found {changes.length} improvement{changes.length !== 1 ? 's' : ''} to better match the job requirements.
        </p>
      </div>

      {/* Changes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Proposed Changes</h3>
          <div className="space-x-2">
            <button
              onClick={() => setSelectedChanges(new Set(changes.map((_, i) => i.toString())))}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedChanges(new Set())}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Select None
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {changes.map((change, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
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
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {change.section}
                      {change.itemIndex !== undefined && ` #${change.itemIndex + 1}`}
                    </span>
                    <span className="text-xs text-gray-500">{change.field}</span>
                  </div>
                  
                  {/* Before */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-red-700">Before:</p>
                    <div className="bg-red-50 border-l-4 border-red-200 p-2 text-sm text-red-900">
                      {change.before}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-green-700">After:</p>
                    <div className="bg-green-50 border-l-4 border-green-200 p-2 text-sm text-green-900">
                      {change.after}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
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
          <h3 className="font-medium text-gray-900">Additional Suggestions</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                  <span className="text-yellow-600 mt-0.5">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onApplyAll}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Apply All Changes
        </button>
        <button
          onClick={handleApplySelected}
          disabled={selectedChanges.size === 0}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Apply Selected ({selectedChanges.size})
        </button>
      </div>
    </div>
  );
};

export default ResumeDiffViewer;