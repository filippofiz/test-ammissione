/**
 * Image component with error handling and loading states
 * Helps debug and handle cases where images fail to load
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export function ImageWithFallback({
  src,
  alt,
  className = "max-w-full h-auto rounded-lg",
  onError
}: ImageWithFallbackProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const MAX_RETRIES = 3;

  // Reset state when src changes
  useEffect(() => {
    setImageState('loading');
    setErrorDetails('');
    setRetryCount(0);
    setRetryKey(0);
  }, [src]);

  const handleLoad = () => {
    setImageState('loaded');
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', {
      src,
      alt,
      error: e,
      retryCount,
      timestamp: new Date().toISOString()
    });

    // Attempt automatic retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying image load in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`, { src });

      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setRetryKey(prev => prev + 1); // Force image reload
        setImageState('loading');
      }, delay);
    } else {
      // Max retries reached, show error
      setImageState('error');
      setErrorDetails(`Failed to load after ${MAX_RETRIES} attempts: ${src}`);
      onError?.();
    }
  };

  // Check if URL is valid
  if (!src || src.trim() === '') {
    console.warn('ImageWithFallback: Empty or invalid src provided', { src, alt });
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 text-2xl mb-2" />
        <p className="text-sm text-yellow-700">Image URL is empty</p>
      </div>
    );
  }

  if (imageState === 'error') {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl mb-2" />
        <p className="text-sm text-red-700 mb-1">Failed to load image</p>
        <p className="text-xs text-red-600 break-all">{errorDetails}</p>
        <button
          onClick={() => {
            setRetryCount(0);
            setRetryKey(prev => prev + 1);
            setImageState('loading');
          }}
          className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Retry manually
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <FontAwesomeIcon icon={faImage} className="text-gray-400 text-3xl animate-pulse" />
        </div>
      )}
      <img
        key={`${src}-${retryKey}`}
        src={src}
        alt={alt}
        className={`${className} ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
      />
    </div>
  );
}
