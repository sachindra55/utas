import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Star, Users, BookOpen } from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 via-pink-500 to-indigo-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 perspective-1000">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-300 via-pink-400 to-blue-800">
          {/* Ambient Light */}
          <div className="absolute left-1/2 top-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/4">
            <div className="absolute inset-0 bg-gradient-radial from-pink-300/30 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-10 -right-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute w-96 h-96 -bottom-10 -left-10 bg-gradient-to-tr from-blue-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to SONIVALE
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Your comprehensive nursing education platform. Experience immersive learning through virtual simulations and interactive training modules.
            </p>
            <Link
              to="/skills-training"
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="p-3 bg-pink-500/20 rounded-lg w-fit mb-4">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Virtual Training</h3>
              <p className="text-white/80">Practice clinical skills in a safe, virtual environment</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="p-3 bg-yellow-500/20 rounded-lg w-fit mb-4">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Learning</h3>
              <p className="text-white/80">Engage with dynamic content and real-world scenarios</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Support</h3>
              <p className="text-white/80">Connect with fellow nursing students and educators</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
                <BookOpen className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Comprehensive Resources</h3>
              <p className="text-white/80">Access a wide range of educational materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}