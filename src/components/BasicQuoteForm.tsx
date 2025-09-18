import React, { useState } from 'react';
import { Send, Home, Package, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { backendApi, QuoteRequest } from '../services/backendApi';

interface BasicQuoteFormData {
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

interface BasicQuoteFormProps {
  onSubmit?: (data: BasicQuoteFormData) => void;
  className?: string;
}

export const BasicQuoteForm: React.FC<BasicQuoteFormProps> = ({
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState<BasicQuoteFormData>({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionSuccess(false);

    try {
      if (onSubmit) {
        // Use custom onSubmit if provided
        onSubmit(formData);
        setSubmissionSuccess(true);
        return;
      }

      // Prepare quote request for EmailJS fallback
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
        files: [], // No files for basic form
      };

      // Use EmailJS fallback (simpler and more reliable for basic form)
      console.log('📧 Submitting basic quote via EmailJS...');
      const emailSent = await backendApi.sendEmailFallback(quoteRequest);

      if (emailSent) {
        setSubmissionSuccess(true);
        setSubmissionError('');
        console.log('✅ Basic quote sent via EmailJS');
      } else {
        throw new Error('Email submission failed. Please try again or contact us directly.');
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
    <div className={`austin-card p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
          Get Your Austin Moving Quote
        </h3>
        <p className="text-gray-600 text-sm">
          Fill out this quick form and we'll get back to you within 2 hours with a personalized quote
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Move Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="moveType" className="block text-sm font-medium text-gray-700 mb-1">
              <Home className="inline h-4 w-4 mr-1" />
              Move Type *
            </label>
            <select
              id="moveType"
              name="moveType"
              required
              value={formData.moveType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            >
              <option value="local">Local Austin Move</option>
              <option value="long-distance">Long Distance</option>
              <option value="commercial">Commercial Move</option>
              <option value="storage">Storage Services</option>
            </select>
          </div>

          <div>
            <label htmlFor="estimatedSize" className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="inline h-4 w-4 mr-1" />
              Home Size *
            </label>
            <select
              id="estimatedSize"
              name="estimatedSize"
              required
              value={formData.estimatedSize}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            >
              <option value="studio">Studio/Efficiency</option>
              <option value="1br">1 Bedroom</option>
              <option value="2br">2 Bedroom</option>
              <option value="3br">3 Bedroom</option>
              <option value="4br+">4+ Bedroom</option>
              <option value="commercial">Commercial Space</option>
            </select>
          </div>

          <div>
            <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Move Date *
            </label>
            <input
              type="date"
              id="moveDate"
              name="moveDate"
              required
              value={formData.moveDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="specialItems" className="block text-sm font-medium text-gray-700 mb-1">
            Special Items or Services
          </label>
          <input
            type="text"
            id="specialItems"
            name="specialItems"
            placeholder="Piano, artwork, fragile items, packing services, etc."
            value={formData.specialItems}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Stairs, elevators, parking, timeline, or other details..."
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent text-sm"
          />
        </div>

        {/* Submission Success */}
        {submissionSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-sm font-semibold text-green-900">Quote Request Submitted!</h4>
            </div>
            <div className="text-green-700 text-xs space-y-1">
              <p><strong>What's next:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Email confirmation within 5 minutes</li>
                <li>Our Austin team will review your request</li>
                <li>You'll receive a detailed quote within 2 hours</li>
                <li>Questions? Call <strong>(512) 555-MOVE</strong></li>
              </ul>
            </div>
          </div>
        )}

        {/* Submission Error */}
        {submissionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-red-900 font-semibold text-sm">Submission Failed</h4>
                <p className="text-red-700 text-xs mt-1">{submissionError}</p>
                <p className="text-red-600 text-xs mt-1">
                  <strong>Need help?</strong> Call <strong>(512) 555-MOVE</strong> or email <strong>hello@austinmovefinder.com</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!submissionSuccess && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-austin-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Your Quote...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Get My Austin Moving Quote
              </>
            )}
          </button>
        )}

        {/* Additional Help */}
        <div className="text-center text-xs text-gray-500 bg-austin-blue/5 rounded-lg p-3">
          <p>
            💡 <strong>Need more detailed pricing?</strong> Visit our{' '}
            <a href="/fast-quote" className="text-austin-blue hover:text-austin-teal font-medium">
              Fast Quote page
            </a>{' '}
            to upload photos for AI-powered itemized quotes
          </p>
        </div>
      </form>
    </div>
  );
};