import { useAuth } from '../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="bg-white py-15 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-white bg-gradient-primary rounded-lg py-2 px-4 inline-block tracking-tight">✨ AI Image Enhancer</h1>
            <p className="text-lg text-gray-600 leading-relaxed">Transform your images with cutting-edge Real-ESRGAN technology</p>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
