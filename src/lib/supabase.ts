import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface ImageProcessing {
  id: string
  original_filename: string
  original_url: string
  enhanced_url?: string
  model_used: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  file_size: number
  processing_time?: number
}

export interface AIModel {
  key: string
  name: string
  description: string
  scale_factor: number
  processing_time_estimate: number
}

export const AI_MODELS: AIModel[] = [
  {
    key: 'RealESRGAN_x2plus',
    name: 'Real-ESRGAN 2x',
    description: 'General purpose 2x upscaling model',
    scale_factor: 2,
    processing_time_estimate: 10
  },
  {
    key: 'RealESRGAN_x4plus',
    name: 'Real-ESRGAN 4x',
    description: 'General purpose 4x upscaling model',
    scale_factor: 4,
    processing_time_estimate: 20
  },
  {
    key: 'RealESRGAN_x4plus_anime_6B',
    name: 'Real-ESRGAN Anime 4x',
    description: 'Optimized for anime and illustrations',
    scale_factor: 4,
    processing_time_estimate: 15
  },
  {
    key: 'RealESRNet_x4plus',
    name: 'Real-ESRNet 4x',
    description: 'Clean upscaling without artifacts',
    scale_factor: 4,
    processing_time_estimate: 25
  },
  {
    key: 'realesr-general-x4v3',
    name: 'Real-ESRGAN v3',
    description: 'Latest general model with denoise control',
    scale_factor: 4,
    processing_time_estimate: 18
  }
]
