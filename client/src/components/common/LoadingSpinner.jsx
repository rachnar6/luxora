// client/src/components/common/LoadingSpinner.jsx
// Loading spinner component

import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingSpinner;
