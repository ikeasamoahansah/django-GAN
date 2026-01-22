import React, { useState, useEffect } from 'react';
import { FolderOpen, Sparkles, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/calls';
import { useDicom } from '../context/DicomContext';
import { renderDicomToDataURL } from '../utils/dicomRenderer';

interface AnalysisData {
  image_type_detected: string;
  observations: string[];
  potential_conditions: string[];
  recommendations: string[];
  confidence_score: number;
  disclaimer: string;
}

interface ImageViewerProps {
  baseImage: string | null;
  heatmapImage?: string | null;
  imageId?: number | string | null; // ID of the existing image for analysis
}

const ImageViewer: React.FC<ImageViewerProps> = ({ baseImage: initialBaseImage, heatmapImage, imageId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialBaseImage);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Heatmap state
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);
  const [opacity, setOpacity] = useState(0.5);

  const { selectedDicom } = useDicom();

  useEffect(() => {
    if (selectedDicom) {
        setIsLoading(true);
        setError(null);
        renderDicomToDataURL(selectedDicom.file)
            .then(url => {
                setPreviewUrl(url);
                setSelectedFile(selectedDicom.file);
                // Reset analysis/heatmap when switching images
                setAnalysis(null);
                setShowReport(false);
                setIsHeatmapVisible(false);
            })
            .catch(err => {
                console.error("DICOM Render Error:", err);
                setError('Failed to render DICOM image. Please try a standard image format.');
            })
            .finally(() => setIsLoading(false));
    }
  }, [selectedDicom]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
      setShowReport(false);
      // Reset heatmap as new image won't have one initially unless generated
      setIsHeatmapVisible(false);
    }
  };

  const handleAnalyze = async () => {
    // If we have existing analysis, just toggle capabilities? 
    // Usually user wants to run or re-run.

    if (!selectedFile && !imageId) return;

    setIsLoading(true);
    setError(null);
    setShowReport(true); // Open the panel to show loading state

    try {
      let response;
      if (selectedFile) {
        // Upload and Analyze
        const formData = new FormData();
        // We must send 'image' as that's the field name in the model and serializer
        formData.append('image', selectedFile);

        response = await api.post('/api/translations/upload_and_analyze/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (imageId) {
        // Analyze existing
        response = await api.post(`/api/translations/${imageId}/analyze/`);
      }

      if (response?.data?.analysis) {
        setAnalysis(response.data.analysis);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      setAnalysis(null); // Clear previous valid analysis on error if any
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-white p-6 overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-6 h-full">

        {/* Left Side: Image Viewer */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showReport ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white/90 text-balance">Medical Image Viewer</h1>

            {/* Controls Bar */}
            <div className="flex items-center gap-3">
              {/* Heatmap Toggle */}
              {(heatmapImage) && previewUrl && (
                <div className="flex items-center gap-3 bg-[#2B2B2B] px-3 py-1.5 rounded-lg border border-[#3E3E42]">
                  <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                    <input
                      type="checkbox"
                      checked={isHeatmapVisible}
                      onChange={(e) => setIsHeatmapVisible(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    Grad-CAM
                  </label>
                  {isHeatmapVisible && (
                    <input
                      type="range"
                      min="0" max="1" step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-20"
                      title="Opacity"
                    />
                  )}
                </div>
              )}

              {/* Generate/Show Report Button */}
              {previewUrl && (
                <button
                  onClick={() => {
                    if (analysis) {
                      setShowReport(!showReport);
                    } else {
                      handleAnalyze();
                    }
                  }}
                  disabled={isLoading}
                  className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition
                                ${showReport
                      ? 'bg-[#3E3E42] hover:bg-[#4E4E52] text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'}
                            `}
                >
                  {isLoading ? (
                    <Loader className="animate-spin h-4 w-4" />
                  ) : analysis ? (
                    showReport ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isLoading ? 'Analyzing...' : analysis ? (showReport ? 'Hide Report' : 'Show Report') : 'Generate Report'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#2B2B2B] border border-dashed border-[#3E3E42] rounded-lg relative min-h-[500px] flex flex-col items-center justify-center overflow-hidden group">
            {previewUrl ? (
              <div className="relative w-full h-full p-4 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Medical Scan"
                  className="max-w-full max-h-full object-contain"
                />
                {/* Heatmap Overlay */}
                {heatmapImage && isHeatmapVisible && (
                  <img
                    src={heatmapImage}
                    alt="Heatmap"
                    className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
                    style={{ opacity }}
                  />
                )}

                {/* Clear Button (only for upload mode) */}
                {selectedFile && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setAnalysis(null);
                      setShowReport(false);
                    }}
                    aria-label="Remove image"
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full hover:bg-[#35393F]/30 transition p-10">
                <div className="bg-[#3E3E42] p-6 rounded-full mb-6">
                  <FolderOpen className="h-10 w-10 text-indigo-400" />
                </div>
                <span className="text-white/80 text-xl font-medium mb-2">Upload Dicom or Image</span>
                <span className="text-white/40 text-sm">Drag and drop or click to browse</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".dcm,.jpg,.png,.jpeg" />
              </label>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* Right Side: Analysis Report (Collapsible) */}
        {showReport && (
          <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#2B2B2B] border border-[#3E3E42] rounded-lg flex flex-col h-full animate-in slide-in-from-right-10 fade-in duration-300">
            <div className="p-6 border-b border-[#3E3E42] flex items-center justify-between bg-[#232323] rounded-t-lg">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-balance">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                AI Analysis
              </h2>
              <button onClick={() => setShowReport(false)} aria-label="Close report" className="text-white/40 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-white/50">
                  <Loader className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-sm">Analyzing image features...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Confidence Score */}
                  <div className="p-4 bg-[#1E1E1E] rounded-lg border border-[#3E3E42]">
                    <div className="flex justify-between text-xs text-white/60 mb-2">
                      <span>Confidence</span>
                      <span className="tabular-nums">{(analysis.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${analysis.confidence_score > 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${analysis.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Detected Type */}
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Modality</h3>
                    <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-sm font-medium">
                      {analysis.image_type_detected}
                    </div>
                  </div>

                  {/* Observations */}
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Key Observations</h3>
                    <ul className="space-y-3">
                      {analysis.observations.map((obs, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-white/90 bg-[#1E1E1E] p-3 rounded-lg border border-[#3E3E42]">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Potential Conditions */}
                  {analysis.potential_conditions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Findings</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.potential_conditions.map((cond, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-medium">
                            {cond}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-white/80">
                          <span className="text-green-500/80">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#3E3E42]">
                    <p className="text-[10px] text-white/30 leading-relaxed text-center">
                      {analysis.disclaimer}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/30 text-center">
                  <AlertCircle className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm">Unable to generate analysis.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Container component for demo
const ImageViewerContainer = () => {
  return (
    <ImageViewer
      baseImage={null}
    />
  );
};

export default ImageViewerContainer;
