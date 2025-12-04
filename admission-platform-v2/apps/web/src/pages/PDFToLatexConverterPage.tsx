/**
 * PDF to LaTeX Converter Page
 * Converts existing PDF questions from old system to LaTeX format for new system
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faTrash,
  faSave,
  faMagic,
  faRedo,
  faImage,
  faExchangeAlt,
  faTable,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider, MathJaxRenderer, TikZGraph } from '../components/MathJaxRenderer';
import { AdvancedGraphRenderer } from '../components/GraphRenderer';
import { NewTestCreator } from '../components/NewTestCreator';
import { LanguageSelectionModal } from '../components/LanguageSelectionModal';
import { supabase } from '../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdfjs worker - use local copy
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Configure react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface OldQuestion {
  id: string;
  question_number: number;
  page_number: number;
  correct_answer: string;
  wrong_answers: string[] | null;
  is_open_ended: boolean;
  argomento: string;
}

interface PDFTest {
  test_id: string;
  test_type: string;
  section: string;
  exercise_type: string;
  test_number: number;
  pdf_url: string;
  question_count: number;
}

interface ConvertedQuestion {
  question_number: number;
  question_text: string;
  question_text_eng?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  options_eng?: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  correct_answer: string;
  section: string;
}

/**
 * Extract and upload images for questions with has_image: true
 * @param pdfUrl URL of the PDF file
 * @param questions Questions to process
 * @param testType Test type for folder organization
 * @param section Section for folder organization
 * @returns Questions with image_url populated
 */
async function extractAndUploadImages(
  pdfUrl: string,
  questions: any[],
  testType: string,
  section: string
): Promise<any[]> {
  const questionsWithImages = questions.filter((q) => q.has_image && q.page_number);

  if (questionsWithImages.length === 0) {
    console.log('No questions with images to extract');
    return questions;
  }

  console.log(`Extracting images for ${questionsWithImages.length} questions...`);

  try {
    // Fetch PDF
    const pdfResponse = await fetch(pdfUrl);
    const pdfBlob = await pdfResponse.blob();
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();

    // Load PDF with pdfjs
    const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
    const pdfDoc = await loadingTask.promise;

    console.log(`PDF loaded, ${pdfDoc.numPages} pages`);

    // Process each question with image
    for (const question of questionsWithImages) {
      if (!question.page_number || question.page_number > pdfDoc.numPages) {
        console.warn(`Question ${question.question_number}: invalid page number ${question.page_number}`);
        continue;
      }

      try {
        console.log(`\n=== QUESTION ${question.question_number} (Page ${question.page_number}) ===`);
        console.log('Has image flag:', question.has_image);
        console.log('Image mapping:', question.image_mapping);

        // Get the page
        const page = await pdfDoc.getPage(question.page_number);

        // Render page to ensure all objects are loaded
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx!,
          viewport: viewport,
        }).promise;

        console.log('Page rendered, all objects loaded');

        // Get operator list to find image names and their positions
        const ops = await page.getOperatorList();

        // Count total image operations on this page
        const totalImageOps = ops.fnArray.filter(fn => fn === pdfjsLib.OPS.paintImageXObject).length;
        console.log(`Found ${totalImageOps} image operations on page ${question.page_number}`);

        const allImagesOnPage: any[] = []; // Track all images for first/last filtering

        // STEP 1: Collect all valid images first
        for (let i = 0; i < ops.fnArray.length; i++) {
          if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
            const imageName = ops.argsArray[i][0];

            try {
              // Get the actual image object from the page
              const image = await page.objs.get(imageName);

              if (image && image.width && image.height) {
                console.log(`Found image object ${imageName}: ${image.width}x${image.height}, has bitmap: ${!!image.bitmap}, has data: ${!!image.data}`);

                // Process ALL images first, we'll filter by aspect ratio later
                // Don't filter by size here as we might miss content
                if (true) {  // Process all images
                  // Get transform matrix from operator args to find Y position
                  let yPosition = 0;

                  // Look back in the operator list for the transform that applies to this image
                  for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
                    if (ops.fnArray[j] === pdfjsLib.OPS.transform ||
                        ops.fnArray[j] === pdfjsLib.OPS.setMatrix) {
                      const matrix = ops.argsArray[j];
                      if (matrix && matrix.length >= 6) {
                        yPosition = matrix[5]; // Y coordinate is the 6th element
                        break;
                      }
                    }
                  }

                  // Collect all images first
                  allImagesOnPage.push({
                    imageName,
                    image,
                    yPosition,
                    width: image.width,
                    height: image.height,
                    opIndex: i
                  });
                }
              } else {
                console.log(`Image ${imageName} missing dimensions or invalid`);
              }
            } catch (err) {
              // Silently skip unresolvable images
              const errMsg = String(err);
              if (!errMsg.includes('resolved yet')) {
                console.warn(`Could not get image ${imageName}:`, err);
              }
            }
          }
        }

        // Sort images by Y position (top to bottom)
        allImagesOnPage.sort((a, b) => b.yPosition - a.yPosition);

        console.log(`Collected ${allImagesOnPage.length} valid images on page ${question.page_number}`);

        // STEP 2: Filter out headers and footers
        // Use multiple criteria: aspect ratio, position, and relative ordering
        let imagesToProcess = [];

        // If we have exactly 3 images, it's likely header, content, footer pattern
        if (allImagesOnPage.length === 3) {
          console.log(`Found exactly 3 images - assuming header/content/footer pattern`);
          // Take the middle one (index 1)
          imagesToProcess = [allImagesOnPage[1]];
          console.log(`Keeping middle image as content: ${allImagesOnPage[1].width}x${allImagesOnPage[1].height}`);
        } else {
          // For other cases, use aspect ratio filtering
          for (const img of allImagesOnPage) {
            const aspectRatio = img.width / img.height;
            // Headers/footers are typically very wide and short (aspect ratio > 8)
            const isLikelyHeaderFooter = aspectRatio > 8;

            if (isLikelyHeaderFooter) {
              console.log(`Filtering out header/footer: ${img.width}x${img.height} (aspect ratio: ${aspectRatio.toFixed(1)})`);
            } else {
              console.log(`Keeping content image: ${img.width}x${img.height} (aspect ratio: ${aspectRatio.toFixed(1)})`);
              imagesToProcess.push(img);
            }
          }
        }

        const extractedImages: { url: string; width: number; height: number; y: number }[] = [];

        // STEP 3: Process and upload the remaining images
        for (const imgData of imagesToProcess) {
          const { image, imageName, yPosition } = imgData;

          console.log(`Processing image ${imageName}: ${image.width}x${image.height} at Y=${yPosition}`);

          // Create a canvas and draw the image directly
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            let imageDrawn = false;

            // Try different methods to extract the image
            if (image.bitmap) {
              // Method 1: Use bitmap if available
              console.log(`Drawing bitmap for ${imageName}`);
              ctx.drawImage(image.bitmap, 0, 0);
              imageDrawn = true;
            } else if (image.data) {
              // Method 2: Use raw image data if available
              console.log(`Using raw data for ${imageName}`);
              const imageData = ctx.createImageData(image.width, image.height);

              // Handle different data formats
              if (image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray) {
                imageData.data.set(image.data);
              } else if (Array.isArray(image.data)) {
                for (let i = 0; i < image.data.length; i++) {
                  imageData.data[i] = image.data[i];
                }
              }

              ctx.putImageData(imageData, 0, 0);
              imageDrawn = true;
            } else {
              // Method 3: Try to render the page region where the image should be
              console.log(`Attempting page region extraction for ${imageName}`);

              // Create a temporary canvas to render the full page
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d');
              const scale = 2.0; // Higher scale for better quality
              const viewport = page.getViewport({ scale });

              tempCanvas.width = viewport.width;
              tempCanvas.height = viewport.height;

              if (tempCtx) {
                await page.render({
                  canvasContext: tempCtx,
                  viewport: viewport,
                }).promise;

                // Extract the image region (approximate based on transform matrix)
                const sourceX = 0;
                const sourceY = Math.max(0, viewport.height - (yPosition * scale) - (image.height * scale));
                const sourceWidth = Math.min(image.width * scale, tempCanvas.width);
                const sourceHeight = Math.min(image.height * scale, tempCanvas.height);

                ctx.drawImage(tempCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, image.width, image.height);
                imageDrawn = true;
                console.log(`✓ Extracted image region for ${imageName}`);
              }
            }

            if (imageDrawn) {
              const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/png');
              });

              if (blob) {
                // Convert to base64 immediately for upload
                const arrayBuffer = await blob.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
                const imageBase64 = btoa(binary);

                // Upload to storage via edge function
                const timestamp = Date.now();
                const filePath = `${testType}/${section}/question_${question.question_number}_img${extractedImages.length + 1}_${timestamp}.png`;

                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData?.session?.access_token;

                if (token) {
                  const uploadResponse = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        filePath,
                        imageBase64,
                      }),
                    }
                  );

                  if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    extractedImages.push({
                      url: uploadData.publicUrl,
                      width: image.width,
                      height: image.height,
                      y: yPosition,
                    });
                    console.log(`✓ Uploaded image ${extractedImages.length}: ${image.width}x${image.height} at Y=${yPosition}`);
                  } else {
                    console.error(`Failed to upload image: ${uploadResponse.status}`);
                  }
                }
              }
            } else {
              console.log(`Could not extract image ${imageName} using any method`);
            }
          } else {
            console.log(`No canvas context available for ${imageName}`);
          }
        }

        // Sort images by Y position (top to bottom on page)
        // In PDF coordinates, Y increases from bottom to top, so we sort DESCENDING
        extractedImages.sort((a, b) => b.y - a.y);
        console.log(`✓ Extracted and sorted ${extractedImages.length} images (out of ${totalImageOps} total image ops)`);

        if (extractedImages.length === 0) {
          console.error(`❌ No images extracted for question ${question.question_number}!`);
          console.error(`Total image operations found: ${totalImageOps}`);
          console.error(`This means all ${totalImageOps} images were either filtered out or failed to extract`);
          throw new Error(`No images found on page ${question.page_number} for question ${question.question_number}`);
        }

        // Use Claude's image mapping to assign images correctly
        const imageMapping = (question as any).image_mapping;

        if (imageMapping) {
          // Map question image
          if (imageMapping.question && extractedImages[imageMapping.question - 1]) {
            question.image_url = extractedImages[imageMapping.question - 1].url;
            console.log(`✓ Mapped image #${imageMapping.question} to question`);
          }

          // Map option images
          const optionKeys = ['a', 'b', 'c', 'd', 'e'];
          const imageOptionsMap: any = {};
          let hasImageOptions = false;

          optionKeys.forEach((key) => {
            const mappingKey = `option_${key}`;
            if (imageMapping[mappingKey] && extractedImages[imageMapping[mappingKey] - 1]) {
              imageOptionsMap[key] = extractedImages[imageMapping[mappingKey] - 1].url;
              hasImageOptions = true;
              console.log(`✓ Mapped image #${imageMapping[mappingKey]} to option ${key}`);
            }
          });

          if (hasImageOptions) {
            question.image_options = imageOptionsMap;
          }

          console.log(`✓ Processed ${extractedImages.length} image(s) using Claude's mapping`);
        } else if (extractedImages.length > 0) {
          // Fallback if no mapping provided
          console.warn(`No image mapping from Claude, using fallback`);
          question.image_url = extractedImages[0].url;
        }
      } catch (pageError) {
        console.error(`Error extracting image from page ${question.page_number}:`, pageError);
      }
    }
  } catch (pdfError) {
    console.error('Error processing PDF for image extraction:', pdfError);
  }

  return questions;
}

