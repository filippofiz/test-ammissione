/**
 * ImageUploader Component
 * Reusable component for uploading images directly to Supabase storage
 */

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';

interface ImageUploaderProps {
  testType: string;
  section: string;
  onImageUploaded: (imageUrl: string, language?: 'ita' | 'eng') => void;
  onError?: (error: string) => void;
  className?: string;
  showLanguageSelector?: boolean;
}

export function ImageUploader({
  testType,
  section,
  onImageUploaded,
  onError,
  className = '',
  showLanguageSelector = true
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'ita' | 'eng'>('ita');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please select an image file';
      setUploadError(error);
      if (onError) onError(error);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const error = 'Image file is too large. Maximum size is 5MB';
      setUploadError(error);
      if (onError) onError(error);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Get user session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated. Please log in and try again.');
      }

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // Create file path with test_type and section
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filePath = `${testType}/${section}/uploaded_${timestamp}.${extension}`;

      // Upload to Supabase via edge function
      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-question-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            filePath,
            imageBase64,
          }),
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.publicUrl) {
        throw new Error('No image URL returned from upload');
      }

      console.log('✅ Image uploaded successfully:', uploadResult.publicUrl);
      setUploadSuccess(true);
      onImageUploaded(uploadResult.publicUrl, selectedLanguage);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showLanguageSelector && (
        <div className="mb-3">
          <label className="block text-xs font-semibold text-purple-900 mb-2">
            Language version:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage('ita')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedLanguage === 'ita'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              🇮🇹 Italian
            </button>
            <button
              onClick={() => setSelectedLanguage('eng')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedLanguage === 'eng'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={uploading}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg"
      >
        {uploading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            Uploading...
          </>
        ) : uploadSuccess ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} />
            Uploaded!
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faUpload} />
            Upload Image from Computer
          </>
        )}
      </button>

      {uploadError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faTimesCircle} />
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} />
          Image uploaded successfully!
        </div>
      )}
    </div>
  );
}
