"use client"

import { useState } from 'react'

interface WhatsAppFormProps {
  schoolName: string
  className: string
  packages?: string[]
}

export function WhatsAppForm({ schoolName, className, packages }: WhatsAppFormProps) {
  const defaultPackages = ['Стандартный альбом', 'Расширенный альбом', 'Только электронные фото']
  const pkgList = packages && packages.length > 0 ? packages : defaultPackages

  const [parentName, setParentName] = useState('')
  const [studentName, setStudentName] = useState('')
  const [packageType, setPackageType] = useState(pkgList[0])
  
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '79999999999'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const message = `Здравствуйте! Я хочу заказать Классбук.
Школа: ${schoolName}
Класс: ${className}
Ученик: ${studentName}
Родитель: ${parentName}
Пакет: ${packageType}`

    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${phone}?text=${encodedMessage}`
    
    window.open(url, '_blank')
  }

  return (
    <form className="space-y-4 max-w-md mx-auto" onSubmit={handleSubmit}>
      <input 
        type="text" 
        required
        value={parentName}
        onChange={e => setParentName(e.target.value)}
        placeholder="Ваше имя (Родитель)" 
        className="w-full px-6 py-4 bg-zinc-800 border border-zinc-700 text-white rounded-none focus:outline-none focus:border-primary transition-colors" 
      />
      <input 
        type="text" 
        required
        value={studentName}
        onChange={e => setStudentName(e.target.value)}
        placeholder="Имя ученика" 
        className="w-full px-6 py-4 bg-zinc-800 border border-zinc-700 text-white rounded-none focus:outline-none focus:border-primary transition-colors" 
      />
      <select 
        value={packageType}
        onChange={e => setPackageType(e.target.value)}
        className="w-full px-6 py-4 bg-zinc-800 border border-zinc-700 text-white rounded-none focus:outline-none focus:border-primary transition-colors appearance-none"
      >
        {pkgList.map((pkg) => (
          <option key={pkg} value={pkg}>{pkg}</option>
        ))}
      </select>
      
      <button 
        type="submit"
        className="w-full bg-primary text-black font-bold uppercase tracking-wider py-4 hover:bg-yellow-400 transition-colors duration-300 mt-6 block"
      >
        Написать в WhatsApp
      </button>
    </form>
  )
}

