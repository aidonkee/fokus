'use client'

import { useState } from 'react'
import { BookOpen, ImageIcon, Palette } from 'lucide-react'
import { Uploader } from './Uploader'
import { LandingEditor } from './LandingEditor'
import { AlbumEditor } from './AlbumEditor'
import type { AlbumPhoto } from '@/lib/album'
import type { LandingConfig } from '@/types/landing-config'

interface ClassAdminClientProps {
  classId: string
  groupPhotos: any[]
  singlePhotos: any[]
  albumPhotos: AlbumPhoto[]
  landingConfig: LandingConfig
  initialTab?: string
  deletePhotoAction: (formData: FormData) => Promise<void>
}

export function ClassAdminClient({
  classId,
  groupPhotos,
  singlePhotos,
  albumPhotos,
  landingConfig,
  initialTab = 'photos',
  deletePhotoAction,
}: ClassAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'album' | 'landing'>(
    initialTab === 'album' || initialTab === 'landing' ? initialTab : 'photos'
  )

  const handleTabChange = (tab: 'photos' | 'album' | 'landing') => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer ${
      active ? 'bg-primary text-black shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
    }`

  return (
    <div>
      {/* Instant Client Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 w-fit border border-zinc-800 mb-8">
        <button
          type="button"
          onClick={() => handleTabChange('photos')}
          className={tabClass(activeTab === 'photos')}
        >
          <ImageIcon size={16} />
          Фото ({groupPhotos.length + singlePhotos.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('album')}
          className={tabClass(activeTab === 'album')}
        >
          <BookOpen size={16} />
          Классбук ({albumPhotos.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('landing')}
          className={tabClass(activeTab === 'landing')}
        >
          <Palette size={16} />
          Лендинг
        </button>
      </div>

      {/* Tab Panels (rendered instantly without page reloads) */}
      <div className={activeTab === 'photos' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Uploader classId={classId} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold font-sans mb-4 flex items-center justify-between">
                Групповые фото{' '}
                <span className="bg-zinc-800 text-zinc-400 text-sm py-1 px-3 rounded-full">
                  {groupPhotos.length}
                </span>
              </h3>
              {groupPhotos.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
                  Нет загруженных фото
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {groupPhotos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="aspect-square relative rounded-lg overflow-hidden group border border-zinc-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt="Group photo"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <form action={deletePhotoAction}>
                          <input type="hidden" name="photoId" value={photo.id} />
                          <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                            title="Удалить фото"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold font-sans mb-4 flex items-center justify-between">
                Портреты{' '}
                <span className="bg-zinc-800 text-zinc-400 text-sm py-1 px-3 rounded-full">
                  {singlePhotos.length}
                </span>
              </h3>
              {singlePhotos.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
                  Нет загруженных фото
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {singlePhotos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="aspect-square relative rounded-lg overflow-hidden group border border-zinc-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt="Portrait photo"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <form action={deletePhotoAction}>
                          <input type="hidden" name="photoId" value={photo.id} />
                          <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                            title="Удалить фото"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={activeTab === 'album' ? 'block' : 'hidden'}>
        <AlbumEditor
          classId={classId}
          photos={albumPhotos}
          initialConfig={landingConfig}
        />
      </div>

      <div className={activeTab === 'landing' ? 'block' : 'hidden'}>
        <LandingEditor
          classId={classId}
          initialConfig={landingConfig}
        />
      </div>
    </div>
  )
}
