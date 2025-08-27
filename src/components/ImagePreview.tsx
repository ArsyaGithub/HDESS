interface ImagePreviewProps {
  originalUrl?: string
  enhancedUrl?: string
  isProcessing?: boolean
}

export default function ImagePreview({ originalUrl, enhancedUrl, isProcessing }: ImagePreviewProps) {
  if (!originalUrl) return null

  return (
    <div className="image-preview-container">
      <div className="image-preview-header">
        📸 Image Preview
      </div>
      
      <div className="image-preview-content">
        {/* Original Image */}
        <div className="preview-section">
          <div className="preview-label original-preview-label">Original</div>
          <div className="preview-image-wrapper">
            <img 
              src={originalUrl} 
              alt="Original Image" 
              className="preview-image"
            />
          </div>
        </div>

        {/* Enhanced Image or Processing State */}
        <div className="preview-section">
          <div className="preview-label enhanced-preview-label">
            {isProcessing ? 'Processing...' : 'Enhanced'}
          </div>
          <div className="preview-image-wrapper">
            {enhancedUrl ? (
              <img 
                src={enhancedUrl} 
                alt="Enhanced Image" 
                className="preview-image"
              />
            ) : isProcessing ? (
              <div className="processing-placeholder">
                <div className="spinner"></div>
                <span>AI Enhancement in Progress</span>
              </div>
            ) : (
              <div className="placeholder">
                <span>Enhanced image will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
