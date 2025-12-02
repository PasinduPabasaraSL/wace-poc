"use client"

import { Sparkles } from "lucide-react"

export default function PersonalAssistantPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <div className="text-center max-w-md px-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={40} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 mb-2">
          AI Feature
        </p>
        <p className="text-gray-500">
          We're working on something amazing. The Personal Assistant feature will be available soon!
        </p>
      </div>
    </div>
  )
}

