import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSlides, setExpandedSlides] = useState(new Set());

  const validateFile = (f) => {
    if (!f) return 'No file selected.';
    if (!f.name.toLowerCase().endsWith('.pptx')) {
      return 'Invalid file type. Only .pptx files are allowed.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 25 MB.';
    }
    if (f.size === 0) {
      return 'Uploaded file is empty.';
    }
    return null;
  };

  const handleFileSelect = (f) => {
    setError(null);
    setResult(null);
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(f);
    handleUpload(f);
  };

  const handleUpload = async (f) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', f);

      const response = await axios.post('/api/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 150000,
      });

      setResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to parse the presentation. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlide = (index) => {
    setExpandedSlides((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleContinue = () => {
    navigate('/configure', { state: { parseResult: result } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-bg p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
          Upload Presentation
        </h1>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFileSelect(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-teal-400 bg-teal-400/10'
              : 'border-gray-600 bg-gray-800/50 hover:border-teal-500 hover:bg-gray-800'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) handleFileSelect(f);
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Upload className="w-7 h-7 text-teal-400" />
            </div>
            <p className="text-white font-medium text-lg">
              {file ? file.name : 'Drop your file here'}
            </p>
            <p className="text-gray-400 text-sm">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}
            </p>
            <span className="text-gray-500 text-xs bg-gray-700/50 px-3 py-1 rounded-full">
              .pptx only · max 25MB
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center gap-3 mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            <span className="text-gray-300 font-medium">Parsing presentation...</span>
          </div>
        )}

        {/* Error Card */}
        {error && !loading && (
          <div className="mt-8 p-5 bg-red-900/30 border border-red-700 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Upload Failed</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Card */}
        {result && !loading && (
          <div className="mt-8 space-y-6">
            {/* Summary */}
            <div className="p-5 bg-emerald-900/30 border border-emerald-700 rounded-xl flex items-center justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-300 font-medium">Parsed Successfully</p>
                  <p className="text-emerald-400 text-sm mt-1">
                    {result.fileName}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-teal-400" />
                      {result.slideCount} {result.slideCount === 1 ? 'slide' : 'slides'}
                    </span>
                    <span className="text-gray-500">·</span>
                    <span>{result.totalWordCount} words</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                Ready
              </span>
            </div>

            {/* Slide Preview */}
            <div>
              <h3 className="text-white font-semibold mb-3">Content Preview</h3>
              <div className="space-y-2">
                {result.slides.slice(0, 3).map((slide, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSlide(idx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold flex items-center justify-center">
                          {slide.slideNumber}
                        </span>
                        <span className="text-white font-medium text-sm truncate max-w-[300px] sm:max-w-md">
                          {slide.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">{slide.wordCount} words</span>
                        {expandedSlides.has(idx) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {expandedSlides.has(idx) && slide.content && (
                      <div className="px-4 pb-4 pt-0">
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {slide.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {result.slides.length > 3 && (
                  <p className="text-gray-500 text-xs text-center pt-1">
                    +{result.slides.length - 3} more {result.slides.length - 3 === 1 ? 'slide' : 'slides'}
                  </p>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}