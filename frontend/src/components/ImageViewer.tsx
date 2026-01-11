import React, { useState } from 'react';

// Props for the ImageViewer component
interface ImageViewerProps {
  // The primary image to display (e.g., CT or MRI scan)
  baseImage: string;
  // The Grad-CAM heatmap image
  heatmapImage: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ baseImage, heatmapImage }) => {
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);
  const [opacity, setOpacity] = useState(0.5);

  return (
    <div className="flex flex-col items-center p-4 bg-[#1E1E1E] text-white h-full w-full">
      <h1 className="text-2xl font-bold mb-4">Image Viewer</h1>
      
      {/* Image container */}
      <div className="relative flex-shrink-0 max-w-full max-h-[calc(100vh-150px)] border-2 border-gray-500">
        {/* Base image */}
        <img
          src={baseImage}
          alt="Base Medical Image"
          className="w-full h-full object-contain"
        />
        
        {/* Heatmap overlay */}
        {isHeatmapVisible && (
          <img
            src={heatmapImage}
            alt="Grad-CAM Heatmap"
            className="absolute top-0 left-0 w-full h-full object-contain"
            style={{ opacity }}
          />
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-4 mt-4">
        {/* Toggle heatmap visibility */}
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isHeatmapVisible}
            onChange={() => setIsHeatmapVisible(!isHeatmapVisible)}
            className="mr-2"
          />
          Show Grad-CAM
        </label>
        
        {/* Opacity slider for the heatmap */}
        {isHeatmapVisible && (
          <div className="flex items-center">
            <label htmlFor="opacity-slider" className="mr-2">Intensity:</label>
            <input
              id="opacity-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-48"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Example of how to use the ImageViewer with placeholder images
const ImageViewerContainer = () => {
    // These would typically come from an API or component props
    const placeholderBaseImage = 'https://prod-images-static.radiopaedia.org/images/4169566/c3d2b521cbde4dee786560055f7598_big_gallery.jpg';
    const placeholderHeatmapImage = 'https://wires.onlinelibrary.wiley.com/cms/asset/99e858bd-8d02-4362-883b-eef3178b05c8/widm70031-fig-0007-m.jpg';

    return (
        <ImageViewer 
            baseImage={placeholderBaseImage}
            heatmapImage={placeholderHeatmapImage}
        />
    );
};

export default ImageViewerContainer;
