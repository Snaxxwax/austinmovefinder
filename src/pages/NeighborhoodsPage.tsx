import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, Star, ArrowLeft, Search, Filter } from 'lucide-react';
import { austinNeighborhoods } from '../lib/utils';
import { SEOHead } from '../components/SEOHead';

export const NeighborhoodsPage: React.FC = () => {
  const { slug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rent' | 'walkScore'>('name');

  // Optimized filtering and sorting with useMemo for performance
  const filteredAndSortedNeighborhoods = useMemo(() => {
    let filtered = austinNeighborhoods;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(neighborhood =>
        neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        neighborhood.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        neighborhood.features.some(feature =>
          feature.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort neighborhoods
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rent':
          const rentA = parseInt(a.averageRent.replace(/[^0-9]/g, ''));
          const rentB = parseInt(b.averageRent.replace(/[^0-9]/g, ''));
          return rentA - rentB;
        case 'walkScore':
          return b.walkScore - a.walkScore;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, sortBy]);
  
  // If we have a slug, show individual neighborhood page
  if (slug) {
    const neighborhood = austinNeighborhoods.find(n => n.slug === slug);
    
    if (!neighborhood) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Neighborhood Not Found</h1>
          <Link to="/neighborhoods" className="text-austin-blue hover:text-austin-teal">
            ← Back to Neighborhoods
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SEOHead 
          title={`${neighborhood.name} Austin - Neighborhood Guide | Austin Move Finder`}
          description={`Complete guide to ${neighborhood.name} in Austin, TX. ${neighborhood.description} Average rent, walk score, and local amenities.`}
          url={`https://austinmovefinder.com/neighborhoods/${slug}`}
          keywords={[`${neighborhood.name}`, 'Austin neighborhood', 'Austin real estate', 'moving to Austin']}
          neighborhood={neighborhood}
        />
        
        <Link 
          to="/neighborhoods" 
          className="inline-flex items-center text-austin-blue hover:text-austin-teal mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Neighborhoods
        </Link>
        
        <div className="austin-card p-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {neighborhood.name}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">{neighborhood.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-austin-blue/5 rounded-lg">
              <DollarSign className="h-8 w-8 text-austin-blue mx-auto mb-2" />
              <div className="font-semibold text-lg">{neighborhood.averageRent}</div>
              <div className="text-sm text-gray-600">Average Rent</div>
            </div>
            
            <div className="text-center p-4 bg-austin-green/5 rounded-lg">
              <TrendingUp className="h-8 w-8 text-austin-green mx-auto mb-2" />
              <div className="font-semibold text-lg">{neighborhood.walkScore}</div>
              <div className="text-sm text-gray-600">Walk Score</div>
            </div>
            
            <div className="text-center p-4 bg-austin-orange/5 rounded-lg">
              <Star className="h-8 w-8 text-austin-orange mx-auto mb-2" />
              <div className="font-semibold text-lg">4.5/5</div>
              <div className="text-sm text-gray-600">Resident Rating</div>
            </div>
          </div>
          
          <div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {neighborhood.features.map((feature) => (
                <div 
                  key={feature}
                  className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-austin-blue rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show all neighborhoods
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead 
        title="Austin Neighborhoods Guide - Find Your Perfect Area | Austin Move Finder"
        description="Comprehensive guide to Austin, TX neighborhoods. Compare areas by rent, walk score, amenities, and local features to find your perfect Austin home."
        url="https://austinmovefinder.com/neighborhoods"
        keywords={['Austin neighborhoods', 'Austin areas', 'where to live Austin', 'Austin real estate', 'Austin moving guide']}
      />
      
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Austin Neighborhoods
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Explore Austin's diverse neighborhoods to find the perfect place to call home.
          From vibrant downtown living to peaceful suburban communities.
        </p>

        {/* Search and Filter Controls */}
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search neighborhoods, features, or amenities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'rent' | 'walkScore')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent appearance-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="rent">Sort by Rent (Low to High)</option>
                <option value="walkScore">Sort by Walk Score (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedNeighborhoods.length} of {austinNeighborhoods.length} neighborhoods
            {searchTerm && (
              <span className="ml-1">
                for "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-austin-blue hover:text-austin-teal underline"
                >
                  Clear
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAndSortedNeighborhoods.length > 0 ? (
          filteredAndSortedNeighborhoods.map((neighborhood) => (
          <div key={neighborhood.slug} className="neighborhood-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-gray-900">
                {neighborhood.name}
              </h2>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{neighborhood.walkScore}</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{neighborhood.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Rent:</span>
                <span className="font-semibold text-austin-blue">{neighborhood.averageRent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Walk Score:</span>
                <span className="font-semibold text-austin-green">{neighborhood.walkScore}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {neighborhood.features.slice(0, 4).map((feature) => (
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
              className="w-full bg-austin-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Explore {neighborhood.name}
            </Link>
          </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="austin-card p-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                No neighborhoods found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse all neighborhoods.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-austin-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-austin-teal transition-colors"
              >
                View All Neighborhoods
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-16 austin-card p-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
          Need Help Choosing?
        </h2>
        <p className="text-gray-600 mb-6">
          Not sure which Austin neighborhood is right for you? Get personalized recommendations 
          based on your lifestyle, budget, and preferences.
        </p>
        <Link 
          to="/contact"
          className="bg-austin-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-green/90 transition-colors"
        >
          Get Neighborhood Recommendations
        </Link>
      </div>
    </div>
  );
};
