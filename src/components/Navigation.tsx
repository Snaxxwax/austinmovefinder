import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/neighborhoods', label: 'Neighborhoods' },
    { path: '/moving-guide', label: 'Moving Guide' },
    { path: '/fast-quote', label: 'Fast Quote', highlight: true },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-austin-blue/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-austin-blue hover:text-austin-teal transition-colors">
            <MapPin className="h-8 w-8" />
            <span className="font-heading font-bold text-xl">Austin Move Finder</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.highlight
                    ? 'bg-austin-blue text-white hover:bg-austin-teal'
                    : isActivePath(item.path)
                    ? 'text-austin-blue bg-austin-blue/10 border-b-2 border-austin-blue'
                    : 'text-gray-700 hover:text-austin-blue hover:bg-austin-blue/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-austin-blue focus:outline-none focus:ring-2 focus:ring-austin-blue p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-austin-blue/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  item.highlight
                    ? 'bg-austin-blue text-white hover:bg-austin-teal'
                    : isActivePath(item.path)
                    ? 'text-austin-blue bg-austin-blue/10'
                    : 'text-gray-700 hover:text-austin-blue hover:bg-austin-blue/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
