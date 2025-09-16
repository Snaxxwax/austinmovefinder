import React, { useState } from 'react';
import { Send, Camera, Home, Package, Calendar, MapPin, Zap } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { ItemizedQuote } from './ItemizedQuote';
import { ObjectDetectionService, DetectedObject } from '../services/objectDetection';

interface FastQuoteFormData {
  name: string;
  email: string;
  phone: string;
  moveType: 'local' | 'long-distance' | 'commercial' | 'storage';
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  estimatedSize: 'studio' | '1br' | '2br' | '3br' | '4br+' | 'commercial';
  specialItems: string;
  notes: string;
}

interface FastQuoteFormProps {
  onSubmit?: (data: FastQuoteFormData, files: File[]) => void;
  className?: string;
}

export const FastQuoteForm: React.FC<FastQuoteFormProps> = ({
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState<FastQuoteFormData>({
    name: '',
    email: '',
    phone: '',
    moveType: 'local',
    moveDate: '',
    fromAddress: '',
    toAddress: '',
    estimatedSize: '2br',
    specialItems: '',
    notes: ''
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [totalQuoteCost, setTotalQuoteCost] = useState(0);
  const [showInstantQuote, setShowInstantQuote] = useState(false);

  // Initialize object detection service (in production, get API key from env)
  const getObjectDetectionService = () => {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    console.log('🔍 Debug API Key Full Details:', {
      exists: !!apiKey,
      length: apiKey?.length,
      startsWithHf: apiKey?.startsWith('hf_'),
      firstChars: apiKey?.substring(0, 8) + '...',
      lastChars: '...' + apiKey?.substring(apiKey.length - 8),
      isPlaceholder: apiKey === 'your_huggingface_api_key_here',
      fullValue: apiKey, // Temporary for debugging
      allEnvVars: Object.keys(import.meta.env),
      viteVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
    });
    
    console.log('🔍 Raw environment check:', import.meta.env);
    
    if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
      console.log('❌ No valid API key found - will use demo mode');
      return null; // No API key configured
    }
    console.log('✅ API key found, creating service');
    return new ObjectDetectionService(apiKey);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaFilesChange = async (files: File[]) => {
    setMediaFiles(files);
    
    if (files.length > 0) {
      const objectDetectionService = getObjectDetectionService();
      
      if (!objectDetectionService) {
        // No API key configured - show demo mode with sample items
        setAnalysisError('Demo Mode: Add your Hugging Face API key to .env.local to enable real AI object detection. Showing sample items for demonstration.');
        
        // Create demo detected objects
        const demoObjects: DetectedObject[] = [
          { label: 'couch', score: 0.95, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'dining table', score: 0.88, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'chair', score: 0.92, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'tv', score: 0.85, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'refrigerator', score: 0.91, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } }
        ];
        
        setDetectedObjects(demoObjects);
        setShowInstantQuote(true);
        return;
      }
      
      setIsAnalyzing(true);
      setAnalysisError('');
      setDetectedObjects([]);
      
      try {
        const allDetections: DetectedObject[] = [];
        
        console.log(`🚀 Starting analysis of ${files.length} files...`);
        
        for (const file of files) {
          console.log(`📁 Processing file: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          
          if (file.type.startsWith('image/')) {
            console.log('🖼️ Detecting objects in image...');
            const detections = await objectDetectionService.detectObjects(file);
            console.log(`✅ Found ${detections.length} objects in image`);
            allDetections.push(...detections);
          } else if (file.type.startsWith('video/')) {
            console.log('🎥 Detecting objects in video...');
            const detections = await objectDetectionService.detectObjectsFromVideo(file);
            console.log(`✅ Found ${detections.length} objects in video`);
            allDetections.push(...detections);
          } else {
            console.log(`⚠️ Unsupported file type: ${file.type}`);
          }
        }
        
        console.log(`🎯 Total objects detected: ${allDetections.length}`);
        setDetectedObjects(allDetections);
        setShowInstantQuote(allDetections.length > 0);
      } catch (error) {
        console.error('❌ Object detection failed with error:', error);
        
        // Show specific error message based on the error
        let errorMessage = 'Failed to analyze media. ';
        if (error instanceof Error) {
          if (error.message.includes('HTTP error! status: 401')) {
            errorMessage += 'Invalid Hugging Face API key. Please check your .env.local file.';
          } else if (error.message.includes('HTTP error! status: 429')) {
            errorMessage += 'Rate limit exceeded. Please try again in a few minutes.';
          } else if (error.message.includes('HTTP error!')) {
            errorMessage += `API error: ${error.message}`;
          } else if (error.message.includes('Failed to detect objects')) {
            errorMessage += 'Error processing the file. Please try a different image or video.';
          } else {
            errorMessage += `${error.message}. Contact support if this persists.`;
          }
        } else {
          errorMessage += 'Unknown error occurred. Contact support.';
        }
        
        setAnalysisError(errorMessage);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setDetectedObjects([]);
      setShowInstantQuote(false);
    }
  };

  const handleQuoteUpdate = (totalCost: number) => {
    setTotalQuoteCost(totalCost);
  };

  const calculateMoveDistance = (): number => {
    // Simple distance calculation - in production, use actual geocoding
    if (formData.moveType === 'long-distance') return 500;
    if (formData.moveType === 'local') return 15;
    return 25;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        onSubmit(formData, mediaFiles);
      } else {
        // For now, just show success message - the quote is already displayed on page
        alert('🎉 Your quote is ready! Review the itemized list above and make any adjustments. When you\'re satisfied, call us at (512) 555-MOVE to book your move.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error processing your request. Please try again or contact us directly at (512) 555-MOVE.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`austin-card p-8 ${className}`}>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-austin-blue mr-3" />
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            Get a Fast Quote
          </h2>
        </div>
        <p className="text-gray-600">
          Upload photos or videos of your items for an accurate quote in 2 hours or less
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Preferred Move Date *
            </label>
            <input
              type="date"
              id="moveDate"
              name="moveDate"
              required
              value={formData.moveDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Move Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="moveType" className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="inline h-4 w-4 mr-1" />
              Move Type *
            </label>
            <select
              id="moveType"
              name="moveType"
              required
              value={formData.moveType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            >
              <option value="local">Local Austin Move</option>
              <option value="long-distance">Long Distance</option>
              <option value="commercial">Commercial Move</option>
              <option value="storage">Storage Services</option>
            </select>
          </div>

          <div>
            <label htmlFor="estimatedSize" className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Estimated Size *
            </label>
            <select
              id="estimatedSize"
              name="estimatedSize"
              required
              value={formData.estimatedSize}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            >
              <option value="studio">Studio/Efficiency</option>
              <option value="1br">1 Bedroom</option>
              <option value="2br">2 Bedroom</option>
              <option value="3br">3 Bedroom</option>
              <option value="4br+">4+ Bedroom</option>
              <option value="commercial">Commercial Space</option>
            </select>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Moving From *
            </label>
            <input
              type="text"
              id="fromAddress"
              name="fromAddress"
              required
              placeholder="Street address, city, state"
              value={formData.fromAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Moving To
            </label>
            <input
              type="text"
              id="toAddress"
              name="toAddress"
              placeholder="Street address, city, state (if known)"
              value={formData.toAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="specialItems" className="block text-sm font-medium text-gray-700 mb-2">
            Special Items or Services
          </label>
          <input
            type="text"
            id="specialItems"
            name="specialItems"
            placeholder="Piano, artwork, fragile items, packing services, etc."
            value={formData.specialItems}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
          />
        </div>

        {/* Media Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="inline h-4 w-4 mr-1" />
            Photos & Videos of Your Items
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Upload photos or videos of your items, rooms, or special belongings for an instant itemized quote
          </p>
          <MediaUpload
            onFilesChange={handleMediaFilesChange}
            maxFiles={10}
            maxSizePerFile={25}
            acceptedTypes={['image/*', 'video/*']}
          />

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mt-4 bg-austin-blue/10 border border-austin-blue/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-austin-blue mr-3"></div>
                <span className="text-austin-blue font-medium">
                  Analyzing your items with AI... This may take a moment.
                </span>
              </div>
            </div>
          )}

          {/* Analysis Error */}
          {analysisError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{analysisError}</p>
            </div>
          )}

          {/* Instant Quote Results */}
          {(showInstantQuote || mediaFiles.length > 0 || detectedObjects.length > 0) && (
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <Zap className="h-5 w-5 text-austin-green mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">
                  {detectedObjects.length > 0 ? 'AI-Generated Quote' : 'Your Moving Quote'}
                </h4>
                {detectedObjects.length > 0 && (
                  <span className="ml-2 bg-austin-green text-white text-xs px-2 py-1 rounded-full">
                    AI POWERED
                  </span>
                )}
              </div>
              
              <ItemizedQuote
                detectedObjects={detectedObjects}
                moveDistance={calculateMoveDistance()}
                isSpecialtyMove={formData.moveType === 'commercial'}
                onQuoteUpdate={handleQuoteUpdate}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Stairs, elevators, parking, timeline, budget concerns, or other details..."
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isAnalyzing}
          className="w-full bg-austin-blue text-white px-6 py-4 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Items...
            </>
          ) : totalQuoteCost > 0 ? (
            <>
              <Send className="mr-2 h-5 w-5" />
              Book This Move - ${totalQuoteCost.toLocaleString()}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Start My Quote
            </>
          )}
        </button>

        {/* Enhanced Call-to-Action when quote is available */}
        {totalQuoteCost > 0 && (
          <div className="text-center bg-gradient-to-r from-austin-green/10 to-austin-blue/10 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-700 mb-2">
              🎉 <strong>Instant Quote Generated!</strong> Your estimated cost: <span className="text-austin-blue font-bold">${totalQuoteCost.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-500">
              Submit this form to lock in your quote and schedule your Austin move
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Pro tip:</strong> Include photos of bulky items, narrow doorways, stairs, 
            and parking areas for the most accurate quote
          </p>
        </div>
      </form>
    </div>
  );
};