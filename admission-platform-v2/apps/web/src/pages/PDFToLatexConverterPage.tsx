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
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { MathJaxProvider, MathJaxRenderer, TikZGraph } from '../components/MathJaxRenderer';
import { AdvancedGraphRenderer } from '../components/GraphRenderer';
import { supabase } from '../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker - use local copy
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
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

  // PDF Tests from old system
  const [pdfTests, setPdfTests] = useState<PDFTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PDFTest | null>(null);

  // Questions from old system
  const [oldQuestions, setOldQuestions] = useState<OldQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Converted questions
  const [convertedQuestions, setConvertedQuestions] = useState<ConvertedQuestion[]>([]);
  const [converting, setConverting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [retryingImageIndex, setRetryingImageIndex] = useState<number | null>(null);

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

  useEffect(() => {
    loadPDFTests();
  }, []);

  const loadPDFTests = async () => {
    setLoadingTests(true);
    try {
      // Fetch ALL questions with PDF URLs (question_type = 'pdf')
      const { data: pdfQuestions, error: questionsError } = await supabase
        .from('2V_questions')
        .select('test_id, test_type, section, question_data')
        .eq('question_type', 'pdf')
        .not('question_data->>pdf_url', 'is', null);

      if (questionsError) throw questionsError;

      console.log(`Found ${pdfQuestions?.length || 0} PDF questions`);

      if (!pdfQuestions || pdfQuestions.length === 0) {
        setPdfTests([]);
        return;
      }

      // Group by test_id
      const testMap = new Map<string, PDFTest>();

      pdfQuestions.forEach((q: any) => {
        const pdfUrl = q.question_data?.pdf_url;
        if (!pdfUrl) return;

        if (!testMap.has(q.test_id)) {
          testMap.set(q.test_id, {
            test_id: q.test_id,
            test_type: q.test_type,
            section: q.section,
            exercise_type: 'PDF Test',
            test_number: 0,
            pdf_url: pdfUrl,
            question_count: 1,
          });
        } else {
          testMap.get(q.test_id)!.question_count++;
        }
      });

      console.log(`Grouped into ${testMap.size} unique tests`);

      // Fetch test details from 2V_tests to get exercise_type and test_number
      const testIds = Array.from(testMap.keys());
      const { data: testsData, error: testsError } = await supabase
        .from('2V_tests')
        .select('id, exercise_type, test_number')
        .in('id', testIds);

      if (testsError) {
        console.warn('Error fetching test details:', testsError);
      } else if (testsData) {
        testsData.forEach((test: any) => {
          const existing = testMap.get(test.id);
          if (existing) {
            existing.exercise_type = test.exercise_type || 'PDF Test';
            existing.test_number = test.test_number || 0;
          }
        });
      }

      const testsList = Array.from(testMap.values());
      console.log('Final tests list:', testsList);

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
  };

  const handleExtractAndConvert = async () => {
    if (!selectedTest) {
      setError('No test selected');
      return;
    }

    setConverting(true);
    setError(null);
    setOldQuestions([]);
    setConvertedQuestions([]);

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

      // Step 3: Send PDF URL to AI for extraction (AI will fetch and read the actual PDF)
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
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert questions');
      }

      const data = await response.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error('AI returned no questions');
      }

      console.log('AI extraction complete, now extracting images from PDF...');

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
      setApiUsage(data.usage || null);

      // Debug logging for image rendering
      console.log('=== CONVERTED QUESTIONS WITH IMAGES ===');
      questionsWithImages.forEach((q: any, idx) => {
        console.log(`Q${q.question_number}:`, {
          has_image: q.has_image,
          image_url: q.image_url,
          image_options: q.image_options,
          image_mapping: q.image_mapping
        });
      });
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract and convert questions');
    } finally {
      setConverting(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!selectedTest || convertedQuestions.length === 0) {
      setError('No questions to save');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Use the existing test_id
      const testId = selectedTest.test_id;

      // Images already extracted during conversion phase
      // Transform to new format and UPDATE existing questions
      const questionsToUpdate = convertedQuestions.map((q: any) => ({
        test_id: testId,
        test_type: selectedTest.test_type,
        question_number: q.question_number,
        question_type: 'multiple_choice',
        section: q.section,
        question_data: {
          question_text: q.question_text,
          question_text_eng: q.question_text_eng,
          options: q.options,
          options_eng: q.options_eng,
          pdf_url: selectedTest.pdf_url,
          page_number: q.page_number,
          has_image: q.has_image || false,
          image_url: q.image_url || null,
          image_options: null,
          // New fields for graph recreation
          has_graph_latex: q.has_graph_latex || false,
          graph_latex: q.graph_latex || null,
          graph_function: q.graph_function || null,
          graph_analysis: q.graph_analysis || null,
          graph_type: q.graph_type || null,
          graph_features: q.graph_features || null,
          graph_domain: q.graph_domain || null,
          graph_range: q.graph_range || null,
        },
        answers: {
          correct_answer: q.correct_answer,
          wrong_answers: Object.keys(q.options).filter((key) => key !== q.correct_answer),
        },
        is_active: true,
      }));

      // Update questions (upsert based on test_id + question_number)
      const { error: updateError } = await supabase
        .from('2V_questions')
        .upsert(questionsToUpdate, {
          onConflict: 'test_id,question_number',
        });

      if (updateError) {
        throw updateError;
      }

      setSaveSuccess(true);
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save questions');
    } finally {
      setSaving(false);
    }
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
            <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-start gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-green-900">Success!</h3>
                <p className="text-green-700">Questions saved successfully. Redirecting...</p>
              </div>
            </div>
          )}

          {/* Test Selection Panel - Shows before conversion */}
          {convertedQuestions.length === 0 && (
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
                    <div className="space-y-3 max-h-[500px] overflow-y-auto mb-6">
                      {pdfTests.map((test, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectTest(test)}
                          disabled={converting}
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                            selectedTest === test
                              ? 'border-brand-green bg-gradient-to-r from-green-50 to-green-100 shadow-lg'
                              : 'border-gray-200 hover:border-brand-green bg-white hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-brand-dark text-xl mb-1">
                                {test.test_type} - {test.section}
                              </div>
                              <div className="text-sm text-gray-600">
                                {test.exercise_type} #{test.test_number}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                📄 {test.question_count} questions
                              </div>
                            </div>
                            {selectedTest === test && (
                              <div className="ml-4">
                                <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                                  <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results View - PDF Left, Questions Right */}
          {!fullScreenPreview && convertedQuestions.length > 0 && selectedTest && (
            <div className={`grid grid-cols-1 gap-6 h-[calc(100vh-200px)] ${showPdfPreview ? 'lg:grid-cols-2' : ''}`}>
              {/* Left Panel: PDF Viewer */}
              {showPdfPreview && (
                <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                    <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                      <span className="text-2xl">📄</span>
                      PDF Preview
                    </h2>
                    <a
                      href={selectedTest.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Open in new tab →
                    </a>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-lg border-2 border-gray-300">
                    <iframe
                      src={selectedTest.pdf_url}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  </div>
                </div>
              )}

              {/* Right Panel: Converted Questions */}
              <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    Converted Questions ({convertedQuestions.length})
                  </h2>
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

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {convertedQuestions.map((question, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-brand-green transition-colors">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                        <h3 className="font-bold text-brand-dark text-lg">Question {question.question_number}</h3>
                        <div className="flex items-center gap-2">
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
                        <div className="bg-blue-50 p-4 rounded-lg mb-3 border border-blue-200">
                          <MathJaxRenderer>{question.question_text}</MathJaxRenderer>

                          {/* Display image(s) if present */}
                          {(question as any).image_url && (
                            <div className="mt-3 space-y-2">
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
                                      Retry Extraction
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options */}
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
                                      <MathJaxRenderer>{value}</MathJaxRenderer>
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
                    </div>
                  ))}
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
    </MathJaxProvider>
  );
}
