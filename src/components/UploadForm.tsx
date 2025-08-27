import { useState } from 'react'
import { supabase, AI_MODELS, type ImageProcessing } from '../lib/supabase'

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    
    if (file) {
      // Create preview URL for the selected image
      const imageUrl = URL.createObjectURL(file)
      onImagePreview(imageUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      onUploadError('Please select an image file')
      return
    }

    onUploadStart()

    try {
      // Call Real-ESRGAN API first
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('scale', '4')

      const apiUrl = import.meta.env.VITE_IMAGE_PROCESSING_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/api/enhance`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Enhancement failed')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error('Enhancement failed')
      }

      // Upload original image to Supabase Storage
      const originalFileName = `${Date.now()}_original_${selectedFile.name}`
      const { error: originalUploadError } = await supabase.storage
        .from('original-images')
        .upload(originalFileName, selectedFile)

      if (originalUploadError) {
        console.error('Original image upload error:', originalUploadError)
        throw new Error('Failed to upload original image')
      }

      // Convert enhanced image from base64 to blob for upload
      const enhancedImageBase64 = result.enhanced_image
      const enhancedImageBlob = await fetch(`data:image/png;base64,${enhancedImageBase64}`).then(r => r.blob())
      
      // Upload enhanced image to Supabase Storage
      const enhancedFileName = `${Date.now()}_enhanced_${selectedFile.name.replace(/\.[^/.]+$/, '')}.png`
      const { error: enhancedUploadError } = await supabase.storage
        .from('enhanced-images')
        .upload(enhancedFileName, enhancedImageBlob)

      if (enhancedUploadError) {
        console.error('Enhanced image upload error:', enhancedUploadError)
        throw new Error('Failed to upload enhanced image')
      }

      // Get public URLs for the uploaded images
      const { data: originalUrlData } = supabase.storage
        .from('original-images')
        .getPublicUrl(originalFileName)

      const { data: enhancedUrlData } = supabase.storage
        .from('enhanced-images')
        .getPublicUrl(enhancedFileName)

      const originalUrl = originalUrlData.publicUrl
      const enhancedUrl = enhancedUrlData.publicUrl

      // Save to database with storage URLs
      const processingData = {
        original_filename: selectedFile.name,
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

      // Create processing data for UI
      const uiProcessingData: ImageProcessing = {
        id: dbRecord?.id || Date.now().toString(),
        original_filename: selectedFile.name,
        original_url: originalUrl,
        enhanced_url: enhancedUrl,
        model_used: selectedModel,
        file_size: selectedFile.size,
        status: 'completed' as const,
        created_at: dbRecord?.created_at || new Date().toISOString(),
        updated_at: dbRecord?.updated_at || new Date().toISOString()
      }

      onUploadComplete(uiProcessingData)

      // Reset form
      setSelectedFile(null)
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error instanceof Error ? error.message : 'Enhancement failed')
    }
  }

  const selectedModelInfo = AI_MODELS.find(model => model.key === selectedModel)

  return (
    <form onSubmit={handleSubmit} className="upload-section">
      <div className="form-group">
        <label htmlFor="model">🤖 Select AI Model:</label>
        <select 
          name="model" 
          id="model" 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          required
          disabled={disabled}
        >
          {AI_MODELS.map(model => (
            <option key={model.key} value={model.key}>
              {model.name}
            </option>
          ))}
        </select>
        <div className="model-info">
          {selectedModelInfo?.description}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="file">📁 Select Image:</label>
        <input 
          type="file" 
          name="file" 
          id="file" 
          accept="image/*" 
          onChange={handleFileChange}
          required
          disabled={disabled}
        />
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={disabled}
      >
        {disabled ? '⏳ Processing...' : '✨ Enhance Image'}
      </button>
    </form>
  )
}
