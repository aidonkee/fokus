'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text, path }: { text?: string; path?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      let urlToCopy = text || ''
      if (path) {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        urlToCopy = `${origin}${path.startsWith('/') ? '' : '/'}${path}`
      } else if (text && text.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        const pathPart = text.replace(/^https?:\/\/[^/]+/, '')
        urlToCopy = `${window.location.origin}${pathPart}`
      }
      await navigator.clipboard.writeText(urlToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className="p-1 text-zinc-400 hover:text-white transition rounded"
      title="Копировать ссылку для клиентов"
    >
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  )
}
