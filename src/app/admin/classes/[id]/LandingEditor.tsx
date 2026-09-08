'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LandingConfig } from '@/types/landing-config'
import { Loader2, Save, Trash2, Plus, X } from 'lucide-react'


interface LandingEditorProps {
  classId: string
  initialConfig: LandingConfig
}

export function LandingEditor({ classId, initialConfig }: LandingEditorProps) {
  const [config, setConfig] = useState<LandingConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateConfig = (section: keyof LandingConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Upsert landing_config
      const { error } = await supabase
        .from('landing_config')
        .upsert({
          class_id: classId,
          config: config,
          updated_at: new Date().toISOString()
        }, { onConflict: 'class_id' })

      if (error) throw error
      setSaved(true)
      router.refresh()
    } catch (err) {
      console.error('Error saving config:', err)
      alert('Ошибка при сохранении. Попробуйте ещё раз.')
    } finally {
      setSaving(false)
    }
  }



  const addPackage = () => {
    updateConfig('cta', 'packages', [...config.cta.packages, 'Новый пакет'])
  }

  const removePackage = (index: number) => {
    const updated = config.cta.packages.filter((_, i) => i !== index)
    updateConfig('cta', 'packages', updated)
  }

  const updatePackage = (index: number, value: string) => {
    const updated = [...config.cta.packages]
    updated[index] = value
    updateConfig('cta', 'packages', updated)
  }

  const addParagraph = () => {
    updateConfig('whyClassbook', 'paragraphs', [...config.whyClassbook.paragraphs, ''])
  }

  const removeParagraph = (index: number) => {
    const updated = config.whyClassbook.paragraphs.filter((_, i) => i !== index)
    updateConfig('whyClassbook', 'paragraphs', updated)
  }

  const updateParagraph = (index: number, value: string) => {
    const updated = [...config.whyClassbook.paragraphs]
    updated[index] = value
    updateConfig('whyClassbook', 'paragraphs', updated)
  }

  const handleImageUpload = async (section: string, key: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `landing/${classId}/${section}_${key}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    const { error } = await supabase.storage.from('photos').upload(fileName, file)
    if (error) { console.error(error); return }

    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName)
    updateConfig(section as keyof LandingConfig, key, publicUrl)
  }

  return (
    <div className="space-y-8">
      {/* Save button - sticky */}
      <div className="sticky top-20 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-primary">Редактор лендинга</h2>
          {saved && <span className="text-green-400 text-sm">✓ Сохранено</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-black font-bold px-6 py-2 rounded flex items-center gap-2 hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Сохранить
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-sans">🎬 Секция «Герой» (Hero)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Заголовок</label>
            <input
              value={config.hero.title}
              onChange={e => updateConfig('hero', 'title', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Подзаголовок</label>
            <input
              value={config.hero.subtitle}
              onChange={e => updateConfig('hero', 'subtitle', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Описание</label>
            <textarea
              value={config.hero.description}
              onChange={e => updateConfig('hero', 'description', e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Фоновое изображение</label>
            {config.hero.backgroundImage && (
              <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.hero.backgroundImage} alt="Hero bg" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  onClick={() => updateConfig('hero', 'backgroundImage', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                ><X size={14} /></button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleImageUpload('hero', 'backgroundImage', e.target.files[0])}
              className="text-sm text-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-sans">📰 Секция «Вступление» (Intro)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Надпись-лейбл</label>
            <input
              value={config.intro.label}
              onChange={e => updateConfig('intro', 'label', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Заголовок</label>
            <textarea
              value={config.intro.title}
              onChange={e => updateConfig('intro', 'title', e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Photobook Demo Section */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-sans">📖 Демо классбука (Carousel)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Заголовок секции</label>
            <input
              value={config.photobook.title}
              onChange={e => updateConfig('photobook', 'title', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <p className="text-zinc-500 text-xs">
            Страницы классбука собираются автоматически из всех фото класса. Порядок фото и раскладка
            страниц настраиваются на вкладке «Классбук».
          </p>
        </div>
      </div>

      {/* Why Classbook Section */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-sans">❤️ Секция «Зачем Классбук»</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Заголовок</label>
            <input
              value={config.whyClassbook.title}
              onChange={e => updateConfig('whyClassbook', 'title', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Параграфы текста</label>
            {config.whyClassbook.paragraphs.map((p, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <textarea
                  value={p}
                  onChange={e => updateParagraph(i, e.target.value)}
                  rows={3}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-3 text-white text-sm focus:outline-none focus:border-primary resize-none"
                />
                <button
                  onClick={() => removeParagraph(i)}
                  className="text-red-400 hover:text-red-300 p-2"
                ><Trash2 size={16} /></button>
              </div>
            ))}
            <button
              onClick={addParagraph}
              className="text-primary text-sm flex items-center gap-1 hover:underline"
            ><Plus size={14} /> Добавить параграф</button>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Изображение сбоку</label>
            {config.whyClassbook.image && (
              <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.whyClassbook.image} alt="Why classbook" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  onClick={() => updateConfig('whyClassbook', 'image', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                ><X size={14} /></button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleImageUpload('whyClassbook', 'image', e.target.files[0])}
              className="text-sm text-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-sans">🖼 Секция «Галерея»</h3>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Заголовок</label>
          <input
            value={config.gallery.title}
            onChange={e => updateConfig('gallery', 'title', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
          />
          <p className="text-zinc-500 text-xs mt-2">Фотографии галереи управляются через вкладку «Фото» выше.</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-sans">📩 Секция «Форма заявки» (CTA)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Заголовок</label>
            <input
              value={config.cta.title}
              onChange={e => updateConfig('cta', 'title', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Описание</label>
            <textarea
              value={config.cta.description}
              onChange={e => updateConfig('cta', 'description', e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Пакеты (варианты выбора)</label>
            {config.cta.packages.map((pkg, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={pkg}
                  onChange={e => updatePackage(i, e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => removePackage(i)}
                  className="text-red-400 hover:text-red-300 p-2"
                ><Trash2 size={14} /></button>
              </div>
            ))}
            <button
              onClick={addPackage}
              className="text-primary text-sm flex items-center gap-1 hover:underline"
            ><Plus size={14} /> Добавить пакет</button>
          </div>
        </div>
      </div>
    </div>
  )
}
