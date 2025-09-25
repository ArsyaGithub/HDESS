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
    <div className="my-8 bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-primary text-white p-6 text-center font-bold text-xl tracking-tight">
        🔍 Before & After Comparison
      </div>
      <div 
        className="relative w-full h-[500px] overflow-hidden bg-gradient-light" 
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="relative w-full h-full">
          {/* Base layer: Original image (always visible) */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm font-semibold z-10 shadow-lg bg-gradient-to-br from-red-500 to-red-600">
              Sebelum
            </div>
            <img 
              src={originalUrl} 
              alt="Original Image" 
              className="max-w-full max-h-full object-contain bg-white block mx-auto"
              style={{
                transform: `scale(${currentZoom})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
          {/* Overlay layer: Enhanced image (clipped) */}
          <div 
            className="absolute top-0 left-0 w-full h-full overflow-hidden flex items-center justify-center transition-all duration-100 ease-linear"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
            }}
          >
            <div className="absolute top-4 right-4 bg-black bg-opacity-80 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm font-semibold z-10 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
              Sesudah
            </div>
            <img 
              src={enhancedUrl} 
              alt="Enhanced Image"
              className="max-w-full max-h-full object-contain bg-white block mx-auto"
              style={{
                transform: `scale(${currentZoom})`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        </div>
        <div 
          className="absolute top-0 w-0.5 h-full bg-white transform -translate-x-0.5 z-30 shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        ></div>
        <div 
          className="absolute top-1/2 w-12 h-12 bg-gradient-to-br from-white to-slate-50 border-3 border-gradient-start rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-40 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-115 hover:shadow-xl"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
        >
          <span className="text-lg text-gradient-start font-bold">↔</span>
        </div>
      </div>
      <div className="p-6 bg-gradient-light border-t border-gray-200 text-center">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button 
            className="bg-gradient-primary text-white border-none px-5 py-2.5 mx-1.5 mb-2 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300 shadow-sm hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={resetComparison}
          >
            ↺ Reset
          </button>
          <button 
            className="bg-gradient-primary text-white border-none px-5 py-2.5 mx-1.5 mb-2 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300 shadow-sm hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={showOriginal}
          >
            👁 Original
          </button>
          <button 
            className="bg-gradient-primary text-white border-none px-5 py-2.5 mx-1.5 mb-2 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300 shadow-sm hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={showEnhanced}
          >
            ✨ Enhanced
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <button 
            className="bg-gradient-primary text-white border-none px-5 py-2.5 mx-1.5 mb-2 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300 shadow-sm hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={zoomOut}
          >
            🔍-
          </button>
          <span className="font-bold text-gray-600 text-base min-w-[60px] text-center">
            {Math.round(currentZoom * 100)}%
          </span>
          <button 
            className="bg-gradient-primary text-white border-none px-5 py-2.5 mx-1.5 mb-2 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300 shadow-sm hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            onClick={zoomIn}
          >
            🔍+
          </button>
        </div>
      </div>
    </div>
  )
}
