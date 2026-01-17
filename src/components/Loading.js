'use client'
import { RiLoader4Line } from 'react-icons/ri';

export default function Loading({ 
  message = 'Cargando...', 
  size = 'large',
  fullHeight = false,
  className = ''
}) {
  const sizeClasses = {
    small: 'text-2xl',
    default: 'text-3xl',
    large: 'text-4xl'
  };

  return (
    <div 
      className={`
        flex flex-col items-center justify-center 
        ${fullHeight ? 'min-h-[400px]' : 'py-12'} 
        ${className}
      `}
    >
      <div className="relative">
        <RiLoader4Line 
          className={`text-green-600 animate-spin ${sizeClasses[size] || sizeClasses.large}`}
          style={{ animationDuration: '1s' }}
        />
      </div>
      {message && (
        <div className="mt-4 text-gray-600 text-base font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
