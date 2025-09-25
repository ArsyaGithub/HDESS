import { useState } from 'react'
import { supabase, AI_MODELS, type ImageProcessing } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'

interface UploadFormProps {
  onUploadStart: () => void
  onUploadComplete: (result: ImageProcessing) => void
  onUploadError: (error: string) => void
  disabled: boolean
  onImagePreview: (imageUrl: string) => void
}

export default function UploadForm({ onUploadStart, onUploadComplete, onUploadError, disabled, onImagePreview }: UploadFormProps) {
  const [selectedModel, setSelectedModel] = useState('RealESRGAN_x4plus')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('Enhancing your image...')

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    
    if (file) {
      // Create preview URL for the selected image
      const imageUrl = URL.createObjectURL(file)
      onImagePreview(imageUrl)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        handleFileChange(file)
      } else {
        onUploadError('Please select an image file')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      onUploadError('Please select an image file')
      return
    }

    onUploadStart()
    setUploadProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Start with initial progress
      setUploadProgress(5)
      setProgressMessage('Preparing image for enhancement...')

      // Call Real-ESRGAN API first
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('scale', '4')
      formData.append('model', selectedModel)

      const apiUrl = import.meta.env.VITE_IMAGE_PROCESSING_API_URL || 'http://localhost:8080'
      
      setUploadProgress(10)
      setProgressMessage('Connecting to AI server...')

      let response
      try {
        const token = localStorage.getItem('authToken')
        const headers: Record<string, string> = {
          'Accept': 'application/json',
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        setUploadProgress(15)
        setProgressMessage('Loading AI model...')
        
        // Start realistic progress simulation for AI processing
        progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = Math.min(prev + Math.random() * 2 + 0.5, 60)
            
            // Update message based on progress
            if (newProgress < 25) {
              setProgressMessage('Analyzing image structure...')
            } else if (newProgress < 40) {
              setProgressMessage('AI upscaling in progress...')
            } else if (newProgress < 55) {
              setProgressMessage('Enhancing details and textures...')
            } else {
              setProgressMessage('Applying final AI enhancements...')
            }
            
            return newProgress
          })
        }, 600)
        
        response = await fetch(`${apiUrl}/api/enhance`, {
          method: 'POST',
          mode: 'cors',
          headers,
          body: formData
        })
      } catch (fetchError) {
        if (progressInterval) clearInterval(progressInterval)
        throw new Error(`Cannot connect to API server at ${apiUrl}. Please make sure the backend is running.`)
      }

      if (!response.ok) {
        if (progressInterval) clearInterval(progressInterval)
        let errorMessage = 'Enhancement failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (!result.success) {
        if (progressInterval) clearInterval(progressInterval)
        throw new Error('Enhancement failed')
      }

      // Clear progress interval and set to 65%
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(65)
      setProgressMessage('Processing enhanced image...')

      // Generate enhanced filename with proper format
      const fileExtension = selectedFile.name.split('.').pop() || 'jpg'
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
      const enhancedDisplayName = `enhanced_${fileNameWithoutExt}.${fileExtension}`
      
      console.log('Original filename:', selectedFile.name)
      console.log('Enhanced filename:', enhancedDisplayName)

      // Upload original image to Supabase Storage
      const originalFileName = `${Date.now()}_original_${selectedFile.name}`
      const { error: originalUploadError } = await supabase.storage
        .from('original-images')
        .upload(originalFileName, selectedFile)

      if (originalUploadError) {
        console.error('Original image upload error:', originalUploadError)
        throw new Error('Failed to upload original image')
      }

      setUploadProgress(75)
      setProgressMessage('Uploading enhanced image...')

      // Convert enhanced image from base64 to blob for upload
      const enhancedImageBase64 = result.enhanced_image
      const enhancedImageBlob = await fetch(`data:image/png;base64,${enhancedImageBase64}`).then(r => r.blob())
      
      // Upload enhanced image to Supabase Storage (keep original extension for download)
      const enhancedFileName = `${Date.now()}_${enhancedDisplayName}`
      const { error: enhancedUploadError } = await supabase.storage
        .from('enhanced-images')
        .upload(enhancedFileName, enhancedImageBlob)

      if (enhancedUploadError) {
        console.error('Enhanced image upload error:', enhancedUploadError)
        throw new Error('Failed to upload enhanced image')
      }

      setUploadProgress(85)
      setProgressMessage('Generating download links...')

      // Get public URLs for the uploaded images
      const { data: originalUrlData } = supabase.storage
        .from('original-images')
        .getPublicUrl(originalFileName)

      const { data: enhancedUrlData } = supabase.storage
        .from('enhanced-images')
        .getPublicUrl(enhancedFileName)

      const originalUrl = originalUrlData.publicUrl
      const enhancedUrl = enhancedUrlData.publicUrl

      setUploadProgress(92)
      setProgressMessage('Saving to database...')

      // Save to database with storage URLs
      const processingData = {
        original_filename: enhancedDisplayName, // Use enhanced filename for display
        original_url: originalUrl,
        enhanced_url: enhancedUrl,
        model_used: selectedModel,
        file_size: selectedFile.size,
        status: 'completed'
      }

      const { data: dbRecord, error: dbError } = await supabase
        .from('image_processing')
        .insert(processingData)
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        // Still continue with UI update even if DB fails
      }

      setUploadProgress(98)
      setProgressMessage('Finalizing...')

      // Create processing data for UI with enhanced filename
      const uiProcessingData: ImageProcessing = {
        id: dbRecord?.id || Date.now().toString(),
        original_filename: enhancedDisplayName, // Use enhanced filename for display
        original_url: originalUrl,
        enhanced_url: enhancedUrl,
        model_used: selectedModel,
        file_size: selectedFile.size,
        status: 'completed' as const,
        created_at: dbRecord?.created_at || new Date().toISOString(),
        updated_at: dbRecord?.updated_at || new Date().toISOString()
      }

      setUploadProgress(100)
      setProgressMessage('Enhancement completed!')

      // Small delay to show 100% before completing
      setTimeout(() => {
        onUploadComplete(uiProcessingData)
        
        // Reset form
        setSelectedFile(null)
        setUploadProgress(0)
        setProgressMessage('Enhancing your image...')
        const fileInput = document.getElementById('file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }, 500)

    } catch (error) {
      console.error('Upload error:', error)
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(0)
      setProgressMessage('Enhancing your image...')
      onUploadError(error instanceof Error ? error.message : 'Enhancement failed')
    }
  }

  const selectedModelInfo = AI_MODELS.find(model => model.key === selectedModel)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (disabled) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
        <LoadingSpinner 
          size="lg" 
          message={progressMessage} 
          progress={uploadProgress}
          showProgress={true}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Enhance Image</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Model Selection */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          <select 
            name="model" 
            id="model" 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            required
            disabled={disabled}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
          >
            {AI_MODELS.map(model => (
              <option key={model.key} value={model.key}>
                {model.name}
              </option>
            ))}
          </select>
          {selectedModelInfo?.description && (
            <p className="mt-1.5 text-xs text-gray-500">
              {selectedModelInfo.description}
            </p>
          )}
        </div>

        {/* Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Upload
          </label>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleInputChange}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Drag and drop or browse to choose a file'}
                </p>
                {!selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={disabled}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || !selectedFile}
        >
          {disabled ? 'Processing...' : 'Enhance Image'}
        </button>
      </form>
    </div>
  )
}
