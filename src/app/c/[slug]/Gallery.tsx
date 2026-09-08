'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Phone, User, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Photo = {
  id: string
  url: string
  type: 'group' | 'single'
}

export function Gallery({ photos, className, schoolName }: { photos: Photo[], className: string, schoolName: string }) {
  const [activeTab, setActiveTab] = useState<'all' | 'group' | 'single'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Form state
  const [parentName, setParentName] = useState('')
  const [studentName, setStudentName] = useState('')
  const [phone, setPhone] = useState('')
  const [packageType, setPackageType] = useState('standard')
  const [comment, setComment] = useState('')

  const filteredPhotos = photos.filter(p => activeTab === 'all' || p.type === activeTab)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [lightboxIndex])

  const prevPhoto = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? filteredPhotos.length - 1 : lightboxIndex - 1)
  }

  const nextPhoto = () => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === filteredPhotos.length - 1 ? 0 : lightboxIndex + 1)
  }

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault()
    const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '7777777777' // fallback
    const message = `Здравствуйте! Хочу сделать заказ фото.
Школа: ${schoolName}
Класс: ${className}
Родитель: ${parentName}
Ученик: ${studentName}
Телефон: ${phone}
Пакет: ${packageType === 'standard' ? 'Стандартный (виньетка + портрет)' : packageType === 'premium' ? 'Премиум (альбом)' : 'Только электронные'}
Комментарий: ${comment}`

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 inline-flex">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Все фото
          </button>
          <button 
            onClick={() => setActiveTab('group')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'group' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Групповые
          </button>
          <button 
            onClick={() => setActiveTab('single')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'single' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Портреты
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-lg">В этой категории пока нет фотографий</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-20">
          <AnimatePresence>
            {filteredPhotos.map((photo, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={photo.id} 
                className="aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group relative bg-slate-800 border border-slate-700 shadow-xl"
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={photo.url} 
                  alt="Фото" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Order Form */}
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Оформить заказ</h2>
          <p className="text-slate-400">Заполните форму, и мы свяжемся с вами в WhatsApp для подтверждения.</p>
        </div>

        <form onSubmit={handleOrder} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Имя родителя</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input required type="text" value={parentName} onChange={e => setParentName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all" placeholder="Иван Иванов" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Имя ученика</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input required type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all" placeholder="Петя Иванов" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Номер телефона (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all" placeholder="+7 (999) 000-00-00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Пакет фотографий</label>
            <select value={packageType} onChange={e => setPackageType(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all appearance-none">
              <option value="standard">Стандартный (Виньетка + Портрет)</option>
              <option value="premium">Премиум (Фотокнига 5 разворотов)</option>
              <option value="digital">Только электронные версии</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Комментарий к заказу (номера фото)</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all resize-none" placeholder="Например: портрет в синей рубашке, общая с учителем..."></textarea>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#ff8052] text-white font-semibold rounded-xl px-4 py-4 mt-4 transition-all hover:shadow-[0_0_20px_rgba(255,107,53,0.4)] flex items-center justify-center gap-2">
            Отправить заявку в WhatsApp
          </button>
        </form>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B132B]/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-3 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-3 rounded-full transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] relative"
            >
              <img 
                src={filteredPhotos[lightboxIndex].url} 
                alt="Фото" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-3 rounded-full transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 font-medium bg-slate-900/80 px-4 py-2 rounded-full text-sm">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
