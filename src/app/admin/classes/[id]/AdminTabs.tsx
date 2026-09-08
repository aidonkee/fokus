'use client'

import Link from 'next/link'
import { BookOpen, ImageIcon, Palette } from 'lucide-react'

export function AdminTabs({ activeTab, classId }: { activeTab: string; classId: string }) {
  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all ${
      active ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
    }`

  return (
    <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 w-fit border border-zinc-800">
      <Link
        href={`/admin/classes/${classId}?tab=photos`}
        className={tabClass(activeTab === 'photos')}
      >
        <ImageIcon size={16} />
        Фото
      </Link>
      <Link
        href={`/admin/classes/${classId}?tab=album`}
        className={tabClass(activeTab === 'album')}
      >
        <BookOpen size={16} />
        Классбук
      </Link>
      <Link
        href={`/admin/classes/${classId}?tab=landing`}
        className={tabClass(activeTab === 'landing')}
      >
        <Palette size={16} />
        Лендинг
      </Link>
    </div>
  )
}
