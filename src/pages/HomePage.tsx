import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';
import { austinNeighborhoods } from '../lib/utils';

export const HomePage: React.FC = () => {
  const featuredNeighborhoods = austinNeighborhoods.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="austin-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              Your Guide to Moving to Austin
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover the perfect Austin neighborhood, get expert moving tips, 
              and everything you need for your Texas relocation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/neighborhoods" 
                className="bg-white text-austin-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Explore Neighborhoods
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/moving-guide" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-austin-blue transition-colors inline-flex items-center justify-center"
              >
                Moving Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="austin-card p-6">
              <Users className="h-12 w-12 text-austin-blue mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">50,000+</h3>
              <p className="text-gray-600">People helped with their Austin move</p>
            </div>
            <div className="austin-card p-6">
              <MapPin className="h-12 w-12 text-austin-green mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">25+</h3>
              <p className="text-gray-600">Austin neighborhoods covered</p>
            </div>
            <div className="austin-card p-6">
              <TrendingUp className="h-12 w-12 text-austin-orange mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600">Successful relocation rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Neighborhoods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Austin Neighborhoods
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the unique character and amenities of Austin's most sought-after areas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredNeighborhoods.map((neighborhood) => (
              <div key={neighborhood.slug} className="neighborhood-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-xl font-bold text-gray-900">
                    {neighborhood.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{neighborhood.walkScore}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{neighborhood.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-austin-blue">
                    Avg. Rent: {neighborhood.averageRent}
                  </span>
                  <span className="text-sm text-gray-500">
                    Walk Score: {neighborhood.walkScore}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {neighborhood.features.slice(0, 3).map((feature) => (
                    <span 
                      key={feature}
                      className="px-2 py-1 bg-austin-blue/10 text-austin-blue text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <Link 
                  to={`/neighborhoods/${neighborhood.slug}`}
                  className="text-austin-blue hover:text-austin-teal font-semibold inline-flex items-center"
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/neighborhoods"
              className="bg-austin-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center"
            >
              View All Neighborhoods
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Austin */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Move to Austin?
              </h2>
              <div className="space-y-4">
                {[
                  'No state income tax in Texas',
                  'Thriving tech and startup scene',
                  'World-class live music and entertainment',
                  'Amazing food scene and food trucks',
                  'Beautiful outdoor spaces and activities',
                  'Keep Austin Weird culture and community'
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-austin-green flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link 
                  to="/about"
                  className="bg-austin-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-green/90 transition-colors inline-flex items-center"
                >
                  Learn More About Austin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div className="austin-card p-8">
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                Start Your Austin Journey
              </h3>
              <p className="text-gray-600 mb-6">
                Get personalized recommendations and expert guidance for your move to Austin.
              </p>
              <Link 
                to="/contact"
                className="w-full bg-austin-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
