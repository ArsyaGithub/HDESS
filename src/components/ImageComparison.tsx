import { useState, useEffect, useRef } from 'react'

interface ImageComparisonProps {
  originalUrl: string
  enhancedUrl: string
}

export default function ImageComparison({ originalUrl, enhancedUrl }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !wrapperRef.current) return

    const rect = wrapperRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetComparison = () => {
    setSliderPosition(50)
  }

  const showOriginal = () => {
    setSliderPosition(0)
  }

  const showEnhanced = () => {
    setSliderPosition(100)
  }

  const zoomIn = () => {
    setCurrentZoom(prev => Math.min(prev * 1.2, 3))
  }

  const zoomOut = () => {
    setCurrentZoom(prev => Math.max(prev / 1.2, 0.5))
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !wrapperRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPosition(percentage)
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging])

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        🔍 Before & After Comparison
      </div>
      <div 
        className="comparison-wrapper" 
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="comparison-images">
          {/* Base layer: Original image (always visible) */}
          <div className="image-base">
            <div className="image-label original-label">Sebelum</div>
            <img 
              src={originalUrl} 
              alt="Original Image" 
              style={{
                transform: `scale(${currentZoom})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
          {/* Overlay layer: Enhanced image (clipped) */}
          <div 
            className="image-overlay"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
            }}
          >
            <div className="image-label enhanced-label">Sesudah</div>
            <img 
              src={enhancedUrl} 
              alt="Enhanced Image"
              style={{
                transform: `scale(${currentZoom})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        </div>
        <div 
          className="comparison-divider" 
          style={{ left: `${sliderPosition}%` }}
        ></div>
        <div 
          className="comparison-slider"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
        ></div>
      </div>
      <div className="comparison-controls">
        <button className="control-button" onClick={resetComparison}>
          ↺ Reset
        </button>
        <button className="control-button" onClick={showOriginal}>
          👁 Original
        </button>
        <button className="control-button" onClick={showEnhanced}>
          ✨ Enhanced
        </button>
        <div className="zoom-controls">
          <button className="control-button" onClick={zoomOut}>
            🔍-
          </button>
          <span className="zoom-level">
            {Math.round(currentZoom * 100)}%
          </span>
          <button className="control-button" onClick={zoomIn}>
            🔍+
          </button>
        </div>
        <div style={{ marginTop: '16px' }}>
          <button 
            className="control-button"
            onClick={async () => {
              try {
                const response = await fetch(enhancedUrl)
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'enhanced_image.png'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
              } catch (error) {
                console.error('Download failed:', error)
                alert('Download failed. Please try again.')
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}
          >
            📥 Download Enhanced Image
          </button>
        </div>
      </div>
    </div>
  )
}
