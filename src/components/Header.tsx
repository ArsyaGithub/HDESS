interface HeaderProps {}

export default function Header({}: HeaderProps) {
  return (
    <div className="bg-white py-15 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-white bg-gradient-primary rounded-lg py-2 px-4 inline-block tracking-tight">✨ AI Image Enhancer</h1>
          <p className="text-lg text-gray-600 leading-relaxed">Transform your images with cutting-edge Real-ESRGAN technology</p>
        </div>
      </div>
    </div>
  )
}
