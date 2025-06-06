import React from "react";

interface LoadingIndicatorProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = "Loading...",
  fullScreen = true,
  className = "",
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`w-16 h-16 ${className}`}>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-600 to-purple-600 opacity-20"></div>
          <div className="w-full h-full border-4 border-transparent border-t-teal-600 border-r-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="text-lg text-gray-600 font-medium">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingIndicator;
