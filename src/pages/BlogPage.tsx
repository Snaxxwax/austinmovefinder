import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  slug: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Austin Neighborhoods for Young Professionals',
    excerpt: 'Discover the best Austin areas for career-focused millennials and Gen Z professionals looking for the perfect work-life balance.',
    author: 'Sarah Martinez',
    date: '2025-07-15',
    category: 'Neighborhoods',
    slug: 'top-austin-neighborhoods-young-professionals',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Austin Moving Costs: Complete Budget Guide for 2025',
    excerpt: 'Everything you need to know about moving costs in Austin, from movers to deposits, utilities, and hidden expenses.',
    author: 'Mike Johnson',
    date: '2025-07-10',
    category: 'Moving Tips',
    slug: 'austin-moving-costs-budget-guide-2025',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'East Austin vs South Austin: Which is Right for You?',
    excerpt: 'A detailed comparison of two of Austin\'s most popular areas, covering lifestyle, costs, and community vibes.',
    author: 'Lisa Chen',
    date: '2025-07-05',
    category: 'Neighborhoods',
    slug: 'east-austin-vs-south-austin-comparison',
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Austin Food Scene: A Newcomer\'s Guide',
    excerpt: 'From food trucks to fine dining, discover Austin\'s incredible culinary landscape and must-try local favorites.',
    author: 'Carlos Rodriguez',
    date: '2025-07-01',
    category: 'Lifestyle',
    slug: 'austin-food-scene-newcomer-guide',
    readTime: '7 min read'
  },
  {
    id: '5',
    title: 'Surviving Your First Austin Summer: A Transplant\'s Guide',
    excerpt: 'Essential tips for dealing with Austin\'s intense heat, from clothing choices to finding the best swimming holes.',
    author: 'Jennifer Kim',
    date: '2025-06-28',
    category: 'Lifestyle',
    slug: 'surviving-first-austin-summer-guide',
    readTime: '4 min read'
  }
];

const categories = ['All', 'Neighborhoods', 'Moving Tips', 'Lifestyle', 'Local Events'];

export const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead 
        title="Austin Moving Blog - Tips, Guides & Local Insights | Austin Move Finder"
        description="Expert insights on moving to Austin, TX. Neighborhood guides, moving tips, local lifestyle advice, and everything you need to know about Austin living."
        url="https://austinmovefinder.com/blog"
        keywords={['Austin blog', 'Austin moving tips', 'Austin lifestyle', 'Austin neighborhoods', 'moving to Austin advice']}
      />
      
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Austin Moving Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expert insights, local tips, and everything you need to know about moving to and living in Austin, Texas.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-austin-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-austin-blue/10 hover:text-austin-blue'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article key={post.id} className="austin-card overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-austin-blue to-austin-teal"></div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 bg-austin-blue/10 text-austin-blue text-xs rounded-full font-medium">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              
              <h2 className="font-heading text-xl font-bold text-gray-900 mb-3 hover:text-austin-blue transition-colors cursor-pointer">
                {post.title}
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <button className="text-austin-blue hover:text-austin-teal font-semibold inline-flex items-center group">
                Read More
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="mt-16 austin-card p-8 text-center austin-gradient text-white">
        <h2 className="font-heading text-2xl font-bold mb-4">
          Stay Updated with Austin Moving Tips
        </h2>
        <p className="mb-6 opacity-90">
          Get the latest Austin neighborhood guides, moving tips, and local insights delivered to your inbox.
        </p>
        <div className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
          />
          <button className="bg-white text-austin-blue px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};
