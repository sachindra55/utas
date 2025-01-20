import React, { useEffect, useRef } from 'react';
import 'h5p-standalone/dist/styles/h5p.css';

declare global {
  interface Window {
    H5P: any;
  }
}

interface H5PPlayerProps {
  contentId: string;
  className?: string;
}

const H5PPlayer: React.FC<H5PPlayerProps> = ({ contentId, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadH5P = async () => {
      if (!containerRef.current) return;

      try {
        console.log('Loading H5P content...');

        // Load H5P Standalone
        const { default: H5P } = await import('h5p-standalone');

        // Create container
        const wrapper = document.createElement('div');
        wrapper.className = 'h5p-content';
        containerRef.current.appendChild(wrapper);

        // Initialize H5P
        const h5p = new H5P(wrapper, {
          id: contentId,
          librariesPath: '/h5p/libraries',
          contentPath: '/h5p',
          frameCss: '/h5p/core/styles/h5p.css',
          frameJs: '/h5p/core/js/h5p-standalone-frame.js',
          frame: true,
          copyright: false,
          fullScreen: true,
          export: false
        });

        console.log('Starting H5P initialization...');
        await h5p.initializePromise;
        console.log('H5P initialized successfully');

      } catch (error) {
        console.error('Error loading H5P:', error);
        if (error instanceof Error) {
          console.error('Error details:', error);
        }
      }
    };

    loadH5P();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [contentId]);

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        className="h5p-container"
        style={{ 
          width: '100%',
          height: '100%',
          minHeight: '600px',
          background: '#fafafa',
          border: '1px solid #ccc',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default H5PPlayer;
