import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { NeighborhoodsPage } from './pages/NeighborhoodsPage';
import { MovingGuidePage } from './pages/MovingGuidePage';
import { BlogPage } from './pages/BlogPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FastQuotePage } from './pages/FastQuotePage';
import { usePerformance } from './hooks/usePerformance';

function App() {
  // Monitor performance in development and production
  usePerformance(true);

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('✅ Austin Move Finder SW registered:', registration);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    console.log('🔄 New version of Austin Move Finder available');
                    // You could show a toast notification here
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('❌ Austin Move Finder SW registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background">
            {/* SEOHead now implemented per-page for better targeting */}

            <ErrorBoundary>
              <Navigation />
            </ErrorBoundary>

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <HomePage />
                  </ErrorBoundary>
                } />
                <Route path="/neighborhoods" element={
                  <ErrorBoundary>
                    <NeighborhoodsPage />
                  </ErrorBoundary>
                } />
                <Route path="/neighborhoods/:slug" element={
                  <ErrorBoundary>
                    <NeighborhoodsPage />
                  </ErrorBoundary>
                } />
                <Route path="/moving-guide" element={
                  <ErrorBoundary>
                    <MovingGuidePage />
                  </ErrorBoundary>
                } />
                <Route path="/blog" element={
                  <ErrorBoundary>
                    <BlogPage />
                  </ErrorBoundary>
                } />
                <Route path="/about" element={
                  <ErrorBoundary>
                    <AboutPage />
                  </ErrorBoundary>
                } />
                <Route path="/contact" element={
                  <ErrorBoundary>
                    <ContactPage />
                  </ErrorBoundary>
                } />
                <Route path="/fast-quote" element={
                  <ErrorBoundary>
                    <FastQuotePage />
                  </ErrorBoundary>
                } />
              </Routes>
            </main>

            <ErrorBoundary>
              <Footer />
            </ErrorBoundary>
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
