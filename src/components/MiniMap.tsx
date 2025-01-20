import React from 'react';
import { tourLocations, type TourLocation } from '../data/tourLocations';

interface MiniMapProps {
  selectedLocation: TourLocation;
  onLocationSelect: (location: TourLocation) => void;
}

const MiniMap: React.FC<MiniMapProps> = ({ selectedLocation, onLocationSelect }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
      <h3 className="text-lg font-semibold mb-2">Location Map</h3>
      <div className="grid grid-cols-2 gap-2">
        {tourLocations.map((location) => (
          <button
            key={location.id}
            onClick={() => onLocationSelect(location)}
            className={`p-2 text-sm rounded ${
              selectedLocation.id === location.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MiniMap;