export default function PDFToLatexConverterPage() {
  const navigate = useNavigate();

  // Mode: 'existing' or 'new'
  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  // PDF Tests from old system
  const [pdfTests, setPdfTests] = useState<PDFTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PDFTest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all'); // Filter by test_type
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('all'); // Filter by exercise_type
  const [duplicateTests, setDuplicateTests] = useState<PDFTest[]>([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());
  const [showPdfComparison, setShowPdfComparison] = useState(false);
  const [pdfNumPages, setPdfNumPages] = useState<Record<string, number>>({});

  // New test creation state
  const [newTestMetadata, setNewTestMetadata] = useState({
    test_type: '',
    exercise_type: 'Training',
    test_number: 1,
  });
  const [uploadedSections, setUploadedSections] = useState<{
    section: string;
    testPdfFile: File | null;
    testPdfUrl: string | null;
    solutionsPdfFile: File | null;
    solutionsPdfUrl: string | null;
    correctAnswers: string;
    questionCount: number;
  }[]>([]);
  const [currentSection, setCurrentSection] = useState({
    section: '',
    testPdfFile: null as File | null,
    solutionsPdfFile: null as File | null,
    correctAnswers: '',
    questionCount: 0,
  });

  // Section-by-section workflow state for new tests
  const [baseTestId, setBaseTestId] = useState<string | null>(null); // Shared test ID across sections
  const [savedSections, setSavedSections] = useState<string[]>([]); // Track which sections have been saved

  // Clear savedSections when test metadata changes (so sections from Training 1 don't grey out Training 2)
  useEffect(() => {
    if (mode === 'new') {
      setSavedSections([]);
    }
  }, [mode, newTestMetadata.test_type, newTestMetadata.exercise_type, newTestMetadata.test_number]);

  // Questions from old system
  const [oldQuestions, setOldQuestions] = useState<OldQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Converted questions
  const [convertedQuestions, setConvertedQuestions] = useState<ConvertedQuestion[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  const [converting, setConverting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [retryingImageIndex, setRetryingImageIndex] = useState<number | null>(null);

  // Manual image selection state
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageSelectorQuestionIndex, setImageSelectorQuestionIndex] = useState<number | null>(null);
  const [availableImages, setAvailableImages] = useState<{ url: string; width: number; height: number; y: number; blob: Blob }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageTarget, setSelectedImageTarget] = useState<'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'option_e'>('question');
  const [sharedImageQuestions, setSharedImageQuestions] = useState<number[]>([]); // For selecting multiple questions to share an image
  const [selectedPageForExtraction, setSelectedPageForExtraction] = useState<number>(1);
  const [totalPdfPages, setTotalPdfPages] = useState<number>(1);

  // Language selection modal
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<'ITA' | 'ENG' | 'BOTH'>('BOTH');
  const [pendingConversion, setPendingConversion] = useState<{ type: 'existing' | 'new'; data?: any } | null>(null);

  // Language toggle for viewing questions (ITA/ENG)
  const [viewLanguage, setViewLanguage] = useState<'ITA' | 'ENG'>('ITA');

  // Preview mode
  const [showPdfPreview, setShowPdfPreview] = useState(true);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);

  // API Usage & Cost
  const [apiUsage, setApiUsage] = useState<{
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd: number;
    cost_breakdown: {
      input_cost_usd: number;
      output_cost_usd: number;
    };
  } | null>(null);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Batch processing progress
  const [batchProgress, setBatchProgress] = useState<{
    show: boolean;
    currentBatch: number;
    totalBatches: number;
    questionsExtracted: number;
    status: string;
  }>({
    show: false,
    currentBatch: 0,
    totalBatches: 0,
    questionsExtracted: 0,
    status: '',
  });

  // Passage management modal
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [editingPassageId, setEditingPassageId] = useState<string | null>(null);
  const [selectedQuestionsForPassage, setSelectedQuestionsForPassage] = useState<number[]>([]);
  const [newPassageText, setNewPassageText] = useState('');
  const [detectingPassage, setDetectingPassage] = useState(false);
  const [pageRangeInput, setPageRangeInput] = useState('');

  useEffect(() => {
    loadPDFTests();
  }, []);

  const loadPDFTests = async () => {
    setLoadingTests(true);
    try {
      // Step 1: Load all PDF format tests from 2V_tests
      console.log('Loading PDF tests from 2V_tests...');
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('id, test_type, section, exercise_type, test_number, format')
        .eq('format', 'pdf')
        .eq('is_active', true)
        .order('test_type', { ascending: true })
        .order('exercise_type', { ascending: true })
        .order('test_number', { ascending: true });

      if (testsError) throw testsError;

      if (!testsData || testsData.length === 0) {
        console.log('No PDF tests found in 2V_tests');
        setPdfTests([]);
        return;
      }

      console.log(`Found ${testsData.length} PDF tests in 2V_tests`);

      // Step 2: Get ALL questions for ALL tests in ONE query (optimization!)
      const testIds = testsData.map(t => t.id);
      const { data: allQuestions, error: questionsError } = await supabase
        .from('2V_questions')
        .select('test_id, question_data')
        .in('test_id', testIds)
        .not('question_data->>pdf_url', 'is', null);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }

      // Step 3: Group questions by test_id and count them
      const questionsByTestId = new Map<string, { pdfUrl: string; count: number }>();

      if (allQuestions) {
        for (const q of allQuestions) {
          const existing = questionsByTestId.get(q.test_id);
          if (!existing && q.question_data?.pdf_url) {
            // First question with pdf_url for this test
            questionsByTestId.set(q.test_id, {
              pdfUrl: q.question_data.pdf_url,
              count: 1
            });
          } else if (existing) {
            // Increment count
            existing.count++;
          }
        }
      }

      // Step 4: Build the tests list
      const testsList: PDFTest[] = [];
      for (const test of testsData) {
        const questionData = questionsByTestId.get(test.id);
        if (!questionData) {
          console.warn(`No PDF questions found for test ${test.id}`);
          continue;
        }

        testsList.push({
          test_id: test.id,
          test_type: test.test_type,
          section: test.section,
          exercise_type: test.exercise_type,
          test_number: test.test_number,
          pdf_url: questionData.pdfUrl,
          question_count: questionData.count,
        });
      }

      console.log(`Successfully loaded ${testsList.length} tests with PDF URLs`);
      setPdfTests(testsList);
    } catch (err) {
      console.error('Error loading PDF tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load PDF tests');
    } finally {
      setLoadingTests(false);
    }
  };

  const handleSelectTest = async (test: PDFTest) => {
    setSelectedTest(test);
    setConvertedQuestions([]);
    setOldQuestions([]);
    setError(null);

    // Find duplicate tests with the same PDF URL or same test characteristics
    const duplicates = pdfTests.filter(t =>
      t.test_id !== test.test_id && (
        t.pdf_url === test.pdf_url ||
        (t.test_type === test.test_type &&
         t.section === test.section &&
         t.test_number === test.test_number)
      )
    );

    setDuplicateTests(duplicates);

    // Auto-select all duplicates with same PDF URL
    const autoSelectedDuplicates = new Set(
      duplicates
        .filter(d => d.pdf_url === test.pdf_url)
        .map(d => d.test_id)
    );
    setSelectedDuplicates(autoSelectedDuplicates);

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate tests for ${test.test_type} - ${test.section} #${test.test_number}`);
    }
  };

  const toggleDuplicateSelection = (testId: string) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const openAllPDFsSideBySide = () => {
    if (!selectedTest) return;
    setShowPdfComparison(true);
  };

  const handleExtractAndConvert = async () => {
    if (!selectedTest) {
      setError('No test selected');
      return;
    }

    // Show language selection modal
    setPendingConversion({ type: 'existing' });
    setShowLanguageModal(true);
  };

  const handleLanguageConfirm = async (languages: 'ITA' | 'ENG' | 'BOTH', useGoogleTranslate?: boolean) => {
    console.log(`🟢 PDFToLatexConverterPage: handleLanguageConfirm called with languages=${languages}, useGoogleTranslate=${useGoogleTranslate}`);
    setSelectedLanguages(languages);

    if (!pendingConversion) return;

    if (pendingConversion.type === 'existing') {
      await handleExtractAndConvertInternal(languages, useGoogleTranslate);
    } else if (pendingConversion.type === 'new' && pendingConversion.data) {
      const { metadata, sections } = pendingConversion.data;
      await handleConvertNewTestInternal(languages, metadata, sections, useGoogleTranslate);
    }

    setPendingConversion(null);
  };

  const handleExtractAndConvertInternal = async (languages: 'ITA' | 'ENG' | 'BOTH', useGoogleTranslate?: boolean) => {
    if (!selectedTest) {
      setError('No test selected');
      return;
    }

    setConverting(true);
    setError(null);
    setOldQuestions([]);
    setConvertedQuestions([]);
    setPassages([]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      // Step 1: Fetch questions from 2V_questions for this test_id
      console.log('Fetching questions from 2V_questions for test_id:', selectedTest.test_id);
      const { data: existingQuestions, error: fetchError } = await supabase
        .from('2V_questions')
        .select('question_number, answers')
        .eq('test_id', selectedTest.test_id)
        .order('question_number', { ascending: true });

      if (fetchError) throw fetchError;

      if (!existingQuestions || existingQuestions.length === 0) {
        throw new Error('No questions found in 2V_questions for this test. Please ensure questions exist first.');
      }

      console.log(`✓ Found ${existingQuestions.length} questions in 2V_questions`);

      // Step 2: Extract correct answers from 2V_questions
      const databaseAnswers = existingQuestions.map((q: any) => ({
        question_number: q.question_number,
        correct_answer: q.answers?.correct_answer || 'a',
      }));

      console.log(`Extracted ${databaseAnswers.length} answers from 2V_questions`);
      console.log('Sending PDF to AI for extraction...');

      // Step 3: Get PDF page count and process in batches of 4 pages
      const PAGES_PER_BATCH = 4;

      // Fetch PDF to get page count
      const pdfResponse = await fetch(selectedTest.pdf_url);
      const pdfArrayBuffer = await pdfResponse.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;

      const totalBatches = Math.ceil(totalPages / PAGES_PER_BATCH);
      console.log(`PDF has ${totalPages} pages, will process in ${totalBatches} batches of ${PAGES_PER_BATCH} pages`);

      // Show batch progress modal
      setBatchProgress({
        show: true,
        currentBatch: 0,
        totalBatches,
        questionsExtracted: 0,
        status: 'Starting extraction...',
      });

      let allExtractedQuestions: any[] = [];
      let allPassages: any[] = [];
      let totalUsage = {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        cost_usd: 0,
        cost_breakdown: {
          input_cost_usd: 0,
          output_cost_usd: 0,
        },
      };

      // Process each batch
      for (let batch = 0; batch < totalBatches; batch++) {
        const pageStart = batch * PAGES_PER_BATCH + 1;
        const pageEnd = Math.min((batch + 1) * PAGES_PER_BATCH, totalPages);

        setBatchProgress(prev => ({
          ...prev,
          currentBatch: batch + 1,
          status: `Processing pages ${pageStart}-${pageEnd}...`,
        }));

        console.log(`📄 Batch ${batch + 1}/${totalBatches}: Processing pages ${pageStart}-${pageEnd}`);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-questions-from-pdf`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              pdfUrl: selectedTest.pdf_url,
              testType: selectedTest.test_type,
              section: selectedTest.section,
              testNumber: selectedTest.test_number,
              databaseAnswers: databaseAnswers,
              pageStart,
              pageEnd,
              languages: languages,
              useGoogleTranslate: useGoogleTranslate || false,
            }),
          }
        );

        console.log(`🟡 API Call (existing test): Sending useGoogleTranslate=${useGoogleTranslate || false}, languages=${languages}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Batch ${batch + 1} failed: ${errorData.error || 'Failed to convert questions'}`);
        }

        const data = await response.json();

        if (data.questions && data.questions.length > 0) {
          allExtractedQuestions = [...allExtractedQuestions, ...data.questions];
          console.log(`✓ Batch ${batch + 1}: Extracted ${data.questions.length} questions (total: ${allExtractedQuestions.length})`);

          setBatchProgress(prev => ({
            ...prev,
            questionsExtracted: allExtractedQuestions.length,
          }));
        }

        // Collect passages from this batch
        if (data.passages && data.passages.length > 0) {
          allPassages = [...allPassages, ...data.passages];
          console.log(`✓ Batch ${batch + 1}: Found ${data.passages.length} passages (total: ${allPassages.length})`);
        }

        // Accumulate usage stats
        if (data.usage) {
          totalUsage.input_tokens += data.usage.input_tokens || 0;
          totalUsage.output_tokens += data.usage.output_tokens || 0;
          totalUsage.total_tokens += data.usage.total_tokens || 0;
          totalUsage.cost_usd += data.usage.cost_usd || 0;
          if (data.usage.cost_breakdown) {
            totalUsage.cost_breakdown.input_cost_usd += data.usage.cost_breakdown.input_cost_usd || 0;
            totalUsage.cost_breakdown.output_cost_usd += data.usage.cost_breakdown.output_cost_usd || 0;
          }
        }
      }

      // Hide batch progress modal
      setBatchProgress(prev => ({
        ...prev,
        show: false,
        status: 'Complete!',
      }));

      if (allExtractedQuestions.length === 0) {
        throw new Error('AI returned no questions from any batch');
      }

      // Filter out hallucinated questions (numbers higher than expected)
      const maxQuestionNumber = databaseAnswers.length;
      const validQuestions = allExtractedQuestions.filter(
        q => q.question_number >= 1 && q.question_number <= maxQuestionNumber
      );

      if (validQuestions.length !== allExtractedQuestions.length) {
        console.warn(`⚠️ Filtered out ${allExtractedQuestions.length - validQuestions.length} invalid questions (outside range 1-${maxQuestionNumber})`);
      }

      console.log(`✅ All batches complete! Extracted ${validQuestions.length} valid questions (filtered from ${allExtractedQuestions.length})`);
      if (allPassages.length > 0) {
        console.log(`📖 Found ${allPassages.length} shared passages`);
      }
      console.log('AI extraction complete, now extracting images from PDF...');

      // Use the filtered results
      const data = { questions: validQuestions, passages: allPassages, usage: totalUsage };

      // Process questions - handle graph recreation or image extraction
      const processedQuestions = [];
      for (const question of data.questions) {
        // If Claude recreated the graph, use that instead of extracting image
        if (question.recreate_graph || question.graph_function) {
          console.log(`Q${question.question_number}: Using recreated graph from Claude`);
          console.log(`  Graph type: ${question.graph_type || 'unknown'}`);
          console.log(`  Function: ${question.graph_function || question.graph_latex}`);
          console.log(`  Analysis: ${question.graph_analysis || 'none'}`);

          processedQuestions.push({
            ...question,
            has_graph_latex: true,
            // Skip image extraction for this question
            has_image: false,
            image_url: null
          });
        } else if (question.has_image && question.image_mapping) {
          // Only extract images if no graph recreation is available
          console.log(`Q${question.question_number}: Needs image extraction`);
          processedQuestions.push(question);
        } else {
          // No image or graph needed
          processedQuestions.push(question);
        }
      }

      // Extract images only for questions that need them
      const questionsNeedingImages = processedQuestions.filter(
        q => q.has_image && !q.has_graph_latex
      );

      let questionsWithImages = processedQuestions;
      if (questionsNeedingImages.length > 0) {
        console.log(`Extracting images for ${questionsNeedingImages.length} questions...`);
        questionsWithImages = await extractAndUploadImages(
          selectedTest.pdf_url,
          processedQuestions,
          selectedTest.test_type,
          selectedTest.section
        );
      }

      setConvertedQuestions(questionsWithImages);
      setPassages(data.passages || []);
      setApiUsage(data.usage || null);

      // Debug logging for image rendering
      console.log('=== CONVERTED QUESTIONS WITH IMAGES ===');
      questionsWithImages.forEach((q: any, idx) => {
        console.log(`Q${q.question_number}:`, {
          has_image: q.has_image,
          image_url: q.image_url,
          image_options: q.image_options,
          image_mapping: q.image_mapping,
          passage_id: q.passage_id
        });
      });

      if (data.passages && data.passages.length > 0) {
        console.log('=== PASSAGES ===');
        data.passages.forEach((p: any) => {
          console.log(`${p.passage_id}: Questions ${p.question_numbers?.join(', ')}`);
        });
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract and convert questions');
    } finally {
      setConverting(false);
      // Ensure modal is closed on completion or error
      setBatchProgress(prev => ({ ...prev, show: false }));
    }
  };

  const handleConvertNewTest = async (
    metadata: { test_type: string; exercise_type: string; test_number: number; languages?: 'ITA' | 'ENG' | 'BOTH' },
    sections: {
      section: string;
      testPdfFile: File | null;
      testPdfUrl: string | null;
      solutionsPdfFile: File | null;
      solutionsPdfUrl: string | null;
      correctAnswers: string;
      questionCount: number;
    }[]
  ) => {
    // If languages is provided (from NewTestCreator after modal), use it directly
    if (metadata.languages) {
      await handleConvertNewTestInternal(metadata.languages, metadata, sections, metadata.useGoogleTranslate);
      return;
    }

    // Otherwise show language selection modal
    setPendingConversion({ type: 'new', data: { metadata, sections } });
    setShowLanguageModal(true);
  };

  const handleConvertNewTestInternal = async (
    languages: 'ITA' | 'ENG' | 'BOTH',
    metadata: { test_type: string; exercise_type: string; test_number: number },
    sections: {
      section: string;
      testPdfFile: File | null;
      testPdfUrl: string | null;
      solutionsPdfFile: File | null;
      solutionsPdfUrl: string | null;
      correctAnswers: string;
      questionCount: number;
    }[],
    useGoogleTranslate?: boolean
  ) => {
    setConverting(true);
    setError(null);
    setConvertedQuestions([]);
    setPassages([]);
    setNewTestMetadata(metadata);
    setUploadedSections(sections);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      let allConvertedQuestions: any[] = [];
      let allPassages: any[] = [];
      let totalUsage = {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        cost_usd: 0,
        cost_breakdown: {
          input_cost_usd: 0,
          output_cost_usd: 0,
        },
      };

      // Process each section
      for (const section of sections) {
        if (!section.testPdfUrl) continue;

        console.log(`Processing section: ${section.section}`);

        // No database answers - AI will extract from solutions PDF
        const databaseAnswers = undefined;

        // Get PDF page count and process in batches
        const PAGES_PER_BATCH = 4;
        const pdfResponse = await fetch(section.testPdfUrl);
        const pdfArrayBuffer = await pdfResponse.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
        const totalPages = pdfDoc.numPages;

        const totalBatches = Math.ceil(totalPages / PAGES_PER_BATCH);
        console.log(`Section ${section.section}: ${totalPages} pages, ${totalBatches} batches`);

        // Show batch progress
        setBatchProgress({
          show: true,
          currentBatch: 0,
          totalBatches,
          questionsExtracted: allConvertedQuestions.length,
          status: `Processing section: ${section.section}`,
        });

        // Process each batch for this section
        for (let batch = 0; batch < totalBatches; batch++) {
          const pageStart = batch * PAGES_PER_BATCH + 1;
          const pageEnd = Math.min((batch + 1) * PAGES_PER_BATCH, totalPages);

          setBatchProgress(prev => ({
            ...prev,
            currentBatch: batch + 1,
            status: `${section.section}: Processing pages ${pageStart}-${pageEnd}...`,
          }));

          console.log(`🔍 API Call - Section: ${section.section}, Batch ${batch + 1}:`, {
            hasSolutionsPdf: !!section.solutionsPdfUrl,
            solutionsPdfUrl: section.solutionsPdfUrl ? section.solutionsPdfUrl.substring(0, 100) + '...' : 'NONE',
            testType: metadata.test_type,
            section: section.section,
            pageRange: `${pageStart}-${pageEnd}`
          });

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-questions-from-pdf`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                pdfUrl: section.testPdfUrl,
                solutionsPdfUrl: section.solutionsPdfUrl || undefined,
                testType: metadata.test_type,
                section: section.section,
                testNumber: metadata.test_number,
                databaseAnswers: databaseAnswers,
                pageStart,
                pageEnd,
                languages: languages,
                useGoogleTranslate: useGoogleTranslate || false,
              }),
            }
          );

          console.log(`🟡 API Call (new test): Sending useGoogleTranslate=${useGoogleTranslate || false}, languages=${languages} for section ${section.section}`);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Section ${section.section}, Batch ${batch + 1} failed: ${errorData.error || 'Failed to convert'}`);
          }

          const data = await response.json();

          console.log(`📥 API Response - Section: ${section.section}, Batch ${batch + 1}:`, {
            questionCount: data.questions?.length || 0,
            firstQuestionSample: data.questions?.[0] ? {
              question_number: data.questions[0].question_number,
              has_correct_answer: 'correct_answer' in data.questions[0],
              correct_answer: data.questions[0].correct_answer,
              has_options: !!data.questions[0].options,
              options_keys: data.questions[0].options ? Object.keys(data.questions[0].options) : []
            } : 'NO QUESTIONS'
          });

          if (data.questions && data.questions.length > 0) {
            // Add section info to each question
            const questionsWithSection = data.questions.map((q: any) => ({
              ...q,
              section: section.section,
            }));
            allConvertedQuestions = [...allConvertedQuestions, ...questionsWithSection];

            setBatchProgress(prev => ({
              ...prev,
              questionsExtracted: allConvertedQuestions.length,
            }));
          }

          if (data.passages && data.passages.length > 0) {
            allPassages = [...allPassages, ...data.passages];
          }

          if (data.usage) {
            totalUsage.input_tokens += data.usage.input_tokens || 0;
            totalUsage.output_tokens += data.usage.output_tokens || 0;
            totalUsage.total_tokens += data.usage.total_tokens || 0;
            totalUsage.cost_usd += data.usage.cost_usd || 0;
            if (data.usage.cost_breakdown) {
              totalUsage.cost_breakdown.input_cost_usd += data.usage.cost_breakdown.input_cost_usd || 0;
              totalUsage.cost_breakdown.output_cost_usd += data.usage.cost_breakdown.output_cost_usd || 0;
            }
          }
        }
      }

      // Hide batch progress
      setBatchProgress(prev => ({ ...prev, show: false }));

      if (allConvertedQuestions.length === 0) {
        throw new Error('No questions extracted from any section');
      }

      console.log(`All sections complete! Extracted ${allConvertedQuestions.length} questions`);

      // Process questions for images/graphs (similar to existing flow)
      const processedQuestions = [];
      for (const question of allConvertedQuestions) {
        if (question.recreate_graph || question.graph_function) {
          processedQuestions.push({
            ...question,
            has_graph_latex: true,
            has_image: false,
            image_url: null
          });
        } else {
          processedQuestions.push(question);
        }
      }

      // Extract images if needed
      const questionsNeedingImages = processedQuestions.filter(q => q.has_image && !q.has_graph_latex);

      let questionsWithImages = processedQuestions;
      if (questionsNeedingImages.length > 0) {
        console.log(`Extracting images for ${questionsNeedingImages.length} questions...`);

        // Group questions by section for image extraction
        const questionsBySection = new Map<string, any[]>();
        processedQuestions.forEach(q => {
          const section = q.section;
          if (!questionsBySection.has(section)) {
            questionsBySection.set(section, []);
          }
          questionsBySection.get(section)!.push(q);
        });

        // Extract images for each section
        let allQuestionsWithImages: any[] = [];
        for (const [sectionName, sectionQuestions] of questionsBySection.entries()) {
          const sectionData = sections.find(s => s.section === sectionName);
          if (sectionData && sectionData.testPdfUrl) {
            const withImages = await extractAndUploadImages(
              sectionData.testPdfUrl,
              sectionQuestions,
              metadata.test_type,
              sectionName
            );
            allQuestionsWithImages = [...allQuestionsWithImages, ...withImages];
          } else {
            allQuestionsWithImages = [...allQuestionsWithImages, ...sectionQuestions];
          }
        }
        questionsWithImages = allQuestionsWithImages;
      }

      setConvertedQuestions(questionsWithImages);
      setPassages(allPassages);
      setApiUsage(totalUsage);

      console.log(`✅ Conversion complete! ${questionsWithImages.length} questions ready`);
    } catch (err) {
      console.error('New test conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert new test');
    } finally {
      setConverting(false);
      setBatchProgress(prev => ({ ...prev, show: false }));
    }
  };

  const handleSaveQuestions = async () => {
    if (convertedQuestions.length === 0) {
      setError('No questions to save');
      return;
    }

    // Validate based on mode
    if (mode === 'existing' && !selectedTest) {
      setError('No test selected');
      return;
    }

    if (mode === 'new' && !newTestMetadata.test_type) {
      setError('Invalid test metadata');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Get current user for audit trail
      const { data: { user } } = await supabase.auth.getUser();

      let testId: string;
      let testType: string;
      let pdfUrl: string;

      // Handle NEW test mode: Create test first
      if (mode === 'new') {
        console.log('Creating new test in database...');

        // Use first section's PDF URL as the main test PDF URL
        const firstSection = uploadedSections[0];
        if (!firstSection || !firstSection.testPdfUrl) {
          throw new Error('No PDF URL found for new test');
        }

        // Find or create user profile in 2V_profiles
        let profileId: string | null = null;
        if (user?.id) {
          // Query existing profile by auth_uid
          const { data: existingProfile } = await supabase
            .from('2V_profiles')
            .select('id')
            .eq('auth_uid', user.id)
            .single();

          if (existingProfile) {
            profileId = existingProfile.id;
          } else {
            // Create new profile
            const newProfileId = crypto.randomUUID();
            const { error: insertError } = await supabase
              .from('2V_profiles')
              .insert({
                id: newProfileId,
                auth_uid: user.id,
                email: user.email,
                name: user.email?.split('@')[0] || 'Admin',
                roles: '["ADMIN"]',
              });

            if (!insertError) {
              profileId = newProfileId;
            } else {
              console.warn('Could not create profile:', insertError);
            }
          }
        }

        // Determine section: use "Multi-topic" for multi-section tests, otherwise use the specific section
        const sectionValue = uploadedSections.length > 1 ? 'Multi-topic' : firstSection.section;

        // Check if test already exists (including section to match unique constraint)
        const { data: existingTest } = await supabase
          .from('2V_tests')
          .select('id')
          .eq('test_type', newTestMetadata.test_type)
          .eq('section', sectionValue)
          .eq('exercise_type', newTestMetadata.exercise_type)
          .eq('test_number', newTestMetadata.test_number)
          .eq('format', 'interactive')
          .single();

        if (existingTest) {
          // Test exists - reuse it, don't create new entry
          testId = existingTest.id;
          console.log(`✓ Test already exists, reusing test_id: ${testId}`);
        } else {
          // New test - create ONE entry in 2V_tests
          testId = crypto.randomUUID();

          const { error: testInsertError } = await supabase
            .from('2V_tests')
            .insert({
              id: testId,
              test_type: newTestMetadata.test_type,
              section: sectionValue,
              exercise_type: newTestMetadata.exercise_type,
              test_number: newTestMetadata.test_number,
              format: 'interactive',
              is_active: true,
              created_by: profileId,
            });

          if (testInsertError) {
            console.error('Error inserting test:', testInsertError);
            throw new Error(`Failed to create test: ${testInsertError.message}`);
          }
          console.log(`✓ Created new test in 2V_tests with id: ${testId}`);
        }
        testType = newTestMetadata.test_type;
        pdfUrl = firstSection.testPdfUrl;
      } else {
        // EXISTING test mode: Use existing test
        testId = selectedTest!.test_id;
        testType = selectedTest!.test_type;
        pdfUrl = selectedTest!.pdf_url;
      }

      // Prepare conversion info for audit trail
      const conversionInfo = {
        converted_from: 'pdf',
        converted_to: 'multiple_choice',
        converted_at: new Date().toISOString(),
        converted_by: user?.id || null,
        ai_model: 'claude-sonnet-4-5',
        ai_cost_usd: apiUsage?.cost_usd || 0,
        ai_tokens: apiUsage ? {
          input: apiUsage.input_tokens,
          output: apiUsage.output_tokens,
          total: apiUsage.total_tokens
        } : null,
        pdf_url: pdfUrl,
        questions_converted: convertedQuestions.length,
        // Track special features
        has_image_extraction: convertedQuestions.some((q: any) => q.has_image && q.image_url),
        has_graph_recreation: convertedQuestions.some((q: any) => q.has_graph_latex || q.recreate_graph),
        has_generated_options: convertedQuestions.some((q: any) => q.generated_options),
        mode: mode, // Track whether this was existing or new test
      };

      // Images already extracted during conversion phase
      // Create a map of passages by ID for easy lookup
      const passageMap = new Map(passages.map(p => [p.passage_id, p]));

      // For new tests, we need to assign questions to their respective test sections
      const testIdsBySection = new Map<string, string>();
      if (mode === 'new') {
        uploadedSections.forEach(section => {
          testIdsBySection.set(section.section, `${testId}_${section.section}`);
        });
      }

      // Transform to new format and UPDATE/INSERT questions
      const questionsToUpdate = convertedQuestions.map((q: any) => {
        // Get passage data if this question references one
        const passage = q.passage_id ? passageMap.get(q.passage_id) : null;

        // For new tests, use the section-specific test ID
        const questionTestId = mode === 'new' && testIdsBySection.has(q.section)
          ? testIdsBySection.get(q.section)!
          : testId;

        return {
          test_id: questionTestId,
          test_type: testType,
          question_number: q.question_number,
          question_type: 'multiple_choice',
          section: q.section,
          question_data: {
            question_text: q.question_text,
            question_text_eng: q.question_text_eng,
            options: q.options,
            options_eng: q.options_eng,
            pdf_url: pdfUrl,
            page_number: q.page_number,
            has_image: q.has_image || false,
            image_url: q.image_url || null,
            image_options: q.image_options || null,
            // Passage data for reading comprehension
            passage_id: q.passage_id || null,
            passage_text: passage?.passage_text || null,
            passage_text_eng: passage?.passage_text_eng || null,
            passage_title: passage?.passage_title || null,
            // New fields for graph recreation
            has_graph_latex: q.has_graph_latex || false,
            graph_latex: q.graph_latex || null,
            graph_function: q.graph_function || null,
            graph_analysis: q.graph_analysis || null,
            graph_type: q.graph_type || null,
            graph_features: q.graph_features || null,
            graph_domain: q.graph_domain || null,
            graph_range: q.graph_range || null,
            // Generated options for graph questions
            generated_options: q.generated_options || false,
            recreate_all_options: q.recreate_all_options || false,
          },
          answers: {
            correct_answer: q.correct_answer || 'a',
            wrong_answers: q.options ? Object.keys(q.options).filter((key) => key !== q.correct_answer) : [],
          },
          conversion_info: conversionInfo,
          is_active: true,
        };
      });

      // Prepare questions for all selected tests (main + duplicates)
      // For new tests, only use the main test ID. For existing tests, include duplicates
      const allTestIds = mode === 'new'
        ? [testId]
        : [testId, ...Array.from(selectedDuplicates)];

      console.log(`Preparing questions for ${allTestIds.length} test(s)`);

      // Fetch existing question IDs (if questions already exist, we'll reuse their IDs)
      // Skip this for new tests since they won't have existing questions
      const { data: existingQuestions } = mode === 'new'
        ? { data: null }
        : await supabase
            .from('2V_questions')
            .select('id, test_id, question_number')
            .in('test_id', allTestIds);

      const existingIdMap = new Map<string, string>(); // "test_id:question_number" -> id
      (existingQuestions || []).forEach((q: any) => {
        existingIdMap.set(`${q.test_id}:${q.question_number}`, q.id);
      });

      console.log(`Found ${existingIdMap.size} existing questions to reuse IDs from`);

      // Generate or reuse UUIDs for all questions across all tests
      // This allows us to set duplicate_question_ids BEFORE insertion
      const questionIdMap = new Map<string, string[]>(); // question_number -> [id1, id2, ...]

      convertedQuestions.forEach((q: any) => {
        const ids: string[] = [];
        allTestIds.forEach((tId) => {
          // Reuse existing ID if question exists, otherwise generate new one
          const key = `${tId}:${q.question_number}`;
          const existingId = existingIdMap.get(key);
          ids.push(existingId || crypto.randomUUID());
        });
        questionIdMap.set(q.question_number.toString(), ids);
      });

      // Create questions for each test WITH duplicate_question_ids already set
      const allQuestionsToUpdate: any[] = [];

      allTestIds.forEach((currentTestId, testIndex) => {
        const testQuestions = convertedQuestions.map((q: any) => {
          const questionIds = questionIdMap.get(q.question_number.toString())!;
          const currentQuestionId = questionIds[testIndex];

          // Get all OTHER question IDs (duplicates in other tests)
          const duplicateIds = questionIds.filter((_, idx) => idx !== testIndex);

          // Get passage data if this question references one
          const passage = q.passage_id ? passageMap.get(q.passage_id) : null;

          return {
            id: currentQuestionId, // Pre-generated UUID
            test_id: currentTestId,
            test_type: testType,
            question_number: q.question_number,
            question_type: 'multiple_choice',
            section: q.section,
            question_data: {
              question_text: q.question_text,
              question_text_eng: q.question_text_eng,
              options: q.options,
              options_eng: q.options_eng,
              pdf_url: pdfUrl,
              page_number: q.page_number,
              has_image: q.has_image || false,
              image_url: q.image_url || null,
              image_options: q.image_options || null,
              // Passage data for reading comprehension
              passage_id: q.passage_id || null,
              passage_text: passage?.passage_text || null,
              passage_text_eng: passage?.passage_text_eng || null,
              passage_title: passage?.passage_title || null,
              has_graph_latex: q.has_graph_latex || false,
              graph_latex: q.graph_latex || null,
              graph_function: q.graph_function || null,
              graph_analysis: q.graph_analysis || null,
              graph_type: q.graph_type || null,
              graph_features: q.graph_features || null,
              graph_domain: q.graph_domain || null,
              graph_range: q.graph_range || null,
              generated_options: q.generated_options || false,
              recreate_all_options: q.recreate_all_options || false,
            },
            answers: {
              correct_answer: q.correct_answer || 'a',
              wrong_answers: q.options ? Object.keys(q.options).filter((key) => key !== q.correct_answer) : [],
            },
            conversion_info: conversionInfo,
            is_active: true,
            // Set duplicate links immediately (only if there are duplicates)
            duplicate_question_ids: duplicateIds.length > 0 ? duplicateIds : [],
          };
        });
        allQuestionsToUpdate.push(...testQuestions);
      });

      console.log(`Inserting ${allQuestionsToUpdate.length} questions in ONE batch with duplicate links already set`);
      console.log('========== SOURCE CONVERTED QUESTIONS (first 2) ==========');
      convertedQuestions.slice(0, 2).forEach(q => {
        console.log(JSON.stringify({
          question_number: q.question_number,
          correct_answer: q.correct_answer,
          has_options: !!q.options,
          options_keys: q.options ? Object.keys(q.options) : []
        }, null, 2));
      });
      console.log('==========================================================');

      // Validate and clean question_data structure before insert
      allQuestionsToUpdate.forEach((q, idx) => {
        const data = q.question_data as any;

        // Remove empty options (e.g., option e if it's empty for SAT 4-option questions)
        if (data.options) {
          Object.keys(data.options).forEach(key => {
            if (!data.options[key] || data.options[key].trim() === '') {
              delete data.options[key];
            }
          });
        }

        // If no valid options exist, change to open_ended
        const hasOptions = data.options && typeof data.options === 'object' && Object.keys(data.options).length > 0;
        if (q.question_type === 'multiple_choice' && !hasOptions) {
          console.log(`✓ Converting Q${q.question_number} (${q.section}) to open_ended (no options found)`);
          q.question_type = 'open_ended';
          // Ensure options is removed for open_ended questions
          delete data.options;
          // Update answers structure - open_ended questions have empty wrong_answers array
          q.answers = { correct_answer: q.answers.correct_answer || 'a', wrong_answers: [] };
        }

        if (q.question_type === 'multiple_choice') {
          if (!data.question_text || !data.options || !data.options.a || !data.options.b) {
            console.error(`❌ INVALID Q${q.question_number} (${q.section}):`, {
              question_type: q.question_type,
              question_text_length: data.question_text?.length || 0,
              options_keys: Object.keys(data.options || {}),
              option_a: data.options?.a,
              option_b: data.options?.b,
              full_data: data
            });
          }
        }
      });

      // Debug: Log a few questions to see their structure
      console.log('Sample questions being inserted (with defaults applied):');
      allQuestionsToUpdate.slice(0, 3).forEach(q => {
        console.log(`Q${q.question_number} (${q.question_type}):`, {
          has_options: !!q.question_data.options,
          answers_json: JSON.stringify(q.answers),
          correct_answer: q.answers.correct_answer,
          wrong_answers_count: q.answers.wrong_answers?.length || 0
        });
      });

      // Insert ALL questions in ONE operation with duplicate_question_ids already set
      const { error: updateError } = await supabase
        .from('2V_questions')
        .upsert(allQuestionsToUpdate, {
          onConflict: 'test_id,question_number,section',
        });

      if (updateError) {
        throw updateError;
      }

      console.log(`✓ Successfully inserted ${allQuestionsToUpdate.length} questions with duplicate links`);

      // Update test format from 'pdf' to 'interactive' for existing tests only
      // New tests already have the correct format set
      if (mode === 'existing') {
        const { error: testUpdateError } = await supabase
          .from('2V_tests')
          .update({ format: 'interactive' })
          .in('id', allTestIds);

        if (testUpdateError) {
          console.warn('Error updating test format:', testUpdateError);
          // Don't throw - questions are saved, format update is secondary
        }
        console.log(`✓ Updated ${allTestIds.length} test(s) format to interactive`);
      }

      console.log(`✅ Successfully saved ${allTestIds.length} test(s) with ${convertedQuestions.length} questions each`);
      console.log(`📍 Current mode: ${mode}, saveSuccess will be set to TRUE`);

      setSaveSuccess(true);

      // For existing tests, navigate back to admin
      if (mode === 'existing') {
        setTimeout(() => navigate('/admin'), 2000);
      }

      // For new tests, clear converted questions and show NewTestCreator again
      // This allows user to add another section or finish
      if (mode === 'new') {
        // Add current section(s) to saved sections list
        const currentSections = uploadedSections.map(s => s.section);
        setSavedSections(prev => [...prev, ...currentSections]);

        // Clear state to show NewTestCreator form again
        setTimeout(() => {
          setConvertedQuestions([]);
          setPassages([]);
          setUploadedSections([]);
          setSaveSuccess(false);
        }, 2000); // 2 second delay to show success message
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  // Handler for adding another section after saving current one
  const handleAddAnotherSection = () => {
    // Add current section(s) to saved sections list
    const currentSections = uploadedSections.map(s => s.section);
    setSavedSections(prev => [...prev, ...currentSections]);

    // Clear converted questions and go back to form
    setConvertedQuestions([]);
    setPassages([]);
    setUploadedSections([]);
    setError(null);
    setSaveSuccess(false);
  };

  const handleEditQuestion = (index: number, field: string, value: string) => {
    const updated = [...convertedQuestions];
    if (field === 'correct_answer') {
      updated[index].correct_answer = value;
    } else if (field.startsWith('option_')) {
      const optionKey = field.replace('option_', '') as keyof typeof updated[number]['options'];
      updated[index].options[optionKey] = value;
    } else if (field === 'question_text') {
      updated[index].question_text = value;
    }
    setConvertedQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    setConvertedQuestions(convertedQuestions.filter((_, i) => i !== index));
  };

  const handleConvertTableToLatex = async (index: number) => {
    const question = convertedQuestions[index];

    // Use a simpler regex-based approach to convert plain text tables to LaTeX
    try {
      setConverting(true);

      let convertedText = question.question_text;

      // Try to detect and convert simple table patterns
      // Pattern: lines with | separators
      const lines = convertedText.split('\n');
      let inTable = false;
      let tableLines: string[] = [];
      let nonTableLines: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Detect table rows (lines with | separators)
        if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 3) {
          if (!inTable) {
            inTable = true;
            tableLines = [];
          }
          // Remove leading/trailing pipes and split
          const cells = trimmedLine.split('|').map(c => c.trim()).filter(c => c);
          tableLines.push(cells);
        } else if (inTable && trimmedLine.length === 0) {
          // End of table
          inTable = false;

          if (tableLines.length > 0) {
            // Convert to LaTeX array
            const numCols = Math.max(...tableLines.map(row => row.length));
            const colSpec = '|' + 'l|'.repeat(numCols);

            let latexTable = `$$\\begin{array}{${colSpec}}\n\\hline\n`;

            tableLines.forEach((row, idx) => {
              const latexRow = row.map(cell => `\\text{${cell}}`).join(' & ');
              latexTable += latexRow + ' \\\\\n';
              if (idx === 0) {
                latexTable += '\\hline\n';
              }
            });

            latexTable += '\\hline\n\\end{array}$$';
            nonTableLines.push(latexTable);
            tableLines = [];
          }
        } else if (!inTable) {
          nonTableLines.push(line);
        }
      }

      // Handle table at end of text
      if (tableLines.length > 0) {
        const numCols = Math.max(...tableLines.map(row => row.length));
        const colSpec = '|' + 'l|'.repeat(numCols);

        let latexTable = `$$\\begin{array}{${colSpec}}\n\\hline\n`;

        tableLines.forEach((row, idx) => {
          const latexRow = row.map(cell => `\\text{${cell}}`).join(' & ');
          latexTable += latexRow + ' \\\\\n';
          if (idx === 0) {
            latexTable += '\\hline\n';
          }
        });

        latexTable += '\\hline\n\\end{array}$$';
        nonTableLines.push(latexTable);
      }

      convertedText = nonTableLines.join('\n');

      // Update the question
      const updated = [...convertedQuestions];
      updated[index].question_text = convertedText;
      setConvertedQuestions(updated);

      console.log('✓ Table converted to LaTeX');
    } catch (err) {
      console.error('Error converting table:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert table');
    } finally {
      setConverting(false);
    }
  };

  const handleRetryImageExtraction = async (index: number) => {
    if (!selectedTest) return;

    setRetryingImageIndex(index);
    const question = convertedQuestions[index] as any;

    try {
      console.log(`Retrying image extraction for question ${question.question_number}...`);

      // Fetch PDF
      const pdfResponse = await fetch(selectedTest.pdf_url);
      const pdfBlob = await pdfResponse.blob();
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();

      // Load PDF
      const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
      const pdfDoc = await loadingTask.promise;

      if (!question.page_number || question.page_number > pdfDoc.numPages) {
        throw new Error(`Invalid page number ${question.page_number}`);
      }

      // Get the page
      const page = await pdfDoc.getPage(question.page_number);

      // Render page to ensure all objects are loaded
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx!,
        viewport: viewport,
      }).promise;

      console.log('Page rendered, all objects loaded');

      // Get operator list to find image names and their positions
      const ops = await page.getOperatorList();
      const allImagesOnPage: any[] = [];

      // STEP 1: Collect all valid images first
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const imageName = ops.argsArray[i][0];

          try {
            // Get the actual image object from the page
            const image = await page.objs.get(imageName);

            if (image && image.width && image.height) {
              console.log(`[RETRY] Found image object ${imageName}: ${image.width}x${image.height}, has bitmap: ${!!image.bitmap}, has data: ${!!image.data}`);

              // Process ALL images first, we'll filter by aspect ratio later
              if (true) {  // Process all images
                // Get transform matrix from operator args to find Y position
                let yPosition = 0;

                // Look back in the operator list for the transform that applies to this image
                for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
                  if (ops.fnArray[j] === pdfjsLib.OPS.transform ||
                      ops.fnArray[j] === pdfjsLib.OPS.setMatrix) {
                    const matrix = ops.argsArray[j];
                    if (matrix && matrix.length >= 6) {
                      yPosition = matrix[5]; // Y coordinate is the 6th element
                      break;
                    }
                  }
                }

                // Collect all images
                allImagesOnPage.push({
                  imageName,
                  image,
                  yPosition,
                  width: image.width,
                  height: image.height
                });
              }
            } else {
              console.log(`[RETRY] Image ${imageName} missing dimensions or invalid`);
            }
          } catch (err) {
            // Silently skip unresolvable images
            const errMsg = err instanceof Error ? err.message : '';
            if (!errMsg.includes('resolved yet')) {
              console.warn(`[RETRY] Could not get image ${imageName}:`, err);
            }
          }
        }
      }

      // Sort images by Y position (top to bottom)
      allImagesOnPage.sort((a, b) => b.yPosition - a.yPosition);

      console.log(`[RETRY] Collected ${allImagesOnPage.length} valid images`);

      // STEP 2: Filter out headers and footers
      let imagesToProcess = [];

      // If we have exactly 3 images, it's likely header, content, footer pattern
      if (allImagesOnPage.length === 3) {
        console.log(`[RETRY] Found exactly 3 images - assuming header/content/footer pattern`);
        // Take the middle one (index 1)
        imagesToProcess = [allImagesOnPage[1]];
        console.log(`[RETRY] Keeping middle image as content: ${allImagesOnPage[1].width}x${allImagesOnPage[1].height}`);
      } else {
        // For other cases, use aspect ratio filtering
        for (const img of allImagesOnPage) {
          const aspectRatio = img.width / img.height;
          const isLikelyHeaderFooter = aspectRatio > 8;

          if (isLikelyHeaderFooter) {
            console.log(`[RETRY] Filtering out header/footer: ${img.width}x${img.height} (aspect ratio: ${aspectRatio.toFixed(1)})`);
          } else {
            console.log(`[RETRY] Keeping content image: ${img.width}x${img.height} (aspect ratio: ${aspectRatio.toFixed(1)})`);
            imagesToProcess.push(img);
          }
        }
      }

      const extractedImages: { url: string; width: number; height: number; y: number }[] = [];

      // STEP 3: Process and upload the remaining images
      for (const imgData of imagesToProcess) {
        const { image, imageName, yPosition } = imgData;

        console.log(`[RETRY] Processing image ${imageName}: ${image.width}x${image.height} at Y=${yPosition}`);

        // Create a canvas and draw the image directly
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          let imageDrawn = false;

          // Try different methods to extract the image
          if (image.bitmap) {
            // Method 1: Use bitmap if available
            console.log(`[RETRY] Drawing bitmap for ${imageName}`);
            ctx.drawImage(image.bitmap, 0, 0);
            imageDrawn = true;
          } else if (image.data) {
            // Method 2: Use raw image data if available
            console.log(`[RETRY] Using raw data for ${imageName}`);
            const imageData = ctx.createImageData(image.width, image.height);

            // Handle different data formats
            if (image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray) {
              imageData.data.set(image.data);
            } else if (Array.isArray(image.data)) {
              for (let i = 0; i < image.data.length; i++) {
                imageData.data[i] = image.data[i];
              }
            }

            ctx.putImageData(imageData, 0, 0);
            imageDrawn = true;
          } else {
            // Method 3: Try to render the page region where the image should be
            console.log(`[RETRY] Attempting page region extraction for ${imageName}`);

            // Create a temporary canvas to render the full page
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            const scale = 2.0; // Higher scale for better quality
            const tempViewport = page.getViewport({ scale });

            tempCanvas.width = tempViewport.width;
            tempCanvas.height = tempViewport.height;

            if (tempCtx) {
              await page.render({
                canvasContext: tempCtx,
                viewport: tempViewport,
              }).promise;

              // Extract the image region (approximate based on transform matrix)
              const sourceX = 0;
              const sourceY = Math.max(0, tempViewport.height - (yPosition * scale) - (image.height * scale));
              const sourceWidth = Math.min(image.width * scale, tempCanvas.width);
              const sourceHeight = Math.min(image.height * scale, tempCanvas.height);

              ctx.drawImage(tempCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, image.width, image.height);
              imageDrawn = true;
              console.log(`[RETRY] ✓ Extracted image region for ${imageName}`);
            }
          }

          if (imageDrawn) {
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/png');
            });

            if (blob) {
              // Convert to base64 immediately for upload
              const arrayBuffer = await blob.arrayBuffer();
              const bytes = new Uint8Array(arrayBuffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const imageBase64 = btoa(binary);

              // Upload to storage via edge function
              const timestamp = Date.now();
              const filePath = `${selectedTest.test_type}/${selectedTest.section}/question_${question.question_number}_img${extractedImages.length + 1}_${timestamp}.png`;

              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData?.session?.access_token;

              if (token) {
                const uploadResponse = await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      filePath,
                      imageBase64,
                    }),
                  }
                );

                if (uploadResponse.ok) {
                  const uploadData = await uploadResponse.json();
                  extractedImages.push({
                    url: uploadData.publicUrl,
                    width: image.width,
                    height: image.height,
                    y: yPosition,
                  });
                  console.log(`[RETRY] ✓ Uploaded image ${extractedImages.length}: ${image.width}x${image.height} at Y=${yPosition}`);
                } else {
                  console.error(`[RETRY] Failed to upload image: ${uploadResponse.status}`);
                }
              }
            }
          } else {
            console.log(`[RETRY] Could not extract image ${imageName} using any method`);
          }
        } else {
          console.log(`[RETRY] No canvas context available for ${imageName}`);
        }
      }

      // Sort images by Y position (top to bottom on page)
      extractedImages.sort((a, b) => b.y - a.y);
      console.log(`✓ Sorted ${extractedImages.length} images by position (top to bottom)`);

      if (extractedImages.length === 0) {
        throw new Error('No images found on this page');
      }

      // Update question in state - use Claude's mapping if available
      const updatedQuestions = [...convertedQuestions];
      const imageMapping = (question as any).image_mapping;

      if (imageMapping) {
        // Map question image
        // Note: Claude's numbering starts at 1 and refers to CONTENT images (after header/footer removal)
        if (imageMapping.question && extractedImages[imageMapping.question - 1]) {
          (updatedQuestions[index] as any).image_url = extractedImages[imageMapping.question - 1].url;
          console.log(`✓ Mapped content image #${imageMapping.question} to question`);
        }

        // Map option images
        const optionKeys = ['a', 'b', 'c', 'd', 'e'];
        const imageOptionsMap: any = {};
        let hasImageOptions = false;

        optionKeys.forEach((key) => {
          const mappingKey = `option_${key}`;
          if (imageMapping[mappingKey] && extractedImages[imageMapping[mappingKey] - 1]) {
            imageOptionsMap[key] = extractedImages[imageMapping[mappingKey] - 1].url;
            hasImageOptions = true;
            console.log(`✓ Mapped image #${imageMapping[mappingKey]} to option ${key}`);
          }
        });

        if (hasImageOptions) {
          (updatedQuestions[index] as any).image_options = imageOptionsMap;
        }
      } else {
        // Fallback if no mapping provided
        if (extractedImages.length === 1) {
          (updatedQuestions[index] as any).image_url = extractedImages[0].url;
        } else {
          // Multiple images - store main (largest) and all options
          const largest = extractedImages.reduce((max, img) =>
            (img.width * img.height > max.width * max.height) ? img : max
          );
          (updatedQuestions[index] as any).image_url = largest.url;
          (updatedQuestions[index] as any).image_options = extractedImages.map(img => img.url);
        }
      }
      setConvertedQuestions(updatedQuestions);

      console.log(`✓ Successfully extracted and uploaded ${extractedImages.length} image(s)`);
    } catch (err) {
      console.error('Error retrying image extraction:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract image');
    } finally {
      setRetryingImageIndex(null);
    }
  };

  // Open manual image selector modal
  const openImageSelector = async (index: number, target: 'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'option_e' = 'question') => {
    // Get PDF URL from either selected test or uploaded sections
    let pdfUrl: string | null = null;
    if (selectedTest) {
      pdfUrl = selectedTest.pdf_url;
    } else if (uploadedSections.length > 0 && uploadedSections[0].testPdfUrl) {
      pdfUrl = uploadedSections[0].testPdfUrl;
    }

    if (!pdfUrl) {
      alert('No PDF available for image extraction');
      return;
    }

    setImageSelectorQuestionIndex(index);
    setSelectedImageTarget(target);
    setShowImageSelector(true);
    setLoadingImages(true);
    setAvailableImages([]);
    setSharedImageQuestions([index]); // Initialize with current question selected

    const question = convertedQuestions[index] as any;

    try {
      // Fetch PDF
      const pdfResponse = await fetch(pdfUrl);
      const pdfBlob = await pdfResponse.blob();
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();

      // Load PDF
      const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
      const pdfDoc = await loadingTask.promise;

      // Store total pages for page selector
      setTotalPdfPages(pdfDoc.numPages);

      // Set initial page to question's page or page 1
      const initialPage = question.page_number && question.page_number <= pdfDoc.numPages ? question.page_number : 1;
      setSelectedPageForExtraction(initialPage);

      // Load images from the initial page
      await loadImagesFromPage(pdfDoc, initialPage);
    } catch (err) {
      console.error('Error loading images for manual selection:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
      setLoadingImages(false);
    }
  };

  // Helper function to load images from a specific page
  const loadImagesFromPage = async (pdfDoc: any, pageNumber: number) => {
    setLoadingImages(true);
    setAvailableImages([]);

    try {
      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        throw new Error(`Invalid page number ${pageNumber}`);
      }

      // Get the page
      const page = await pdfDoc.getPage(pageNumber);

      // Render page to ensure all objects are loaded
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx!,
        viewport: viewport,
      }).promise;

      // Get operator list to find all images
      const ops = await page.getOperatorList();
      const allImages: { url: string; width: number; height: number; y: number; blob: Blob }[] = [];

      // Collect ALL images (no filtering)
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
          const imageName = ops.argsArray[i][0];

          try {
            const image = await page.objs.get(imageName);

            if (image && image.width && image.height) {
              // Get Y position
              let yPosition = 0;
              for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
                if (ops.fnArray[j] === pdfjsLib.OPS.transform ||
                    ops.fnArray[j] === pdfjsLib.OPS.setMatrix) {
                  const matrix = ops.argsArray[j];
                  if (matrix && matrix.length >= 6) {
                    yPosition = matrix[5];
                    break;
                  }
                }
              }

              // Create canvas and draw image
              const imgCanvas = document.createElement('canvas');
              imgCanvas.width = image.width;
              imgCanvas.height = image.height;
              const imgCtx = imgCanvas.getContext('2d');

              if (imgCtx) {
                let imageDrawn = false;

                if (image.bitmap) {
                  imgCtx.drawImage(image.bitmap, 0, 0);
                  imageDrawn = true;
                } else if (image.data) {
                  const imageData = imgCtx.createImageData(image.width, image.height);
                  if (image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray) {
                    imageData.data.set(image.data);
                  }
                  imgCtx.putImageData(imageData, 0, 0);
                  imageDrawn = true;
                }

                if (imageDrawn) {
                  const blob = await new Promise<Blob | null>((resolve) => {
                    imgCanvas.toBlob(resolve, 'image/png');
                  });

                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    allImages.push({
                      url,
                      width: image.width,
                      height: image.height,
                      y: yPosition,
                      blob,
                    });
                  }
                }
              }
            }
          } catch (err) {
            // Skip unresolvable images
          }
        }
      }

      // Sort by Y position (top to bottom)
      allImages.sort((a, b) => b.y - a.y);
      setAvailableImages(allImages);
      console.log(`[Manual Selection] Found ${allImages.length} images on page ${pageNumber}`);
    } catch (err) {
      console.error('Error loading images for manual selection:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoadingImages(false);
    }
  };

  // Handle page change in manual image selector
  const handlePageChange = async (newPage: number) => {
    if (!selectedTest) return;

    setSelectedPageForExtraction(newPage);

    // Reload PDF and extract images from the new page
    try {
      const pdfResponse = await fetch(selectedTest.pdf_url);
      const pdfBlob = await pdfResponse.blob();
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
      const pdfDoc = await loadingTask.promise;

      await loadImagesFromPage(pdfDoc, newPage);
    } catch (err) {
      console.error('Error changing page:', err);
      setError(err instanceof Error ? err.message : 'Failed to load page');
    }
  };

  // Handle selecting an image from the manual selector
  const handleSelectImage = async (imageIndex: number) => {
    if (imageSelectorQuestionIndex === null || !selectedTest || sharedImageQuestions.length === 0) return;

    const selectedImage = availableImages[imageIndex];
    const question = convertedQuestions[imageSelectorQuestionIndex] as any;

    try {
      // Upload the selected image to storage
      const arrayBuffer = await selectedImage.blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const imageBase64 = btoa(binary);

      const timestamp = Date.now();
      const filePath = `${selectedTest.test_type}/${selectedTest.section}/question_${question.question_number}_manual_${timestamp}.png`;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No auth token available');
      }

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64,
          }),
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      const publicUrl = uploadData.publicUrl;

      // Update ALL selected questions with the shared image
      const updatedQuestions = [...convertedQuestions];

      // Get question numbers for linking
      const linkedQuestionNumbers = sharedImageQuestions.map(idx => convertedQuestions[idx].question_number);

      for (const qIndex of sharedImageQuestions) {
        if (selectedImageTarget === 'question') {
          (updatedQuestions[qIndex] as any).image_url = publicUrl;
          // Store linked questions info
          if (sharedImageQuestions.length > 1) {
            (updatedQuestions[qIndex] as any).shared_image_questions = linkedQuestionNumbers;
          }
        } else {
          // Handle option images (only for primary question)
          if (qIndex === imageSelectorQuestionIndex) {
            const optionKey = selectedImageTarget.replace('option_', '');
            if (!(updatedQuestions[qIndex] as any).image_options) {
              (updatedQuestions[qIndex] as any).image_options = {};
            }
            (updatedQuestions[qIndex] as any).image_options[optionKey] = publicUrl;
          }
        }
      }

      setConvertedQuestions(updatedQuestions);
      setShowImageSelector(false);

      // Clean up object URLs
      availableImages.forEach(img => URL.revokeObjectURL(img.url));
      setAvailableImages([]);

      const questionsList = linkedQuestionNumbers.join(', ');
      console.log(`✓ Manually selected and uploaded image for question(s) ${questionsList}`);
    } catch (err) {
      console.error('Error uploading selected image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  // Toggle question selection for shared image
  const toggleSharedQuestion = (index: number) => {
    setSharedImageQuestions(prev => {
      if (prev.includes(index)) {
        // Don't allow deselecting if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  // Close image selector and clean up
  const closeImageSelector = () => {
    setShowImageSelector(false);
    setImageSelectorQuestionIndex(null);
    // Clean up object URLs
    availableImages.forEach(img => URL.revokeObjectURL(img.url));
    setAvailableImages([]);
  };

  return (
    <MathJaxProvider>
      <Layout pageTitle="PDF to LaTeX Converter" pageSubtitle="Convert PDF questions to interactive LaTeX format">
        <div className="flex-1 p-4 md:p-8 bg-gray-50">
          <div className="max-w-full mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Admin Dashboard</span>
          </button>

          {/* Status Messages - Full Width */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-start gap-3">
              <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-3xl" />
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">
                      {mode === 'new'
                        ? 'Section saved successfully!'
                        : 'Questions saved successfully!'}
                    </h3>
                    <p className="text-green-700">
                      {mode === 'new'
                        ? 'Returning to form to add more sections...'
                        : 'Redirecting to admin dashboard...'}
                    </p>
                  </div>
                </div>
                {mode === 'new' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Done - Go to Admin
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          {convertedQuestions.length === 0 && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode('existing')}
                    className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                      mode === 'existing'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Convert Existing Test
                  </button>
                  <button
                    onClick={() => setMode('new')}
                    className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                      mode === 'new'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Create New Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batch Progress Modal */}
          {batchProgress.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-brand-green" />
                  Extracting Questions
                </h3>

                <div className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Batch {batchProgress.currentBatch} of {batchProgress.totalBatches}</span>
                      <span>{Math.round((batchProgress.currentBatch / batchProgress.totalBatches) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-brand-green to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(batchProgress.currentBatch / batchProgress.totalBatches) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <p className="text-gray-600">{batchProgress.status}</p>

                  {/* Questions extracted */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">Questions extracted so far:</p>
                    <p className="text-2xl font-bold text-brand-dark">{batchProgress.questionsExtracted}</p>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Processing 4 pages per batch to ensure accurate extraction
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Passage Management Modal */}
          {showPassageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-brand-dark">
                    {editingPassageId ? `Edit Passage: ${editingPassageId}` : 'Create New Passage'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowPassageModal(false);
                      setEditingPassageId(null);
                      setSelectedQuestionsForPassage([]);
                      setNewPassageText('');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* AI Detection */}
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <label className="block text-sm font-semibold text-purple-700 mb-2">
                    🤖 Let Claude Find the Passage
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pageRangeInput}
                      onChange={(e) => setPageRangeInput(e.target.value)}
                      placeholder="e.g., pages 13-16, questions 9-13"
                      className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={detectingPassage}
                    />
                    <button
                      onClick={async () => {
                        if (!selectedTest || !pageRangeInput) return;

                        setDetectingPassage(true);
                        try {
                          const { data: sessionData } = await supabase.auth.getSession();
                          const token = sessionData?.session?.access_token;

                          // Parse page range
                          const pageMatch = pageRangeInput.match(/pages?\s*(\d+)(?:\s*-\s*(\d+))?/i);
                          const questionMatch = pageRangeInput.match(/questions?\s*(\d+)(?:\s*-\s*(\d+))?/i);

                          const pageStart = pageMatch ? parseInt(pageMatch[1]) : undefined;
                          const pageEnd = pageMatch && pageMatch[2] ? parseInt(pageMatch[2]) : pageStart;

                          const questionStart = questionMatch ? parseInt(questionMatch[1]) : undefined;
                          const questionEnd = questionMatch && questionMatch[2] ? parseInt(questionMatch[2]) : questionStart;

                          // Call API to extract just the passage
                          const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-questions-from-pdf`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                pdfUrl: selectedTest.pdf_url,
                                testType: selectedTest.test_type,
                                section: selectedTest.section,
                                testNumber: selectedTest.test_number,
                                pageStart,
                                pageEnd,
                                extractPassageOnly: true,
                                targetQuestions: questionStart && questionEnd ?
                                  Array.from({length: questionEnd - questionStart + 1}, (_, i) => questionStart + i) :
                                  selectedQuestionsForPassage,
                                languages: selectedLanguages,
                              }),
                            }
                          );

                          if (response.ok) {
                            const data = await response.json();
                            if (data.passages && data.passages.length > 0) {
                              setNewPassageText(data.passages[0].passage_text || '');

                              // Auto-select questions if Claude identified them
                              if (data.passages[0].question_numbers) {
                                setSelectedQuestionsForPassage(data.passages[0].question_numbers);
                              }
                            } else if (data.extractedText) {
                              // Fallback: raw text extraction
                              setNewPassageText(data.extractedText);
                            }
                          }
                        } catch (error) {
                          console.error('Failed to detect passage:', error);
                        } finally {
                          setDetectingPassage(false);
                        }
                      }}
                      disabled={detectingPassage || !pageRangeInput}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 font-semibold flex items-center gap-2"
                    >
                      {detectingPassage ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faMagic} />
                          Detect
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Enter page numbers and/or question numbers where the passage appears
                  </p>
                </div>

                {/* Passage Text */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Passage Text
                    </label>
                    <span className="text-xs text-gray-500">
                      {(newPassageText || passages.find(p => p.passage_id === editingPassageId)?.passage_text || '').length} characters
                    </span>
                  </div>
                  <textarea
                    value={newPassageText || (editingPassageId ? passages.find(p => p.passage_id === editingPassageId)?.passage_text : '')}
                    onChange={(e) => setNewPassageText(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                    rows={10}
                    placeholder="Enter the shared passage text or use AI detection above... (No length limit - passages can be as long as needed)"
                    style={{ minHeight: '250px', maxHeight: '500px' }}
                  />
                </div>

                {/* Select Questions */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Questions to this Passage
                  </label>
                  <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {convertedQuestions.map((q) => (
                      <button
                        key={q.question_number}
                        onClick={() => {
                          setSelectedQuestionsForPassage(prev =>
                            prev.includes(q.question_number)
                              ? prev.filter(n => n !== q.question_number)
                              : [...prev, q.question_number]
                          );
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          selectedQuestionsForPassage.includes(q.question_number)
                            ? 'bg-amber-500 text-white'
                            : q.passage_id
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Q{q.question_number}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {selectedQuestionsForPassage.length} questions
                    {selectedQuestionsForPassage.length > 0 && ` (${selectedQuestionsForPassage.sort((a,b) => a-b).join(', ')})`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowPassageModal(false);
                      setEditingPassageId(null);
                      setSelectedQuestionsForPassage([]);
                      setNewPassageText('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const passageId = editingPassageId || `passage_${passages.length + 1}`;
                      const passageText = newPassageText || passages.find(p => p.passage_id === editingPassageId)?.passage_text || '';

                      // Update or create passage
                      if (editingPassageId) {
                        setPassages(prev => prev.map(p =>
                          p.passage_id === editingPassageId
                            ? { ...p, passage_text: passageText, question_numbers: selectedQuestionsForPassage }
                            : p
                        ));
                      } else {
                        setPassages(prev => [...prev, {
                          passage_id: passageId,
                          passage_text: passageText,
                          question_numbers: selectedQuestionsForPassage
                        }]);
                      }

                      // Update questions with passage_id
                      setConvertedQuestions(prev => prev.map(q => ({
                        ...q,
                        passage_id: selectedQuestionsForPassage.includes(q.question_number) ? passageId :
                          (q.passage_id === editingPassageId && !selectedQuestionsForPassage.includes(q.question_number) ? null : q.passage_id)
                      })));

                      setShowPassageModal(false);
                      setEditingPassageId(null);
                      setSelectedQuestionsForPassage([]);
                      setNewPassageText('');
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold"
                  >
                    {editingPassageId ? 'Update Passage' : 'Create Passage'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Test Selection Panel - Shows before conversion (EXISTING MODE) */}
          {convertedQuestions.length === 0 && mode === 'existing' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faMagic} className="text-white" />
                  </div>
                  Select PDF Test to Convert
                </h2>

                {loadingTests ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-5xl text-brand-green mb-4" />
                    <p className="text-gray-600 text-lg">Loading PDF tests...</p>
                  </div>
                ) : pdfTests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No PDF tests found in database</p>
                  </div>
                ) : (
                  <>
                    {/* Filters */}
                    <div className="mb-6 space-y-4">
                      {/* Search Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          🔍 Search
                        </label>
                        <input
                          type="text"
                          placeholder="Search by test type, section, test number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-base"
                        />
                      </div>

                      {/* Filter Dropdowns */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Track Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🎯 Track
                          </label>
                          <select
                            value={selectedTrack}
                            onChange={(e) => setSelectedTrack(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-base bg-white"
                          >
                            <option value="all">All Tracks</option>
                            {Array.from(new Set(pdfTests.map(t => t.test_type))).sort().map(track => (
                              <option key={track} value={track}>{track}</option>
                            ))}
                          </select>
                        </div>

                        {/* Exercise Type Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📚 Exercise Type
                          </label>
                          <select
                            value={selectedExerciseType}
                            onChange={(e) => setSelectedExerciseType(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-base bg-white"
                          >
                            <option value="all">All Types</option>
                            <option value="Training">Training</option>
                            <option value="Assessment Monotematico">Assessment Monotematico</option>
                            <option value="Assessment Iniziale">Assessment Iniziale</option>
                            <option value="Simulazione">Simulazione</option>
                          </select>
                        </div>
                      </div>

                      {/* Results Count */}
                      <div className="text-sm text-gray-600">
                        Showing {pdfTests.filter(test => {
                          const matchesSearch = !searchTerm ||
                            test.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            test.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            test.test_number.toString().includes(searchTerm) ||
                            test.exercise_type.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesTrack = selectedTrack === 'all' || test.test_type === selectedTrack;
                          const matchesExerciseType = selectedExerciseType === 'all' || test.exercise_type === selectedExerciseType;
                          return matchesSearch && matchesTrack && matchesExerciseType;
                        }).length} of {pdfTests.length} tests
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto mb-6">
                      {pdfTests
                        .filter(test => {
                          const matchesSearch = !searchTerm ||
                            test.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            test.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            test.test_number.toString().includes(searchTerm) ||
                            test.exercise_type.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesTrack = selectedTrack === 'all' || test.test_type === selectedTrack;
                          const matchesExerciseType = selectedExerciseType === 'all' || test.exercise_type === selectedExerciseType;
                          return matchesSearch && matchesTrack && matchesExerciseType;
                        })
                        .map((test, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectTest(test)}
                          disabled={converting}
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                            selectedTest === test
                              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-lg'
                              : 'border-gray-200 hover:border-indigo-300 bg-white hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon/Badge */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                              selectedTest === test
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              #{test.test_number}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 text-lg mb-1 truncate">
                                {test.test_type}
                              </div>
                              <div className="text-sm text-gray-600 mb-2 truncate">
                                {test.section}
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  test.exercise_type === 'Simulazione' ? 'bg-purple-100 text-purple-800' :
                                  test.exercise_type === 'Assessment Monotematico' ? 'bg-blue-100 text-blue-800' :
                                  test.exercise_type === 'Assessment Iniziale' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {test.exercise_type}
                                </span>
                                <span className="text-xs text-gray-500">
                                  📄 {test.question_count} questions
                                </span>
                              </div>
                            </div>

                            {/* Selection Indicator */}
                            {selectedTest === test && (
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-white text-lg" />
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Selected Test Actions */}
                    {selectedTest && (
                      <div className="border-t-2 border-gray-200 pt-6">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6">
                          <h3 className="text-lg font-bold text-brand-dark mb-3">Selected Test</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Test Type:</span>
                              <p className="text-brand-dark">{selectedTest.test_type}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Section:</span>
                              <p className="text-brand-dark">{selectedTest.section}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Exercise Type:</span>
                              <p className="text-brand-dark">{selectedTest.exercise_type}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Test Number:</span>
                              <p className="text-brand-dark">#{selectedTest.test_number}</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-purple-200">
                            <span className="font-semibold text-gray-700 text-sm">PDF URL:</span>
                            <a
                              href={selectedTest.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-800 hover:underline text-sm mt-1 break-all"
                            >
                              {selectedTest.pdf_url}
                            </a>
                          </div>
                        </div>

                        {/* Duplicate Tests Warning */}
                        {duplicateTests.length > 0 && (
                          <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-xl mb-6">
                            <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                              <FontAwesomeIcon icon={faTimesCircle} className="text-yellow-600" />
                              ⚠️ Duplicate Tests Found!
                            </h3>
                            <p className="text-sm text-yellow-700 mb-4">
                              Found {duplicateTests.length} other test(s) with the same content.
                              Select which ones should be updated with the converted questions:
                            </p>

                            {/* Open All PDFs Button */}
                            <button
                              onClick={openAllPDFsSideBySide}
                              className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                              📄 Open All PDFs Side by Side ({duplicateTests.length + 1} tests)
                            </button>

                            <div className="space-y-3">
                              {duplicateTests.map((dupTest) => (
                                <div key={dupTest.test_id} className="bg-white p-4 rounded-lg border-2 border-yellow-200">
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedDuplicates.has(dupTest.test_id)}
                                      onChange={() => toggleDuplicateSelection(dupTest.test_id)}
                                      className="mt-1 w-5 h-5 text-brand-green"
                                    />
                                    <div className="flex-1">
                                      <div className="font-semibold text-brand-dark">
                                        {dupTest.test_type} - {dupTest.section}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {dupTest.exercise_type} #{dupTest.test_number}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {dupTest.pdf_url === selectedTest.pdf_url ? (
                                          <span className="text-green-600 font-semibold">✓ Same PDF</span>
                                        ) : (
                                          <span className="text-orange-600">⚠ Different PDF - verify manually</span>
                                        )}
                                      </div>
                                      <a
                                        href={dupTest.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                      >
                                        View PDF →
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                              <p className="text-xs text-yellow-800">
                                💡 <strong>Tip:</strong> Tests with the same PDF are auto-selected.
                                Review PDFs before converting to ensure they're identical.
                              </p>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleExtractAndConvert}
                          disabled={converting}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-4"
                        >
                          {converting ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl" />
                              <div className="text-left">
                                <div>Extracting & Converting...</div>
                                <div className="text-sm font-normal opacity-90">AI is working its magic, this may take 30-60 seconds</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faMagic} className="text-3xl" />
                              <div className="text-left">
                                <div>Extract & Convert to LaTeX with AI</div>
                                <div className="text-sm font-normal opacity-90">Automatically extract PDF + convert math to LaTeX</div>
                              </div>
                            </>
                          )}
                        </button>

                        {oldQuestions.length > 0 && !converting && (
                          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                            <p className="text-blue-800 font-semibold">
                              ✓ Found {oldQuestions.length} questions in database
                            </p>
                            <p className="text-sm text-blue-700 mt-1">Click the button above to convert them to LaTeX format</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Empty State */}
                {!selectedTest && pdfTests.length > 0 && (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-5xl text-gray-300 mb-3">👆</div>
                    <p className="text-gray-600 font-medium">Select a test above to get started</p>
                    <p className="text-sm text-gray-500 mt-2">AI will automatically extract and convert questions from the PDF</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Test Creation Panel - Shows before conversion (NEW MODE) */}
          {convertedQuestions.length === 0 && mode === 'new' && (
            <NewTestCreator
              onConvert={handleConvertNewTest}
              converting={converting}
              savedSections={savedSections}
            />
          )}

          {/* Full Screen Preview Mode - Real Test View */}
          {fullScreenPreview && convertedQuestions.length > 0 && (
            <div className="fixed inset-0 bg-white z-50 overflow-auto">
              {/* Exit Full Screen Button */}
              <button
                onClick={() => setFullScreenPreview(false)}
                className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-xl z-50"
              >
                ✕ Exit Full Screen
              </button>

              {/* Questions Only - Exactly as students will see */}
              <div className="max-w-4xl mx-auto p-8 pt-20">
                {convertedQuestions.map((question, index) => (
                  <div key={index} className="mb-12 pb-8 border-b-2 border-gray-200 last:border-0">
                    {/* Question Number */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-brand-dark">
                        Question {question.question_number}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div className="mb-6 text-lg">
                      <MathJaxRenderer>{question.question_text}</MathJaxRenderer>

                      {/* Graph Recreation (if provided by Claude) */}
                      {((question as any).recreate_graph || (question as any).graph_function) && (
                        <AdvancedGraphRenderer
                          question={question}
                          className="mt-4"
                        />
                      )}

                      {/* Question Image (fallback if no graph recreation) */}
                      {(question as any).image_url && !(question as any).has_graph_latex && (
                        <div className="mt-4">
                          <img
                            src={(question as any).image_url}
                            alt={`Question ${question.question_number}`}
                            className="max-w-full border-2 border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    {question.options && (
                      <div className="space-y-3">
                        {Object.entries(question.options).map(([key, value]) => {
                          const hasImageOption = !!(question as any).image_options?.[key];
                          const imageUrl = (question as any).image_options?.[key];

                          return (
                            <div key={key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg">
                                {key.toUpperCase()}
                              </span>
                              <div className="flex-1 pt-1">
                                {hasImageOption ? (
                                  <img
                                    src={imageUrl}
                                    alt={`Option ${key.toUpperCase()}`}
                                    className="max-w-full border border-gray-300 rounded"
                                  />
                                ) : (
                                  <div className="text-lg">
                                    <MathJaxRenderer>{value}</MathJaxRenderer>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results View - PDF Left (Fixed), Questions Right */}
          {!fullScreenPreview && convertedQuestions.length > 0 && (mode === 'existing' ? selectedTest : mode === 'new') && (
            <div className={`${showPdfPreview ? 'lg:grid lg:grid-cols-2 lg:gap-6' : ''}`}>
              {/* Left Panel: PDF Viewer - Fixed on left */}
              {showPdfPreview && (mode === 'existing' ? selectedTest : uploadedSections.length > 0) && (
                <>
                  {/* Fixed PDF Panel */}
                  <div className="bg-white rounded-xl shadow-xl p-6 lg:fixed lg:left-8 lg:top-4 lg:w-[calc(50%-2rem)] lg:h-[calc(100vh-32px)] overflow-hidden flex flex-col z-10">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                      <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                        <span className="text-2xl">📄</span>
                        PDF Preview
                      </h2>
                      <a
                        href={mode === 'existing' ? selectedTest?.pdf_url : uploadedSections[0]?.testPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Open in new tab →
                      </a>
                    </div>
                    <div className="flex-1 overflow-hidden rounded-lg border-2 border-gray-300">
                      <iframe
                        src={mode === 'existing' ? selectedTest?.pdf_url : uploadedSections[0]?.testPdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                  {/* Spacer to account for fixed panel */}
                  <div className="hidden lg:block" />
                </>
              )}

              {/* Right Panel: Converted Questions */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Converted Questions ({convertedQuestions.length})
                    </h2>

                    {/* Language Toggle - Only show if questions have both languages */}
                    {convertedQuestions.length > 0 &&
                     convertedQuestions.some(q => q.question_text_eng || q.options_eng) && (
                      <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg p-1">
                        <button
                          onClick={() => setViewLanguage('ITA')}
                          className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                            viewLanguage === 'ITA'
                              ? 'bg-brand-blue text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          🇮🇹 Italian
                        </button>
                        <button
                          onClick={() => setViewLanguage('ENG')}
                          className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                            viewLanguage === 'ENG'
                              ? 'bg-brand-blue text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          🇬🇧 English
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFullScreenPreview(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                      title="Preview questions exactly as students will see them"
                    >
                      📱 Full Screen Preview
                    </button>
                    <button
                      onClick={handleSaveQuestions}
                      disabled={saving}
                      className="bg-brand-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          Approve & Save
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* API Usage & Cost */}
                {apiUsage && (
                  <div className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-purple-900 flex items-center gap-2">
                        <span>💰</span> API Usage & Cost
                      </h3>
                      <span className="text-2xl font-bold text-purple-900">
                        ${apiUsage.cost_usd.toFixed(4)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-gray-600 text-xs">Input Tokens</p>
                        <p className="font-bold text-purple-900">{apiUsage.input_tokens.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">${apiUsage.cost_breakdown.input_cost_usd.toFixed(4)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-gray-600 text-xs">Output Tokens</p>
                        <p className="font-bold text-purple-900">{apiUsage.output_tokens.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">${apiUsage.cost_breakdown.output_cost_usd.toFixed(4)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-gray-600 text-xs">Total Tokens</p>
                        <p className="font-bold text-purple-900">{apiUsage.total_tokens.toLocaleString()}</p>
                        <p className="text-xs text-green-600 font-semibold">Claude Sonnet 4.5</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add New Passage Button */}
                {convertedQuestions.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingPassageId(null);
                        setSelectedQuestionsForPassage([]);
                        setNewPassageText('');
                        setPageRangeInput('');
                        setShowPassageModal(true);
                      }}
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 font-semibold flex items-center gap-2"
                    >
                      <span>📖</span>
                      Add Passage
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {convertedQuestions.map((question, index) => {
                    // Check if this question starts a passage group
                    const passage = question.passage_id ? passages.find(p => p.passage_id === question.passage_id) : null;
                    const isFirstInPassage = passage &&
                      convertedQuestions.findIndex(q => q.passage_id === passage.passage_id) === index;

                    return (
                      <div key={index}>
                        {/* Show passage before the first question that uses it */}
                        {isFirstInPassage && passage && (
                          <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                <span>📖</span>
                                {passage.passage_title || 'Shared Passage'}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                  For Questions: {convertedQuestions
                                    .filter(q => q.passage_id === passage.passage_id)
                                    .map(q => q.question_number)
                                    .join(', ')}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingPassageId(passage.passage_id);
                                    const linkedQuestions = convertedQuestions.filter(q => q.passage_id === passage.passage_id);
                                    setSelectedQuestionsForPassage(linkedQuestions.map(q => q.question_number));
                                    setNewPassageText(passage.passage_text || '');
                                    setPageRangeInput('');
                                    setShowPassageModal(true);
                                  }}
                                  className="text-amber-600 hover:text-amber-800 text-sm"
                                  title="Edit passage"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-gray-700 whitespace-pre-wrap overflow-x-auto">
                              <MathJaxRenderer>
                                {viewLanguage === 'ENG' && passage.passage_text_eng
                                  ? passage.passage_text_eng
                                  : passage.passage_text || ''}
                              </MathJaxRenderer>
                            </div>
                          </div>
                        )}

                        {/* Question Card */}
                        <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-brand-green transition-colors">
                          {/* Question Header */}
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                            <h3 className="font-bold text-brand-dark text-lg">
                              Question {question.question_number}
                              {question.passage_id && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                  📖 {question.passage_id}
                                </span>
                              )}
                            </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConvertTableToLatex(index)}
                            disabled={converting}
                            className="text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Convert table to LaTeX format"
                          >
                            <FontAwesomeIcon icon={faTable} />
                          </button>
                          <button
                            onClick={() => {
                              setImageSelectorQuestionIndex(index);
                              setShowImageSelector(true);
                            }}
                            className="text-green-600 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                            title={question.image_url ? "Edit image" : "Add image"}
                          >
                            <FontAwesomeIcon icon={faImage} />
                          </button>
                          <button
                            onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit question"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(index)}
                            className="text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete question"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      {editingIndex === index ? (
                        <textarea
                          value={question.question_text}
                          onChange={(e) => handleEditQuestion(index, 'question_text', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg mb-3 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      ) : (
                        <div className="bg-blue-50 p-4 rounded-lg mb-3 border border-blue-200 overflow-x-auto">
                          <MathJaxRenderer>
                            {viewLanguage === 'ENG' && question.question_text_eng
                              ? question.question_text_eng
                              : question.question_text}
                          </MathJaxRenderer>

                          {/* Display image(s) if present */}
                          {(question as any).image_url && (
                            <div className="mt-3 space-y-2">
                              {/* Shared image indicator */}
                              {(question as any).shared_image_questions && (question as any).shared_image_questions.length > 1 && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm">
                                  <span className="font-semibold text-indigo-700">Shared image:</span>
                                  <span className="text-indigo-600 ml-1">
                                    Questions {(question as any).shared_image_questions.join(', ')}
                                  </span>
                                </div>
                              )}
                              <div className="border-2 border-indigo-300 rounded-lg overflow-hidden">
                                <img
                                  src={(question as any).image_url}
                                  alt={`Question ${question.question_number} diagram`}
                                  className="w-full"
                                />
                              </div>
                              {(question as any).image_options && (question as any).image_options.length > 1 && (
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Additional images found ({(question as any).image_options.length} total):
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {(question as any).image_options.map((url: string, idx: number) => (
                                      <div key={idx} className="border border-gray-300 rounded overflow-hidden">
                                        <img
                                          src={url}
                                          alt={`Image ${idx + 1}`}
                                          className="w-full"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show indicator if image extraction failed */}
                          {(question as any).has_image &&
                           !(question as any).image_url &&
                           !(question as any).image_options && (
                            <div className="mt-3 p-3 bg-red-50 border-2 border-red-400 rounded-lg">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 text-sm text-red-900">
                                  ⚠️ Failed to extract image from page {(question as any).page_number}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRetryImageExtraction(index)}
                                    disabled={retryingImageIndex === index}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold text-sm"
                                  >
                                    {retryingImageIndex === index ? (
                                      <>
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        Retrying...
                                      </>
                                    ) : (
                                      <>
                                        <FontAwesomeIcon icon={faRedo} />
                                        Retry
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => openImageSelector(index, 'question')}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-semibold text-sm"
                                  >
                                    <FontAwesomeIcon icon={faImage} />
                                    Select Manually
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Button to change existing image */}
                          {(question as any).image_url && (
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => openImageSelector(index, 'question')}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm"
                              >
                                <FontAwesomeIcon icon={faExchangeAlt} />
                                Change Image
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options */}
                      {question.options && (
                        <>
                          <div className="space-y-2 mb-3">
                            {Object.entries(question.options).map(([key, value]) => {
                              // Debug log for image options
                              const hasImageOption = !!(question as any).image_options?.[key];
                              const imageUrl = (question as any).image_options?.[key];
                              if (index === 0 && key === 'a') {
                                console.log(`[DEBUG] Q${question.question_number} Option ${key}:`, {
                                  hasImageOption,
                                  imageUrl,
                                  allImageOptions: (question as any).image_options
                                });
                              }

                              return (
                                <div key={key} className="flex items-start gap-2">
                                  <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                                    question.correct_answer === key
                                      ? 'bg-green-600 text-white shadow-md'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {key.toUpperCase()}
                                  </span>
                                  {editingIndex === index ? (
                                    <input
                                      type="text"
                                      value={value}
                                      onChange={(e) => handleEditQuestion(index, `option_${key}`, e.target.value)}
                                      className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                  ) : (
                                    <div className={`flex-1 ${question.correct_answer === key ? 'bg-green-50 rounded-lg p-2' : 'p-2'}`}>
                                      {/* Show option image if exists */}
                                      {hasImageOption ? (
                                        <div className="border-2 border-indigo-400 rounded-lg overflow-hidden bg-white p-2">
                                          <img
                                            src={imageUrl}
                                            alt={`Option ${key.toUpperCase()}`}
                                            className="w-full"
                                            onError={(e) => {
                                              console.error(`Failed to load image for option ${key}:`, imageUrl);
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                            onLoad={() => {
                                              console.log(`✓ Successfully loaded image for option ${key}`);
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="py-2 px-3">
                                          <MathJaxRenderer>
                                            {viewLanguage === 'ENG' && question.options_eng?.[key]
                                              ? question.options_eng[key]
                                              : value}
                                          </MathJaxRenderer>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Correct Answer Selector */}
                          <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="font-semibold text-green-900">✓ Correct Answer:</span>
                            <select
                              value={question.correct_answer}
                              onChange={(e) => handleEditQuestion(index, 'correct_answer', e.target.value)}
                              className="px-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white font-bold text-green-900"
                        >
                          {Object.keys(question.options).map((key) => (
                            <option key={key} value={key}>
                              {key.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                        </>
                      )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save Button */}
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={handleSaveQuestions}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="text-xl" />
                        Approve & Save {convertedQuestions.length} Questions to New System
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Questions will NOT be saved until you click this button
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </Layout>

      {/* PDF Comparison Modal */}
      {showPdfComparison && selectedTest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          {/* Modal Header */}
          <div className="bg-white p-4 flex justify-between items-center shadow-lg">
            <h2 className="text-xl font-bold text-brand-dark">
              Compare PDFs - {selectedTest.test_type} {selectedTest.section} #{selectedTest.test_number}
            </h2>
            <button
              onClick={() => setShowPdfComparison(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {/* PDF Viewers Side by Side with Single Scroll */}
          <div className="flex-1 overflow-auto p-2 bg-gray-100">
            {(() => {
              const allTests = [
                { test: selectedTest, isMain: true },
                ...duplicateTests.map(d => ({ test: d, isMain: false }))
              ];
              const maxPages = Math.max(...Object.values(pdfNumPages), 10);

              return (
                <div className="space-y-4">
                  {Array.from({ length: maxPages }, (_, pageIndex) => (
                    <div key={pageIndex} className="flex gap-2">
                      {allTests.map(({ test, isMain }, testIndex) => (
                        <div key={testIndex} className="flex-1 flex flex-col bg-white rounded-lg shadow-xl overflow-hidden">
                          {/* Show header only on first page */}
                          {pageIndex === 0 && (
                            <div className={`p-3 ${
                              isMain
                                ? 'bg-blue-600'
                                : test.pdf_url === selectedTest.pdf_url
                                  ? 'bg-green-600'
                                  : 'bg-orange-600'
                            } text-white`}>
                              <div className="font-bold">
                                {isMain
                                  ? '🎯 Selected Test'
                                  : `${test.pdf_url === selectedTest.pdf_url ? '✓' : '⚠'} Duplicate ${testIndex}`
                                }
                              </div>
                              <div className="text-sm">
                                {test.test_type} - {test.section} #{test.test_number}
                              </div>
                              <div className="text-xs opacity-90 mt-1 truncate">
                                {test.exercise_type}
                              </div>
                            </div>
                          )}

                          {/* PDF Page */}
                          <div className="p-2 bg-gray-50 flex justify-center">
                            <Document
                              file={test.pdf_url}
                              onLoadSuccess={(pdf) => {
                                setPdfNumPages(prev => ({
                                  ...prev,
                                  [test.test_id]: pdf.numPages
                                }));
                              }}
                              loading={
                                <div className="flex items-center justify-center h-96">
                                  <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-gray-400" />
                                </div>
                              }
                            >
                              {(pdfNumPages[test.test_id] ?? 0) > pageIndex && (
                                <Page
                                  pageNumber={pageIndex + 1}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                  width={Math.floor(window.innerWidth / allTests.length) - 60}
                                />
                              )}
                            </Document>
                          </div>

                          {/* Page Number */}
                          {(pdfNumPages[test.test_id] ?? 0) > pageIndex && (
                            <div className="text-center text-xs text-gray-500 py-2 bg-white border-t">
                              Page {pageIndex + 1} / {pdfNumPages[test.test_id] ?? '?'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Manual Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-indigo-600 p-4 text-white">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-xl font-bold">
                    Select Image {selectedImageTarget === 'question' ? 'for Question' : `for Option ${selectedImageTarget.replace('option_', '').toUpperCase()}`}
                  </h2>
                  {imageSelectorQuestionIndex !== null && (
                    <p className="text-indigo-200 text-sm">
                      Question {convertedQuestions[imageSelectorQuestionIndex]?.question_number}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeImageSelector}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold"
                >
                  ✕ Close
                </button>
              </div>
              {/* Page Selector */}
              <div className="flex items-center gap-3 mt-2">
                <label className="text-sm font-semibold text-indigo-100">
                  Extract from page:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, selectedPageForExtraction - 1))}
                    disabled={selectedPageForExtraction <= 1 || loadingImages}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    ←
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={totalPdfPages}
                    value={selectedPageForExtraction}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= totalPdfPages) {
                        handlePageChange(value);
                      }
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) {
                        setSelectedPageForExtraction(1);
                      } else if (value > totalPdfPages) {
                        setSelectedPageForExtraction(totalPdfPages);
                      }
                    }}
                    disabled={loadingImages}
                    className="w-20 px-3 py-1 bg-white text-indigo-900 rounded-lg font-semibold disabled:opacity-50 text-center"
                  />
                  <button
                    onClick={() => handlePageChange(Math.min(totalPdfPages, selectedPageForExtraction + 1))}
                    disabled={selectedPageForExtraction >= totalPdfPages || loadingImages}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    →
                  </button>
                  <span className="text-sm text-indigo-100 ml-2">
                    of {totalPdfPages}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              {loadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-indigo-600" />
                  <span className="ml-3 text-gray-600">Loading images from PDF...</span>
                </div>
              ) : availableImages.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faImage} className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No images found on this page</p>
                  <p className="text-gray-400 text-sm mt-2">The PDF may not contain extractable images</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Question selector for shared images */}
                  {selectedImageTarget === 'question' && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-yellow-800 mb-2">
                        Share this image with multiple questions?
                      </p>
                      <p className="text-xs text-yellow-700 mb-3">
                        Select all questions that should reference this image (e.g., "Answer questions 1-3 based on this graph")
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {convertedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleSharedQuestion(idx)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                              sharedImageQuestions.includes(idx)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Q{q.question_number}
                          </button>
                        ))}
                      </div>
                      {sharedImageQuestions.length > 1 && (
                        <p className="mt-2 text-xs text-indigo-600 font-semibold">
                          Image will be shared with questions: {sharedImageQuestions.map(i => convertedQuestions[i].question_number).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4">
                    Click on an image to select it. Found {availableImages.length} image(s) on this page.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectImage(idx)}
                        className="border-2 border-gray-200 rounded-lg p-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                      >
                        <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2 flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={`Image ${idx + 1}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Image #{idx + 1}
                          </span>
                          <span className="text-gray-500">
                            {img.width}×{img.height}
                          </span>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            Click to Select
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Images are sorted from top to bottom of the page
                </p>
                <button
                  onClick={closeImageSelector}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onClose={() => {
          setShowLanguageModal(false);
          setPendingConversion(null);
        }}
        onConfirm={handleLanguageConfirm}
      />
    </MathJaxProvider>
  );
}
