'use client'
import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithPlaceholder({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  placeholderClassName = '',
  onLoadComplete,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoadComplete) {
      onLoadComplete();
    }
  };

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`,
    onLoad: handleLoad,
    onError: () => {
      setIsLoading(false);
      setHasError(true);
      if (onLoadComplete) {
        onLoadComplete();
      }
    },
    sizes,
    priority,
    ...props
  };

  if (fill) {
    imageProps.fill = true;
  } else {
    imageProps.width = width;
    imageProps.height = height;
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${placeholderClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
          <span>Error al cargar imagen</span>
        </div>
      ) : (
        <Image {...imageProps} />
      )}
    </div>
  );
}
