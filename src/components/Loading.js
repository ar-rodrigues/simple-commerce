"use client";
import { RiLoader4Line } from "react-icons/ri";

const sizeClasses = {
  small: "text-2xl",
  default: "text-3xl",
  large: "text-4xl",
};

export function LoadingSpinner({ size = "large", className = "" }) {
  return (
    <RiLoader4Line
      className={`text-green-600 animate-spin ${
        sizeClasses[size] || sizeClasses.large
      } ${className}`.trim()}
      style={{ animationDuration: "1s" }}
    />
  );
}

export default function Loading({
  message = "Cargando...",
  size = "large",
  fullHeight = false,
  className = "",
  iconOnly = false,
}) {
  if (iconOnly) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size={size} />
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col items-center justify-center 
        ${fullHeight ? "min-h-[400px]" : "py-12"} 
        ${className}
      `}
    >
      <div className="relative">
        <LoadingSpinner size={size} />
      </div>
      {message && (
        <div className="mt-4 text-gray-600 text-base font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
