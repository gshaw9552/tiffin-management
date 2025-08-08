import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KindeProvider } from './lib/kinde';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import HowItWorksPage from './pages/HowItWorksPage';

export default function App() {
  return (
    <KindeProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/vendor/:id" element={<VendorDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </KindeProvider>
  );
}