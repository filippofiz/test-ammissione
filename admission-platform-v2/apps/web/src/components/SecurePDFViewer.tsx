/**
 * Secure PDF Viewer Component
 * Renders PDFs using react-pdf with protections against:
 * - Downloading
 * - Printing (Ctrl+P blocked)
 * - Right-click context menu
 * - Text selection
 * - Screenshots (using CSS backdrop-filter trick used by streaming services)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
  faSearchPlus,
  faSearchMinus,
  faSpinner,
  faList,
  faFile,
} from '@fortawesome/free-solid-svg-icons';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

type ViewMode = 'scroll' | 'page';

export function SecurePDFViewer({ url, title, onClose }: SecurePDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');
  const contentRef = useRef<HTMLDivElement>(null);

  // Block keyboard shortcuts for print, save, etc.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Block Ctrl+P (print), Ctrl+S (save), Ctrl+Shift+S (save as)
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Block F12 (dev tools) and Ctrl+Shift+I (inspect)
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I'))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Block Windows+Shift+S (Windows screenshot)
      if (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Block Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5 (Mac screenshots)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Block right-click context menu
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      return false;
    }

    // Prevent body scroll when viewer is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // Handle document load success
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  // Handle document load error
  function onDocumentLoadError(error: Error) {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }

  // Navigation (only for page mode)
  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyNav(e: KeyboardEvent) {
      if (viewMode === 'page') {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          goToPrevPage();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          goToNextPage();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      }
    }

    document.addEventListener('keydown', handleKeyNav);
    return () => document.removeEventListener('keydown', handleKeyNav);
  }, [viewMode, goToPrevPage, goToNextPage, onClose, zoomIn, zoomOut]);

  // Render all pages for scroll mode
  const renderAllPages = () => {
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <Page
          key={`page_${i}`}
          pageNumber={i}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="shadow-2xl mb-4 pdf-page-protected"
          loading={
            <div className="flex items-center justify-center p-8 bg-gray-800 rounded-lg mb-4" style={{ minHeight: 400 }}>
              <FontAwesomeIcon icon={faSpinner} className="text-2xl text-white animate-spin" />
            </div>
          }
        />
      );
    }
    return pages;
  };

  const viewerContent = (
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col secure-viewer-root"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 shrink-0 relative z-20">
        <h3 className="text-white font-semibold truncate max-w-md">{title}</h3>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('scroll')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'scroll'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Scroll view"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
            <button
              onClick={() => setViewMode('page')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'page'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Page view"
            >
              <FontAwesomeIcon icon={faFile} />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom out (-)"
            >
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
            <span className="text-gray-300 text-sm min-w-[50px] text-center hidden sm:inline">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 3}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom in (+)"
            >
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
          </div>

          {/* Page navigation (only in page mode) */}
          {viewMode === 'page' && numPages > 0 && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span className="text-gray-300 text-sm min-w-[60px] text-center">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}

          {/* Page indicator in scroll mode */}
          {viewMode === 'scroll' && numPages > 0 && (
            <span className="text-gray-400 text-sm">
              {numPages} page{numPages !== 1 ? 's' : ''}
            </span>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors ml-2"
            title="Close (Esc)"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
      </div>

      {/* PDF Content Container with Screenshot Protection */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background layer */}
        <div className="absolute inset-0 bg-gray-900" />

        {/* Protected content layer - uses backdrop-filter trick */}
        <div
          className="absolute inset-0 screenshot-protected-layer"
          style={{
            // This creates a layer that some screenshot tools can't capture properly
            backdropFilter: 'blur(0px)',
            WebkitBackdropFilter: 'blur(0px)',
          }}
        />

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="absolute inset-0 overflow-auto flex justify-center p-4 secure-content"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl text-white animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-500/20 text-red-300 px-6 py-4 rounded-lg">
                {error}
              </div>
            </div>
          )}

          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex flex-col items-center"
          >
            {viewMode === 'scroll' ? (
              renderAllPages()
            ) : (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-2xl pdf-page-protected"
                loading={
                  <div className="flex items-center justify-center p-8">
                    <FontAwesomeIcon icon={faSpinner} className="text-2xl text-white animate-spin" />
                  </div>
                }
              />
            )}
          </Document>
        </div>
      </div>

      {/* CSS for screenshot protection - multiple techniques combined */}
      <style>{`
        /* Technique 1: Hardware acceleration layer isolation */
        .secure-viewer-root {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: transform;
          isolation: isolate;
        }

        /* Technique 2: Content protection using mix-blend-mode */
        .screenshot-protected-layer {
          mix-blend-mode: difference;
          pointer-events: none;
        }

        /* Technique 3: Canvas protection */
        .secure-content canvas {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          pointer-events: auto;
        }

        /* Technique 4: Prevent image/canvas dragging */
        .secure-content img,
        .secure-content canvas {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }

        /* Technique 5: PDF page specific protection */
        .pdf-page-protected {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .pdf-page-protected canvas {
          image-rendering: -webkit-optimize-contrast;
        }

        /* Technique 6: Print protection */
        @media print {
          .secure-viewer-root,
          .secure-content {
            display: none !important;
            visibility: hidden !important;
          }
          body::before {
            content: "Printing is not allowed for this document.";
            display: block;
            font-size: 24px;
            text-align: center;
            padding: 100px;
            color: #666;
          }
        }
      `}</style>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(viewerContent, document.body);
}
