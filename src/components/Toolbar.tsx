import { CloudDownload, CodeSquare, } from "lucide-react";
import StatusIndicator from "./StatusIndicator";

interface ToolbarProps {
  error: string | null;
  isLoading?: boolean;
  pageRendered?: boolean;
  onDownloadPdf: () => void;
  onDownloadLaTeX: () => void;
}

function Toolbar({
  error,
  isLoading,
  pageRendered,
  onDownloadPdf,
  onDownloadLaTeX
}: ToolbarProps) {

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
          <div className="flex-1 inline-flex items-center">
            <StatusIndicator error={error} isLoading={isLoading} pageRendered={pageRendered} />
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

        {/* Mobile layout - two rows */}
        <div className="flex flex-col lg:hidden rounded-lg px-4" role="group">
          {/* First row - status indicator only */}
          <div className="inline-flex items-center justify-center mb-0">
            <StatusIndicator error={error} isLoading={isLoading} pageRendered={pageRendered} />
          </div>

          {/* Second row - buttons right */}
          <div className="flex flex-row justify-between items-center">

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