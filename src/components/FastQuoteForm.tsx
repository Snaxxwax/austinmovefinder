import React, { useState } from 'react';
import { Send, Camera, Home, Package, Calendar, MapPin, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { ItemizedQuote } from './ItemizedQuote';
import { ObjectDetectionService, DetectedObject } from '../services/objectDetection';
import { backendApi, QuoteRequest, QuoteResponse } from '../services/backendApi';

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
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>('');
  const [quoteId, setQuoteId] = useState<number | null>(null);

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
        setAnalysisError('Demo Mode: Add your Hugging Face API key to .env.local to enable real AI object detection. Showing sample Austin moving items for demonstration.');

        // Create demo detected objects with Austin-specific items
        const demoObjects: DetectedObject[] = [
          { label: 'couch', score: 0.95, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'dining table', score: 0.88, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'chair', score: 0.92, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'tv', score: 0.85, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'refrigerator', score: 0.91, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } },
          { label: 'bed', score: 0.89, box: { xmin: 0, ymin: 0, xmax: 100, ymax: 100 } }
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
            errorMessage += 'Invalid Hugging Face API key. Please check your .env.local file. Call (512) 555-MOVE for immediate assistance.';
          } else if (error.message.includes('HTTP error! status: 429')) {
            errorMessage += 'Rate limit exceeded. Please try again in a few minutes or call (512) 555-MOVE for instant quote.';
          } else if (error.message.includes('HTTP error!')) {
            errorMessage += `API error: ${error.message}. Contact our Austin team at (512) 555-MOVE.`;
          } else if (error.message.includes('Failed to detect objects')) {
            errorMessage += 'Error processing the file. Please try a different image/video or call (512) 555-MOVE.';
          } else {
            errorMessage += `${error.message}. Contact our Austin moving experts at (512) 555-MOVE if this persists.`;
          }
        } else {
          errorMessage += 'Unknown error occurred. Call our Austin team at (512) 555-MOVE for immediate help.';
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

  // Check backend availability on component mount
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const isAvailable = await backendApi.isBackendAvailable();
        setBackendStatus(isAvailable ? 'available' : 'unavailable');
        console.log('🔍 Backend status:', isAvailable ? 'Available' : 'Unavailable');
      } catch (error) {
        console.warn('Backend health check failed:', error);
        setBackendStatus('unavailable');
      }
    };

    checkBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionSuccess(false);

    try {
      if (onSubmit) {
        // Use custom onSubmit if provided
        onSubmit(formData, mediaFiles);
        return;
      }

      // Prepare quote request
      const quoteRequest: QuoteRequest = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        quote: {
          move_type: formData.moveType,
          move_date: formData.moveDate,
          from_address: formData.fromAddress,
          to_address: formData.toAddress,
          estimated_size: formData.estimatedSize,
          special_items: formData.specialItems,
          notes: formData.notes,
        },
        files: mediaFiles,
      };

      let success = false;
      let response: QuoteResponse | null = null;

      // Try backend first if available
      if (backendStatus === 'available') {
        try {
          console.log('🚀 Submitting quote via backend...');
          response = await backendApi.createQuote(quoteRequest);

          if (response.success && response.data?.quote.id) {
            // Add detected items to the quote if we have any
            if (detectedObjects.length > 0) {
              const detectedItems = detectedObjects.map(obj => ({
                item_label: obj.label,
                confidence_score: obj.score,
                quantity: 1,
              }));

              try {
                await backendApi.addDetectedItems(response.data.quote.id, detectedItems);
              } catch (itemError) {
                console.warn('Failed to add detected items:', itemError);
              }
            }

            // Submit the quote for processing (sends emails)
            try {
              await backendApi.submitQuote(response.data.quote.id);
              console.log('✅ Quote submitted and emails sent');
            } catch (submitError) {
              console.warn('Quote created but submission failed:', submitError);
            }

            setQuoteId(response.data.quote.id);
            success = true;
          }
        } catch (backendError) {
          console.error('Backend submission failed:', backendError);
          setBackendStatus('unavailable');
          // Fall through to email fallback
        }
      }

      // Fallback to EmailJS if backend is unavailable
      if (!success && backendStatus === 'unavailable') {
        console.log('📧 Attempting EmailJS fallback...');
        try {
          const emailSent = await backendApi.sendEmailFallback(quoteRequest);
          if (emailSent) {
            success = true;
            console.log('✅ Quote sent via EmailJS fallback');
          }
        } catch (emailError) {
          console.error('EmailJS fallback failed:', emailError);
        }
      }

      if (success) {
        setSubmissionSuccess(true);
        setSubmissionError('');
      } else {
        throw new Error('All submission methods failed. Please try again or contact us directly.');
      }

    } catch (error) {
      console.error('Quote submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmissionError(`Failed to submit quote: ${errorMessage}`);
      setSubmissionSuccess(false);
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
        <p className="text-gray-600 mb-2">
          Upload photos or videos of your items for an accurate Austin moving quote in 2 hours or less
        </p>
        <div className="bg-austin-green/10 border border-austin-green/20 rounded-lg p-3 text-sm text-austin-green max-w-md mx-auto">
          <span className="font-semibold">🤖 AI-Powered:</span> Our advanced system detects furniture and calculates moving costs instantly
        </div>
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
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
          />

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mt-4 bg-austin-blue/10 border border-austin-blue/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-austin-blue mr-3"></div>
                <div>
                  <span className="text-austin-blue font-medium block">
                    Analyzing your Austin moving items with AI...
                  </span>
                  <span className="text-austin-blue/70 text-sm">
                    Detecting furniture, appliances, and belongings for accurate pricing
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Error */}
          {analysisError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <div>
                  <p className="text-red-700 text-sm mb-2">{analysisError}</p>
                  <div className="bg-austin-blue/10 rounded p-2 text-xs text-austin-blue">
                    <strong>Need help?</strong> Call our Austin moving experts at (512) 555-MOVE for immediate assistance
                  </div>
                </div>
              </div>
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

        {/* Backend Status Indicator */}
        {backendStatus !== 'unknown' && (
          <div className={`text-center p-3 rounded-lg mb-4 ${backendStatus === 'available' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-medium ${backendStatus === 'available' ? 'text-green-700' : 'text-yellow-700'}`}>
              {backendStatus === 'available' ? (
                <><CheckCircle className="inline h-4 w-4 mr-1" /> Full service available - instant quotes & email confirmations</>
              ) : (
                <><AlertCircle className="inline h-4 w-4 mr-1" /> Limited service mode - quotes will be sent via email</>
              )}
            </p>
          </div>
        )}

        {/* Submission Success */}
        {submissionSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-green-900">Quote Submitted Successfully!</h3>
            </div>
            <div className="text-green-700 space-y-2">
              <p><strong>What happens next:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You'll receive an email confirmation within 5 minutes</li>
                <li>Our Austin moving specialists will review your request</li>
                <li>We'll contact you within 2 hours with a refined quote</li>
                <li>Ready to book? Call us at <strong>(512) 555-MOVE</strong></li>
              </ul>
              {quoteId && (
                <p className="text-xs text-green-600 mt-2">Quote ID: #{quoteId}</p>
              )}
            </div>
          </div>
        )}

        {/* Submission Error */}
        {submissionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-red-900 font-semibold">Submission Failed</h4>
                <p className="text-red-700 text-sm mt-1">{submissionError}</p>
                <p className="text-red-600 text-sm mt-2">
                  <strong>Need immediate help?</strong> Call us directly at <strong>(512) 555-MOVE</strong> or email <strong>hello@austinmovefinder.com</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!submissionSuccess && (
          <button
            type="submit"
            disabled={isSubmitting || isAnalyzing}
            className="w-full bg-austin-blue text-white px-6 py-4 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting Your Quote...
              </>
            ) : isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing Items...
              </>
            ) : totalQuoteCost > 0 ? (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Quote - ${totalQuoteCost.toLocaleString()}
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Get My Austin Moving Quote
              </>
            )}
          </button>
        )}

        {/* Enhanced Call-to-Action when quote is available */}
        {totalQuoteCost > 0 && !submissionSuccess && (
          <div className="text-center bg-gradient-to-r from-austin-green/10 to-austin-blue/10 rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-700 mb-2">
              🎉 <strong>Instant Quote Generated!</strong> Your estimated cost: <span className="text-austin-blue font-bold">${totalQuoteCost.toLocaleString()}</span>
            </p>
            <p className="text-xs text-gray-500">
              Submit this form to get your official quote and schedule your Austin move
            </p>
          </div>
        )}

        <div className="text-center">
          <div className="bg-gradient-to-r from-austin-blue/5 to-austin-green/5 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="text-lg">💡</span> <strong>Austin Moving Pro Tips:</strong>
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Show stairs/elevators (common in Austin apartments)</p>
              <p>• Include narrow doorways (older Austin homes)</p>
              <p>• Capture parking/access (especially downtown/SoCo)</p>
              <p>• Photo bulky items and Hill Country home challenges</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};