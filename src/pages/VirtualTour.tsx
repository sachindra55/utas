import React from 'react';
import H5PPlayer from '../components/H5PPlayer';

const VirtualTour: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Virtual Tour</h1>
      <div className="w-full h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <H5PPlayer contentId="virtual-tour" />
      </div>
    </div>
  );
};

export default VirtualTour;
