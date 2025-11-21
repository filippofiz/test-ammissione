/**
 * PDFTestView Component
 * Displays PDF on the left and questions on the right
 * Questions are grouped by page number and PDF updates accordingly
 */

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCircleDot, faSearchPlus, faSearchMinus, faExpand } from '@fortawesome/free-solid-svg-icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Question {
  id: string;
  question_number: number;
  question_data: {
    pdf_url: string;
    page_number: number;
  };
  answers: {
    correct_answer: string;
    wrong_answers: string[];
  };
}

interface StudentAnswer {
  questionId: string;
  answer: string | null;
  flagged: boolean;
}

interface PDFTestViewProps {
  questions: Question[];
  currentPageGroup: number; // Current group of questions (by page)
  answers: Record<string, StudentAnswer>;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  timeRemaining?: number | null; // For disabling buttons before time expires
  showCorrectAnswers?: boolean; // For guided mode - show correct answers
}

export function PDFTestView({
  questions,
  currentPageGroup,
  answers,
  onAnswer,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  timeRemaining,
  showCorrectAnswers = false,
}: PDFTestViewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  // Group questions by page number
  const pageGroups: Record<number, Question[]> = {};
  questions.forEach(q => {
    const pageNum = q.question_data.page_number;
    if (!pageGroups[pageNum]) {
      pageGroups[pageNum] = [];
    }
    pageGroups[pageNum].push(q);
  });

  // Get current page questions
  const sortedPageNumbers = Object.keys(pageGroups).map(Number).sort((a, b) => a - b);
  const currentPageNumber = sortedPageNumbers[currentPageGroup] || sortedPageNumbers[0];
  const currentQuestions = pageGroups[currentPageNumber] || [];

  // Get PDF URL from first question
  const pdfUrl = questions[0]?.question_data.pdf_url;

  const answerOptions = ['A', 'B', 'C', 'D', 'E'];

  // Reset page loading when page number changes
  useEffect(() => {
    setPageLoading(true);
  }, [currentPageNumber]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPdfError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. Please refresh the page.');
  }

  function zoomIn(): void {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }

  function zoomOut(): void {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }

  function resetZoom(): void {
    setScale(1.0);
  }

  async function handleNext(): Promise<void> {
    // Extra safety: reject if time has expired
    if (timeRemaining !== null && timeRemaining !== undefined && timeRemaining <= 0) {
      console.log('⚠️ Time expired, ignoring click');
      return;
    }

    setIsLoading(true);
    try {
      await onNext();
    } finally {
      setIsLoading(false);
      setPageLoading(true); // New page will load
    }
  }

  function onPageLoadSuccess(): void {
    setPageLoading(false);
  }

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Left side: PDF Viewer */}
      <div className="w-1/2 bg-white border-r border-gray-300 flex flex-col">
        {/* Zoom controls */}
        <div className="flex items-center justify-start bg-gray-100 border-b border-gray-300 px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
              title="Reset Zoom"
            >
              <FontAwesomeIcon icon={faExpand} className="mr-1" />
              Reset
            </button>
          </div>
        </div>

        {/* PDF Document - Scrollable */}
        <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
          {pdfError ? (
            <div className="text-red-600 text-center p-4">
              <p className="font-semibold">Error loading PDF</p>
              <p className="text-sm">{pdfError}</p>
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-gray-600">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
                  <p>Loading PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={currentPageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
                scale={scale}
                onLoadSuccess={onPageLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>

      {/* Right side: Questions */}
      <div className="w-1/2 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            {currentQuestions.map((question, idx) => {
              const answer = answers[question.id];
              const isOpenEnded = !question.answers.wrong_answers || question.answers.wrong_answers.length === 0;
              const allOptions = isOpenEnded ? [] : [
                question.answers.correct_answer,
                ...question.answers.wrong_answers
              ].sort();

              // Calculate section-relative question number (1-indexed within section)
              const sectionQuestionNumber = questions.findIndex(q => q.id === question.id) + 1;

              return (
                <div key={question.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Question {sectionQuestionNumber}
                  </h3>

                  {isOpenEnded ? (
                    /* Open-ended / Fill-in-the-blank question */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={answer?.answer || ''}
                        onChange={(e) => onAnswer(question.id, e.target.value)}
                        placeholder="Enter your answer..."
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:ring-2 focus:ring-brand-green focus:ring-opacity-20 outline-none text-gray-800 text-lg"
                      />
                    </div>
                  ) : (
                    /* Multiple choice question */
                    <div className="space-y-3">
                      {allOptions.map((option) => {
                        const isSelected = answer?.answer?.toLowerCase() === option.toLowerCase();
                        const isCorrect = option.toLowerCase() === question.answers.correct_answer.toLowerCase();
                        const showAsCorrect = showCorrectAnswers && isCorrect;
                        const showAsWrong = showCorrectAnswers && isSelected && !isCorrect;

                        return (
                          <button
                            key={option}
                            onClick={() => onAnswer(question.id, option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                              showAsWrong
                                ? 'border-red-500 bg-red-50'
                                : showAsCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected
                                    ? 'border-brand-green bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-brand-green hover:bg-gray-50'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={isSelected ? faCircleDot : faCircle}
                              className={
                                showAsWrong
                                  ? 'text-red-500'
                                  : showAsCorrect
                                    ? 'text-green-600'
                                    : isSelected
                                      ? 'text-brand-green'
                                      : 'text-gray-300'
                              }
                            />
                            <span className={`font-medium ${
                              showAsWrong
                                ? 'text-red-600'
                                : showAsCorrect
                                  ? 'text-green-700'
                                  : isSelected
                                    ? 'text-brand-green'
                                    : 'text-gray-700'
                            }`}>
                              {option.toUpperCase()}
                              {showAsCorrect && ' ✓'}
                              {showAsWrong && ' ✗'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading || (timeRemaining !== null && timeRemaining !== undefined && timeRemaining <= 1)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext || isLoading || pageLoading || (timeRemaining !== null && timeRemaining !== undefined && timeRemaining <= 1)}
            className="px-6 py-3 bg-brand-green text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
