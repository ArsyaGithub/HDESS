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
    <div className={`p-5 rounded-xl mb-6 font-medium flex items-center gap-3 relative ${
      type === 'success' 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-500 text-green-800' 
        : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-500 text-red-800'
    }`}>
      {type === 'success' ? '✅' : '❌'} {message}
      {downloadUrl && (
        <>
          <br />
          <button 
            onClick={handleDownload}
            className="bg-gradient-success text-white border-none px-6 py-3 rounded-lg cursor-pointer font-semibold mt-4 inline-flex items-center gap-2 no-underline transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            📥 Download Enhanced Image
          </button>
        </>
      )}
      <button 
        onClick={onClose}
        className="bg-transparent border-none float-right cursor-pointer text-lg absolute top-4 right-4 w-6 h-6 flex items-center justify-center hover:bg-black hover:bg-opacity-10 rounded"
      >
        ×
      </button>
    </div>
  )
}
