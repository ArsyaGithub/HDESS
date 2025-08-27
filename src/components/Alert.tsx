interface AlertProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
  downloadUrl?: string
  originalFilename?: string
}

export default function Alert({ type, message, onClose, downloadUrl, originalFilename }: AlertProps) {
  const handleDownload = async () => {
    if (!downloadUrl) return

    try {
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      
      // Create download filename
      const filename = originalFilename 
        ? `enhanced_${originalFilename.replace(/\.[^/.]+$/, '')}.png`
        : 'enhanced_image.png'
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  return (
    <div className={`alert ${type === 'success' ? 'alert-success' : 'alert-error'}`}>
      {type === 'success' ? '✅' : '❌'} {message}
      {downloadUrl && (
        <>
          <br />
          <button 
            onClick={handleDownload}
            className="download-link"
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            📥 Download Enhanced Image
          </button>
        </>
      )}
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          float: 'right', 
          cursor: 'pointer',
          fontSize: '18px'
        }}
      >
        ×
      </button>
    </div>
  )
}
