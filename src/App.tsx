import { useState } from 'react'
import Header from './components/Header'
import UploadForm from './components/UploadForm'
import ProgressBar from './components/ProgressBar'
import ImageComparison from './components/ImageComparison'
import ImagePreview from './components/ImagePreview'
import Alert from './components/Alert'
import type { ImageProcessing } from './lib/supabase'
import './App.css'

function App() {
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

  const handleProcessingComplete = (result: ImageProcessing) => {
    setProcessing(result)
    setAlert({ type: 'success', message: 'Image enhancement completed successfully!' })
  }

  return (
    <div className="container">
      <Header />
      
      <div className="main-content">
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

        {isUploading && (
          <ProgressBar 
            processing={processing}
            onComplete={handleProcessingComplete}
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
