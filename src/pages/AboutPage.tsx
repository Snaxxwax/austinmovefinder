import React from 'react';
import { MapPin, Users, Award, Heart } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead 
        title="About Austin Move Finder - Your Austin Relocation Experts"
        description="Learn about Austin Move Finder's mission to help people relocate to Austin, TX. Expert guidance, local insights, and personalized support for your Austin move."
        url="https://austinmovefinder.com/about"
        keywords={['Austin Move Finder', 'Austin relocation experts', 'moving to Austin help', 'Austin moving company']}
      />
      
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          About Austin Move Finder
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're passionate Austinites dedicated to helping people find their perfect place in our amazing city.
        </p>
      </div>

      {/* Mission Section */}
      <section className="austin-card p-8 mb-12">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-austin-blue mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed text-center">
          Moving to a new city can be overwhelming, especially one as unique and rapidly growing as Austin. 
          Austin Move Finder was created to make your relocation journey smoother, more informed, and less stressful. 
          We believe everyone deserves to find their perfect Austin neighborhood and truly feel at home in the 
          Live Music Capital of the World.
        </p>
      </section>

      {/* Why We Started */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Why We Started Austin Move Finder
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Austin is experiencing unprecedented growth, with hundreds of people moving here every day. 
              While this growth brings amazing energy and opportunities, it also creates challenges for newcomers 
              trying to navigate our diverse neighborhoods, understand local culture, and make informed decisions 
              about where to live.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              As longtime Austin residents who have helped friends and family relocate here, we saw a need for 
              comprehensive, unbiased, and locally-focused moving resources. That's why we created Austin Move Finder 
              – to be your trusted guide through every step of your Austin journey.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We're not just another moving website. We're your neighbors, sharing insider knowledge and genuine 
              insights to help you not just move to Austin, but truly become part of the community.
            </p>
          </div>
          
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">What Sets Us Apart</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-austin-blue rounded-full mt-2"></div>
                <span className="text-gray-700">Local expertise from long-time Austin residents</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-austin-green rounded-full mt-2"></div>
                <span className="text-gray-700">Unbiased neighborhood information and insights</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-austin-orange rounded-full mt-2"></div>
                <span className="text-gray-700">Comprehensive moving guides and checklists</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-austin-purple rounded-full mt-2"></div>
                <span className="text-gray-700">Personalized recommendations based on your needs</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Impact
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center austin-card p-6">
            <Users className="h-12 w-12 text-austin-blue mx-auto mb-4" />
            <div className="font-heading text-3xl font-bold text-gray-900 mb-2">50,000+</div>
            <div className="text-gray-600">People Helped</div>
          </div>
          
          <div className="text-center austin-card p-6">
            <MapPin className="h-12 w-12 text-austin-green mx-auto mb-4" />
            <div className="font-heading text-3xl font-bold text-gray-900 mb-2">25+</div>
            <div className="text-gray-600">Neighborhoods Covered</div>
          </div>
          
          <div className="text-center austin-card p-6">
            <Award className="h-12 w-12 text-austin-orange mx-auto mb-4" />
            <div className="font-heading text-3xl font-bold text-gray-900 mb-2">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </section>

      {/* Austin Love */}
      <section className="austin-card p-8 austin-gradient text-white text-center">
        <h2 className="font-heading text-2xl font-bold mb-4">
          We Love Austin (And We Think You Will Too!)
        </h2>
        <p className="text-lg opacity-90 mb-6">
          From the breakfast tacos to the live music, from Lady Bird Lake to the Hill Country, 
          from tech innovation to creative culture – Austin has something for everyone. 
          Our goal is to help you discover your perfect piece of this incredible city.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>🌮 Best Food Scene</div>
          <div>🎵 Live Music Capital</div>
          <div>🏊‍♀️ Outdoor Paradise</div>
          <div>💻 Tech Hub</div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-12 text-center">
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Your Austin Journey?
        </h2>
        <p className="text-gray-600 mb-6">
          Let us help you find your perfect Austin neighborhood and make your move as smooth as possible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/neighborhoods"
            className="bg-austin-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors"
          >
            Explore Neighborhoods
          </a>
          <a 
            href="/contact"
            className="border-2 border-austin-blue text-austin-blue px-6 py-3 rounded-lg font-semibold hover:bg-austin-blue hover:text-white transition-colors"
          >
            Get Personalized Help
          </a>
        </div>
      </section>
    </div>
  );
};
