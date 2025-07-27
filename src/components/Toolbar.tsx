import { CloudDownload, CodeSquare, Edit2, Check, X } from "lucide-react";
import StatusIndicator from "./StatusIndicator";
import { useState, useRef, useEffect } from "react";

interface ToolbarProps {
  error: string | null;
  isLoading?: boolean;
  pageRendered?: boolean;
  resumeName: string;
  onDownloadPdf: () => void;
  onDownloadLaTeX: () => void;
  onResumeNameChange: (name: string) => void;
}

function Toolbar({
  error,
  isLoading,
  pageRendered,
  resumeName,
  onDownloadPdf,
  onDownloadLaTeX,
  onResumeNameChange
}: ToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(resumeName);
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
      onResumeNameChange(trimmedName);
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

  const buttonCss =
    `transition-colors
    px-2 py-1.5
    text-sm font-bold text-gray-950 hover:text-gray-50
    bg-gray-50 hover:bg-purple-800
    border-0
    hover:cursor-pointer
    hover:shadow-lg hover:shadow-purple-500/30
    active:shadow-inner
    focus:outline-none focus:ring-3 focus:ring-purple-500 focus:ring-opacity-50
    focus:bg-purple-900 focus:text-gray-50`;

  return (
    <>
      <div className="
          bg-zinc-800/93 dark:bg-zinc-900/93
          px-0 pt-[0.485rem] pb-[0.4rem] mb-0
          border-0 border-transparent
          rounded-m">

        {/* Desktop layout - all in one row */}
        <div className="hidden lg:flex lg:flex-row lg:justify-between rounded-lg max-w-[800px] mx-auto px-4 md:px-0" role="group">
          <div className="flex-1 inline-flex items-center space-x-3">
            <StatusIndicator error={error} isLoading={isLoading} pageRendered={pageRendered} />
            
            {/* Resume name editor */}
            <div className="flex items-center">
              {isEditingName ? (
                <div className="flex items-center space-x-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-2 py-1 text-sm bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
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
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {resumeName}
                  </span>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit resume name"
                  >
                    <Edit2 className="size-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="inline-flex">
              <button type="button"
                className={`${buttonCss} border border-e-0 rounded-s-lg flex items-center justify-center ms-1.5`}
                title="Download LaTeX"
                onClick={onDownloadLaTeX}>
                <span className="flex items-center">
                  <span className="sr-only">Download</span>
                  <CodeSquare className="size-5 me-1" strokeWidth={1.5} />
                  LaTeX
                </span>
              </button>
              <button type="button"
                className={`${buttonCss} border rounded-e-lg flex items-center justify-center`}
                title="Download PDF"
                onClick={onDownloadPdf}>
                <span className="flex items-center">
                  <span className="sr-only">Download</span>
                  <CloudDownload className="size-5 me-1" strokeWidth={1.667} />
                  PDF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile layout - three rows */}
        <div className="flex flex-col lg:hidden rounded-lg px-4" role="group">
          {/* First row - status indicator only */}
          <div className="inline-flex items-center justify-center mb-2">
            <StatusIndicator error={error} isLoading={isLoading} pageRendered={pageRendered} />
          </div>

          {/* Second row - resume name editor */}
          <div className="flex items-center justify-center mb-2">
            {isEditingName ? (
              <div className="flex items-center space-x-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-2 py-1 text-sm bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
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
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {resumeName}
                </span>
                <button
                  onClick={handleStartEdit}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Edit resume name"
                >
                  <Edit2 className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Third row - buttons */}
          <div className="flex flex-row justify-center items-center">

            <div className="inline-flex">
              <button type="button"
                className={`${buttonCss} border border-e-0 rounded-s-lg flex items-center justify-center ms-1.5`}
                title="Download LaTeX"
                onClick={onDownloadLaTeX}>
                <span className="flex items-center">
                  <span className="sr-only">Download</span>
                  <CodeSquare className="size-5 me-1" strokeWidth={1.5} />
                  LaTeX
                </span>
              </button>
              <button type="button"
                className={`${buttonCss} border rounded-e-lg flex items-center justify-center`}
                title="Download PDF"
                onClick={onDownloadPdf}>
                <span className="flex items-center">
                  <span className="sr-only">Download</span>
                  <CloudDownload className="size-5 me-1" strokeWidth={1.667} />
                  PDF
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Toolbar;