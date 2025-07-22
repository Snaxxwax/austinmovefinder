import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { NeighborhoodsPage } from './pages/NeighborhoodsPage';
import { MovingGuidePage } from './pages/MovingGuidePage';
import { BlogPage } from './pages/BlogPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { SEOHead } from './components/SEOHead';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background">
          <SEOHead 
            title="Austin Move Finder - Your Guide to Moving in Austin, TX"
            description="Complete guide to moving to Austin, Texas. Find neighborhoods, moving tips, local resources, and everything you need for your Austin move."
            url="https://austinmovefinder.com"
          />
          
          <Navigation />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/neighborhoods" element={<NeighborhoodsPage />} />
              <Route path="/neighborhoods/:slug" element={<NeighborhoodsPage />} />
              <Route path="/moving-guide" element={<MovingGuidePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
