import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-8 w-8 text-austin-blue" />
              <span className="font-heading font-bold text-xl">Austin Move Finder</span>
            </div>
            <p className="text-gray-300 mb-4">
              Your complete guide to moving to Austin, Texas. Find the perfect neighborhood, 
              get moving tips, and discover everything Austin has to offer.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-austin-blue transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-austin-blue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-austin-blue transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/neighborhoods" className="text-gray-300 hover:text-austin-blue transition-colors">Austin Neighborhoods</Link></li>
              <li><Link to="/moving-guide" className="text-gray-300 hover:text-austin-blue transition-colors">Moving Guide</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-austin-blue transition-colors">Blog</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-austin-blue transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-austin-blue transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Popular Neighborhoods */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Popular Areas</h3>
            <ul className="space-y-2">
              <li><Link to="/neighborhoods/downtown" className="text-gray-300 hover:text-austin-blue transition-colors">Downtown Austin</Link></li>
              <li><Link to="/neighborhoods/south-austin" className="text-gray-300 hover:text-austin-blue transition-colors">South Austin</Link></li>
              <li><Link to="/neighborhoods/east-austin" className="text-gray-300 hover:text-austin-blue transition-colors">East Austin</Link></li>
              <li><Link to="/neighborhoods/west-lake-hills" className="text-gray-300 hover:text-austin-blue transition-colors">West Lake Hills</Link></li>
              <li><Link to="/neighborhoods/cedar-park" className="text-gray-300 hover:text-austin-blue transition-colors">Cedar Park</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-austin-blue" />
                <span className="text-gray-300">hello@austinmovefinder.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-austin-blue" />
                <span className="text-gray-300">(512) 555-MOVE</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-austin-blue mt-1" />
                <span className="text-gray-300">Austin, Texas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Austin Move Finder. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-austin-blue text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-austin-blue text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/sitemap" className="text-gray-400 hover:text-austin-blue text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
