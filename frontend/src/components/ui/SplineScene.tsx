import React, { Suspense, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

interface SplineSceneProps {
  scene: string;
  className?: string;
  showLoadingSpinner?: boolean;
}

const SplineLoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center w-full h-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <p className="text-white text-sm font-medium">Loading 3D Scene...</p>
    </div>
  </motion.div>
);

export const SplineScene: React.FC<SplineSceneProps> = ({ 
  scene, 
  className = '', 
  showLoadingSpinner = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <motion.div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Loading State */}
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <SplineLoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">⚠️</div>
            <p className="text-white text-sm font-medium">Failed to load 3D scene</p>
            <p className="text-white/60 text-xs max-w-xs text-center">
              The 3D scene couldn't be loaded. Please check your connection.
            </p>
          </div>
        </motion.div>
      )}

      {/* Spline Scene */}
      <Suspense fallback={<SplineLoadingSpinner />}>
        <Spline
          scene={scene}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Suspense>

      {/* Gradient Overlay (optional ambient effect) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </motion.div>
  );
};

export default SplineScene;
