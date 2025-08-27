import { useState, useEffect } from 'react'
import { type ImageProcessing } from '../lib/supabase'

interface ProgressBarProps {
  processing: ImageProcessing | null
  onComplete: (result: ImageProcessing) => void
}

export default function ProgressBar({ processing, onComplete }: ProgressBarProps) {
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('Starting enhancement...')

  useEffect(() => {
    if (!processing) return

    let progressInterval: NodeJS.Timeout
    let checkInterval: NodeJS.Timeout

    // Real-time progress simulation
    const startProgress = () => {
      setProgress(0)
      setProgressText('Preparing image for enhancement...')

      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 3 + 1 // Random increment 1-4%
          
          if (newProgress < 15) {
            setProgressText('Loading AI model...')
          } else if (newProgress < 30) {
            setProgressText('Analyzing image structure...')
          } else if (newProgress < 50) {
            setProgressText('AI upscaling in progress...')
          } else if (newProgress < 70) {
            setProgressText('Enhancing details and textures...')
          } else if (newProgress < 85) {
            setProgressText('Applying final enhancements...')
          } else if (newProgress < 95) {
            setProgressText('Saving enhanced image...')
          } else {
            setProgressText('Almost ready...')
            clearInterval(progressInterval)
          }

          return Math.min(newProgress, 95)
        })
      }, 200) // Update every 200ms for smooth animation
    }

    // Check for completion
    const checkCompletion = () => {
      checkInterval = setInterval(() => {
        // In real implementation, this would check API status
        // For now, we'll complete after the upload is done
        if (processing.status === 'completed') {
          clearInterval(checkInterval)
          clearInterval(progressInterval)
          setProgress(100)
          setProgressText('Enhancement completed!')
          setTimeout(() => onComplete(processing), 500)
        }
      }, 1000)
    }

    startProgress()
    checkCompletion()

    return () => {
      clearInterval(progressInterval)
      clearInterval(checkInterval)
    }
  }, [processing, onComplete])


  if (!processing) return null

  return (
    <div className="progress-container" style={{ display: 'block' }}>
      <div className="progress-text">
        <span className="spinner"></span>
        {progressText}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
