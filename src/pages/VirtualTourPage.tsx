import React from 'react';
import H5PPlayer from '../components/H5PPlayer';

export function VirtualTourPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Virtual Campus Tour
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <H5PPlayer 
            contentId="virtual-tour" 
            className="w-full aspect-[16/9]"
          />
        </div>
      </div>
    </div>
  );
}
