import React from 'react';
import { Clock, Shield, Users, Award } from 'lucide-react';
import { FastQuoteForm } from '../components/FastQuoteForm';
import { SEOHead } from '../components/SEOHead';

export const FastQuotePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead 
        title="Fast Quote - Austin Move Finder | Get Moving Quote in 2 Hours"
        description="Get an accurate moving quote in 2 hours or less. Upload photos or videos of your items for precise pricing. Professional Austin movers with transparent pricing."
        url="https://austinmovefinder.com/fast-quote"
        keywords={['Austin moving quote', 'fast moving estimate', 'Austin movers quote', 'moving cost calculator Austin', 'instant moving quote']}
      />
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Get Your Moving Quote in 2 Hours
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Upload photos or videos of your items and get an accurate, personalized moving quote 
          faster than ever. No home visit needed.
        </p>

        {/* Quick Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <div className="bg-austin-blue/10 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Clock className="h-8 w-8 text-austin-blue" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">2-Hour Response</h3>
            <p className="text-sm text-gray-600">Get your detailed quote fast</p>
          </div>

          <div className="text-center">
            <div className="bg-austin-green/10 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Shield className="h-8 w-8 text-austin-green" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Accurate Pricing</h3>
            <p className="text-sm text-gray-600">No hidden fees or surprises</p>
          </div>

          <div className="text-center">
            <div className="bg-austin-orange/10 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Users className="h-8 w-8 text-austin-orange" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Local Experts</h3>
            <p className="text-sm text-gray-600">Austin moving specialists</p>
          </div>

          <div className="text-center">
            <div className="bg-austin-purple/10 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Award className="h-8 w-8 text-austin-purple" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Top Rated</h3>
            <p className="text-sm text-gray-600">5-star Austin movers</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Fast Quote Form */}
        <div className="lg:col-span-2">
          <FastQuoteForm />
        </div>

        {/* Sidebar with Tips and Info */}
        <div className="space-y-8">
          {/* How It Works */}
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-austin-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900">Upload Media</div>
                  <div className="text-sm text-gray-600">Take photos or videos of your items and rooms</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-austin-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900">Fill Details</div>
                  <div className="text-sm text-gray-600">Add move date, addresses, and special requirements</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-austin-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900">Get Quote</div>
                  <div className="text-sm text-gray-600">Receive detailed pricing within 2 hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Tips */}
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              📸 Photo Tips for Best Quote
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-austin-blue">•</span>
                <span>Take wide shots of each room</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-austin-blue">•</span>
                <span>Show bulky or valuable items up close</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-austin-blue">•</span>
                <span>Include stairs, elevators, and narrow doorways</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-austin-blue">•</span>
                <span>Show parking areas and access points</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-austin-blue">•</span>
                <span>Good lighting helps us see details clearly</span>
              </div>
            </div>
          </div>

          {/* Pricing Promise */}
          <div className="austin-card p-6 bg-gradient-to-br from-austin-blue/5 to-austin-green/5 border border-austin-blue/20">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              Our Pricing Promise
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-austin-green" />
                <span>No hidden fees or surprise charges</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-austin-green" />
                <span>Competitive Austin-area pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-austin-green" />
                <span>Free quote with no obligation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-austin-green" />
                <span>Price-match guarantee</span>
              </div>
            </div>
          </div>

          {/* Contact Alternative */}
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              Prefer to Talk?
            </h3>
            <p className="text-gray-600 mb-4">
              Call us for immediate assistance or if you have complex moving needs.
            </p>
            <div className="space-y-2">
              <div className="font-semibold text-austin-blue text-lg">
                (512) 555-MOVE
              </div>
              <div className="text-sm text-gray-500">
                Monday - Friday: 9am - 6pm CST<br />
                Saturday: 10am - 4pm CST
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center bg-gradient-to-r from-austin-blue/10 to-austin-green/10 rounded-2xl p-8">
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
          Ready to Move to Austin?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Join thousands of satisfied customers who've made Austin their new home with our help. 
          Get started with your fast, accurate quote today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/neighborhoods"
            className="bg-white text-austin-blue px-6 py-3 rounded-lg font-semibold border border-austin-blue hover:bg-austin-blue hover:text-white transition-colors"
          >
            Explore Austin Neighborhoods
          </a>
          <a
            href="/moving-guide"
            className="bg-austin-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors"
          >
            View Moving Checklist
          </a>
        </div>
      </div>
    </div>
  );
};