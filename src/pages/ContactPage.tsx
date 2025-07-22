import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    moveDate: '',
    currentLocation: '',
    budget: '',
    interests: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead 
        title="Contact Austin Move Finder - Get Personalized Moving Help"
        description="Contact Austin Move Finder for personalized moving assistance. Get expert advice on Austin neighborhoods, moving tips, and relocation support."
        url="https://austinmovefinder.com/contact"
        keywords={['contact Austin Move Finder', 'Austin moving help', 'Austin relocation assistance', 'moving to Austin contact']}
      />
      
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Get Personalized Austin Moving Help
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ready to make your move to Austin? We're here to help with personalized recommendations, 
          local insights, and expert guidance for your relocation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="austin-card p-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
              Tell Us About Your Move
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Planned Move Date
                  </label>
                  <input
                    type="date"
                    id="moveDate"
                    name="moveDate"
                    value={formData.moveDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    id="currentLocation"
                    name="currentLocation"
                    placeholder="City, State"
                    value={formData.currentLocation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Housing Budget
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-1500">Under $1,500/month</option>
                    <option value="1500-2000">$1,500 - $2,000/month</option>
                    <option value="2000-2500">$2,000 - $2,500/month</option>
                    <option value="2500-3000">$2,500 - $3,000/month</option>
                    <option value="3000-plus">$3,000+/month</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                  What interests you most about Austin?
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  placeholder="e.g., music scene, outdoor activities, tech industry, food culture"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us more about your move
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Share any specific questions, concerns, or requirements for your Austin move..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-austin-blue focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-austin-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-austin-teal transition-colors inline-flex items-center justify-center"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-8">
          {/* Contact Details */}
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-austin-blue mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-gray-600">hello@austinmovefinder.com</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-austin-green mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Phone</div>
                  <div className="text-gray-600">(512) 555-MOVE</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-austin-orange mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Location</div>
                  <div className="text-gray-600">Austin, Texas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              <Clock className="inline h-6 w-6 text-austin-blue mr-2" />
              Response Time
            </h3>
            <p className="text-gray-700 mb-4">
              We typically respond to all inquiries within 24 hours during business days.
            </p>
            <div className="text-sm text-gray-600">
              <div>Monday - Friday: 9am - 6pm CST</div>
              <div>Saturday: 10am - 4pm CST</div>
              <div>Sunday: Closed</div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="austin-card p-6">
            <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">
              <MessageSquare className="inline h-6 w-6 text-austin-green mr-2" />
              Quick Questions?
            </h3>
            <div className="space-y-2">
              <a href="/moving-guide" className="block text-austin-blue hover:text-austin-teal">
                → Moving Timeline & Checklist
              </a>
              <a href="/neighborhoods" className="block text-austin-blue hover:text-austin-teal">
                → Neighborhood Comparison
              </a>
              <a href="/blog" className="block text-austin-blue hover:text-austin-teal">
                → Latest Austin Moving Tips
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
