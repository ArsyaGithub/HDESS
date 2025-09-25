import { useState, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import Header from './components/Header'
import Alert from './components/Alert'
import ProtectedRoute from './components/ProtectedRoute'
import type { ImageProcessing } from './lib/supabase'

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./components/LandingPage'))
const Login = lazy(() => import('./components/Login'))
const Register = lazy(() => import('./components/Register'))
const UploadForm = lazy(() => import('./components/UploadForm'))
const ImageComparison = lazy(() => import('./components/ImageComparison'))
const ImagePreview = lazy(() => import('./components/ImagePreview'))

// Main App component with routing
const MainApp = () => {
  const [processing, setProcessing] = useState<ImageProcessing | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  const handleUploadStart = () => {
    setIsUploading(true)
    setAlert(null)
  }

  const handleUploadComplete = (result: ImageProcessing) => {
    setProcessing(result)
    setIsUploading(false)
    setAlert({ 
      type: 'success', 
      message: `Image enhanced successfully! Download your enhanced image: ${result.original_filename}` 
    })
  }

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl)
    setAlert(null)
  }

  const handleUploadError = (error: string) => {
    setAlert({ type: 'error', message: error })
    setIsUploading(false)
  }

  const handleDownloadComplete = () => {
    // Reset all states to go back to upload form
    setProcessing(null)
    setAlert(null)
    setPreviewImageUrl(null)
    setIsUploading(false)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-800 font-inter">
        <Header />
        
        <div className="max-w-6xl mx-auto px-5 py-15">
          {alert && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)}
              downloadUrl={processing?.enhanced_url}
              originalFilename={processing?.original_filename}
              onDownloadComplete={handleDownloadComplete}
            />
          )}

          {previewImageUrl && (
            <Suspense fallback={<LoadingSpinner message="Loading preview..." />}>
              <ImagePreview 
                originalUrl={previewImageUrl}
                enhancedUrl={processing?.enhanced_url}
                isProcessing={isUploading}
              />
            </Suspense>
          )}

          {processing && processing.enhanced_url && processing.original_url && !isUploading && (
            <Suspense fallback={<LoadingSpinner message="Loading comparison..." />}>
              <ImageComparison 
                originalUrl={processing.original_url}
                enhancedUrl={processing.enhanced_url}
              />
            </Suspense>
          )}

          <Suspense fallback={<LoadingSpinner message="Loading upload form..." />}>
            <UploadForm 
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onImagePreview={handleImagePreview}
              disabled={isUploading}
            />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner size="lg" message="Loading application..." />}>
            <Routes>
              {/* Landing Page - Public */}
              <Route 
                path="/" 
                element={<LandingPage onGetStarted={() => window.location.href = '/login'} />} 
              />
              
              {/* Authentication Routes - Public */}
              <Route 
                path="/login" 
                element={<Login onSuccess={() => window.location.href = '/app'} />} 
              />
              <Route 
                path="/register" 
                element={<Register onSuccess={() => window.location.href = '/app'} />} 
              />
              
              {/* Main App - Protected */}
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute>
                    <MainApp />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect any unknown routes to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  )
}

export default App
