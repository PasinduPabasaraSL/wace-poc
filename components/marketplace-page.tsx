"use client"

import { ShoppingBag } from "lucide-react"

export default function MarketplacePage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
          <p className="text-sm text-gray-500 dark:text-white mt-1">Discover tools and services for your pods</p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Marketplace</h2>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
          <p className="text-gray-600 dark:text-white mb-6">
            The marketplace feature is currently under development. We're working hard to bring you a curated selection of tools and services for your pods. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}

