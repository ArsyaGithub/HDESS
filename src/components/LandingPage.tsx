import { useState } from 'react'
import { Upload, Zap, Shield, Clock, Star, ArrowRight, Twitter, Instagram, Facebook } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered",
      description: "Advanced Real-ESRGAN technology for superior image enhancement"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fast & Efficient",
      description: "Process your photos in seconds with our optimized algorithms"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Secure",
      description: "Your photos are processed securely and never stored permanently"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "High Quality",
      description: "Get professional-grade results with 4x resolution enhancement"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Photographer",
      avatar: "SJ",
      text: "Amazing quality! My old photos look brand new."
    },
    {
      name: "Mike Chen",
      role: "Designer",
      avatar: "MC",
      text: "Fast and reliable. Perfect for my design projects."
    },
    {
      name: "Emma Davis",
      role: "Content Creator",
      avatar: "ED",
      text: "Best upscaling tool I've ever used. Highly recommended!"
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-800 font-inter">
      {/* Hero Section */}
      <section className="pt-20 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="max-w-lg">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-800 tracking-tight">
                Upscale Your Photos in Seconds
              </h1>
              <p className="text-xl mb-10 text-gray-600 font-normal leading-relaxed">
                Transform low-resolution images into stunning high-definition photos with our AI-powered upscaling technology.
              </p>
              <button 
                className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={onGetStarted}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex items-center gap-10 bg-slate-50 p-10 rounded-2xl border border-gray-200">
                <div className="text-center">
                  <img 
                    src="/before.jpeg" 
                    alt="Before Enhancement" 
                    className="w-full h-auto max-w-90 max-h-65 object-contain rounded-lg border-2 border-gray-400"
                  />
                  <span className="block mt-4 text-sm font-semibold text-slate-600">Before</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-sky-500" />
                </div>
                <div className="text-center">
                  <img 
                    src="/after.jpeg" 
                    alt="After Enhancement" 
                    className="w-full h-auto max-w-90 max-h-65 object-contain rounded-lg border-2 border-gray-400"
                  />
                  <span className="block mt-4 text-sm font-semibold text-slate-600">After</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-15">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 tracking-tight">Why Choose Our Service</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Professional photo enhancement made simple
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white p-10 rounded-2xl border border-gray-200 text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-primary-500 ${
                  hoveredFeature === index ? 'shadow-xl -translate-y-2 border-primary-500' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6 text-primary-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-70 mx-auto">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 tracking-tight">Try It Now</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Upload your photo and see the magic happen
            </p>
            <div className="mt-12 p-20 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 transition-all duration-300 cursor-pointer max-w-2xl mx-auto hover:border-primary-500 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-lg">
              <Upload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
              <p className="text-lg font-medium text-gray-700 mb-2">Drop your image here</p>
              <p className="text-sm text-gray-500 mb-6">or click to browse</p>
              <button 
                className="inline-flex items-center px-6 py-3 bg-slate-50 text-slate-600 border border-gray-200 rounded-lg hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-200"
                onClick={onGetStarted}
              >
                Choose File
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center max-w-2xl mx-auto mb-15">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 tracking-tight">What Our Users Say</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Trusted by thousands of professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 relative transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary-500">
                <p className="text-lg leading-relaxed text-gray-600 mb-6 italic relative">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white text-black text-center">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Ready to Enhance Your Photos?</h2>
          <p className="text-lg mb-8 opacity-90 leading-relaxed">
            Join thousands of users who trust our AI-powered photo enhancement
          </p>
          <button 
            className="inline-flex items-center px-10 py-5 bg-primary-500 text-white font-semibold text-lg rounded-lg hover:bg-primary-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={onGetStarted}
          >
            Start Enhancing Now
            <Upload className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mb-15">
            <div className="max-w-sm">
              <h3 className="text-xl font-bold mb-4">PhotoUpscale</h3>
              <p className="text-gray-400 leading-relaxed">
                AI-powered photo enhancement for everyone
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-5">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-5">Support</h4>
              <ul className="space-y-3 mb-8">
                <li><a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200">Privacy</a></li>
              </ul>
              <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="flex items-center justify-center w-11 h-11 bg-gray-700 rounded-lg text-gray-400 hover:bg-primary-500 hover:text-white transform hover:-translate-y-0.5 transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="flex items-center justify-center w-11 h-11 bg-gray-700 rounded-lg text-gray-400 hover:bg-primary-500 hover:text-white transform hover:-translate-y-0.5 transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="flex items-center justify-center w-11 h-11 bg-gray-700 rounded-lg text-gray-400 hover:bg-primary-500 hover:text-white transform hover:-translate-y-0.5 transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              2024 PhotoUpscale. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
