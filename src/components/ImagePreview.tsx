interface ImagePreviewProps {
  originalUrl?: string
  enhancedUrl?: string
  isProcessing?: boolean
}

export default function ImagePreview({ originalUrl, enhancedUrl, isProcessing }: ImagePreviewProps) {
  if (!originalUrl) return null

  return (
    <div className="my-8 bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-primary text-white p-5 text-center font-bold text-lg">
        📸 Image Preview
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[400px]">
        {/* Original Image */}
        <div className="relative flex flex-col bg-gradient-light border-r-2 border-gray-200">
          <div className="absolute top-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl text-xs font-semibold z-10 shadow-lg bg-gradient-to-br from-red-500 to-red-600">
            Original
          </div>
          <div className="flex-1 flex items-center justify-center p-5 min-h-[360px]">
            <img 
              src={originalUrl} 
              alt="Original Image" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Enhanced Image or Processing State */}
        <div className="relative flex flex-col bg-gradient-light">
          <div className="absolute top-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-1.5 rounded-2xl text-xs font-semibold z-10 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
            {isProcessing ? 'Processing...' : 'Enhanced'}
          </div>
          <div className="flex-1 flex items-center justify-center p-5 min-h-[360px]">
            {enhancedUrl ? (
              <img 
                src={enhancedUrl} 
                alt="Enhanced Image" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center gap-4 text-gray-500 font-medium">
                <div className="spinner"></div>
                <span>AI Enhancement in Progress</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400 italic text-center py-10 px-5">
                <span>Enhanced image will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
