/**
 * QuestionImage Component
 * Displays images with loading state, error handling, and automatic retry
 */

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';

interface QuestionImageProps {
  src: string;
  alt?: string;
  className?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export function QuestionImage({
  src,
  alt = 'Question image',
  className = '',
  maxRetries = 3,
  retryDelay = 1000,
}: QuestionImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageSrc, setImageSrc] = useState(src);

  // Reset state when src changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
    setImageSrc(src);
  }, [src]);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        console.log(`🔄 Retrying image load (attempt ${retryCount + 1}/${maxRetries}):`, src);
        setError(false);
        setLoading(true);
        // Add cache-busting parameter
        const cacheBuster = `${src.includes('?') ? '&' : '?'}retry=${Date.now()}`;
        setImageSrc(src + cacheBuster);
        setRetryCount(prev => prev + 1);
      }, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, maxRetries, retryDelay, src]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    console.log('✅ Image loaded successfully:', src);
  }, [src]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    console.warn(`❌ Image failed to load (attempt ${retryCount + 1}):`, src);
  }, [src, retryCount]);

  const handleManualRetry = useCallback(() => {
    setRetryCount(0);
    setError(false);
    setLoading(true);
    const cacheBuster = `${src.includes('?') ? '&' : '?'}retry=${Date.now()}`;
    setImageSrc(src + cacheBuster);
  }, [src]);

  // Show loading placeholder
  if (loading && !error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 min-h-[100px] ${className}`}>
        <div className="text-center text-gray-500">
          <FontAwesomeIcon icon={faSpinner} className="text-2xl animate-spin mb-2" />
          <p className="text-sm">Loading image...</p>
        </div>
        {/* Hidden image to trigger load */}
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className="hidden"
        />
      </div>
    );
  }

  // Show error state with retry button
  if (error && retryCount >= maxRetries) {
    return (
      <div className={`flex flex-col items-center justify-center bg-red-50 rounded-lg border border-red-200 min-h-[100px] p-4 ${className}`}>
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-400 mb-2" />
        <p className="text-sm text-red-600 mb-3">Failed to load image</p>
        <button
          onClick={handleManualRetry}
          className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
        >
          <FontAwesomeIcon icon={faRedo} />
          Retry
        </button>
      </div>
    );
  }

  // Show the image
  return (
    <img
      key={imageSrc}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={`max-w-full h-auto rounded-lg border border-gray-200 ${className}`}
    />
  );
}
