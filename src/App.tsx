import { useState } from 'react'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import UploadForm from './components/UploadForm'
import ImageComparison from './components/ImageComparison'
import ImagePreview from './components/ImagePreview'
import Alert from './components/Alert'
import type { ImageProcessing } from './lib/supabase'

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true)
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
  }

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl)
    setAlert(null)
  }

  const handleUploadError = (error: string) => {
    setAlert({ type: 'error', message: error })
    setIsUploading(false)
  }

  const handleGetStarted = () => {
    setShowLandingPage(false)
    document.body.className = 'bg-white'
  }

  if (showLandingPage) {
    document.body.className = 'bg-white'
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  return (
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
          />
        )}

        {previewImageUrl && (
          <ImagePreview 
            originalUrl={previewImageUrl}
            enhancedUrl={processing?.enhanced_url}
            isProcessing={isUploading}
          />
        )}

        {processing && processing.enhanced_url && processing.original_url && !isUploading && (
          <ImageComparison 
            originalUrl={processing.original_url}
            enhancedUrl={processing.enhanced_url}
          />
        )}

        <UploadForm 
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onImagePreview={handleImagePreview}
          disabled={isUploading}
        />
      </div>
    </div>
  )
}

export default App
