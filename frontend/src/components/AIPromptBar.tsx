import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import type DrawingManager from "@/lib/DrawingManager"

type AIPromptBarProps = {
  dm: DrawingManager
}

export function AIPromptBar({ dm }: AIPromptBarProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim().length === 0) return

    setIsLoading(true)
    await dm.sendPrompt(prompt)

    setPrompt("")
    setIsLoading(false)
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-4 w-[30rem]">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez ce que vous voulez dessiner..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="flex items-center justify-center w-12 h-12 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </form>
    </div>
  )
}
