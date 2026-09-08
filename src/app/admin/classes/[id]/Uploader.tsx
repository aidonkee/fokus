'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image-compress'
import { useRouter } from 'next/navigation'
import { Loader2, UploadCloud } from 'lucide-react'

export function Uploader({ classId }: { classId: string }) {
  const [files, setFiles] = useState<File[]>([])
  const [type, setType] = useState<'group' | 'single'>('group')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress({ done: 0, total: files.length })

    try {
      for (let i = 0; i < files.length; i += 1) {
        const compressed = await compressImage(files[i])
        const fileExt = compressed.name.split('.').pop()
        const fileName = `${classId}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, compressed)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)

        const { error: dbError } = await supabase.from('photos').insert({
          class_id: classId,
          url: publicUrl,
          type: type
        })

        if (dbError) throw dbError

        setProgress({ done: i + 1, total: files.length })
      }

      setFiles([])
      router.refresh()
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Ошибка при загрузке. Попробуйте еще раз.')
    } finally {
      setUploading(false)
      setProgress(null)
    }
  }

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 font-sans text-primary">Загрузить фото</h2>
      
      <div className="flex gap-4 mb-6">
        <label className="flex-1 flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="photoType" 
            value="group" 
            checked={type === 'group'} 
            onChange={() => setType('group')} 
            className="w-4 h-4 text-primary"
          />
          <span className="text-white">Групповые</span>
        </label>
        <label className="flex-1 flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="photoType" 
            value="single" 
            checked={type === 'single'} 
            onChange={() => setType('single')} 
            className="w-4 h-4 text-primary"
          />
          <span className="text-white">Портреты</span>
        </label>
      </div>

      <div className="border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center mb-6">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
          id="file-upload" 
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white transition">
          <UploadCloud size={48} className="mb-2" />
          <span className="font-bold">Нажмите для выбора файлов</span>
          <span className="text-sm">Поддерживаются форматы JPG, PNG</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm text-zinc-400">Выбрано файлов: {files.length}</p>
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="bg-zinc-900 px-3 py-1 rounded text-xs truncate max-w-[150px] border border-zinc-700">
                {f.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="w-full bg-primary text-black font-bold py-3 rounded flex items-center justify-center gap-2 hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <><Loader2 className="animate-spin" size={20} /> Загрузка{progress ? ` ${progress.done}/${progress.total}` : ''}...</>
        ) : (
          'Загрузить фото'
        )}
      </button>
    </div>
  )
}
