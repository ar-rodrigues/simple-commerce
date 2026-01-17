'use client'
import { useState, useEffect, useRef } from 'react';
import { Carousel } from 'antd';
import ImageWithPlaceholder from './ImageWithPlaceholder';

export default function CarouselWithSkeleton({ images, autoplay = true, autoplaySpeed = 2000, onHoverChange }) {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);

  const handleImageLoad = (index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  // Show carousel once at least the first image is loaded
  const firstImageLoaded = loadedImages.has(0);

  useEffect(() => {
    if (onHoverChange) {
      onHoverChange(isHovering);
    }
  }, [isHovering, onHoverChange]);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative"
    >
      {!firstImageLoaded && (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      )}
      <div className={firstImageLoaded ? 'block' : 'hidden'}>
        <Carousel 
          ref={carouselRef}
          autoplay={autoplay && !isHovering}
          autoplaySpeed={autoplaySpeed}
          effect="fade"
          className="w-full"
          dots={{ className: 'carousel-dots' }}
        >
          {images.map((image, index) => (
            <div key={index}>
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
                <ImageWithPlaceholder
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  placeholderClassName="h-[400px] md:h-[500px] lg:h-[600px]"
                  onLoadComplete={() => handleImageLoad(index)}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
