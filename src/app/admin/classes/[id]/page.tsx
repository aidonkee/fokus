import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Uploader } from './Uploader'
import { LandingEditor } from './LandingEditor'
import { AlbumEditor } from './AlbumEditor'

import { CopyButton } from './CopyButton'
import { revalidatePath } from 'next/cache'
import { DEFAULT_LANDING_CONFIG, LandingConfig } from '@/types/landing-config'
import { AdminTabs } from './AdminTabs'
import type { AlbumPhoto } from '@/lib/album'

export default async function AdminClassView({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = tab || 'photos'
  const supabase = await createClient()

  const { data: cls } = await supabase
    .from('classes')
    .select('*, school:schools(*)')
    .eq('id', id)
    .single()

  if (!cls) {
    notFound()
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('class_id', id)
    .in('type', ['group', 'single'])
    .order('created_at', { ascending: true })

  // Get or create landing config
  let { data: landingConfigRow } = await supabase
    .from('landing_config')
    .select('*')
    .eq('class_id', id)
    .single()

  let landingConfig: LandingConfig = DEFAULT_LANDING_CONFIG
  if (landingConfigRow) {
    landingConfig = { ...DEFAULT_LANDING_CONFIG, ...landingConfigRow.config }
  }

  const groupPhotos = (photos?.filter((p: any) => p.type === 'group') || []).reverse()
  const singlePhotos = (photos?.filter((p: any) => p.type === 'single') || []).reverse()
  const albumPhotos: AlbumPhoto[] = (photos || []).map((p: any) => ({
    id: p.id,
    url: p.url,
    type: p.type
  }))

  const classUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/c/${cls.slug}`

  async function deletePhoto(formData: FormData) {
    'use server'
    const photoId = formData.get('photoId') as string
    if (!photoId) return

    const supabase = await createClient()
    const { data: photo } = await supabase.from('photos').select('url').eq('id', photoId).single()

    if (photo) {
      const urlParts = photo.url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folderName = urlParts[urlParts.length - 2]

      await supabase.storage.from('photos').remove([`${folderName}/${fileName}`])
      await supabase.from('photos').delete().eq('id', photoId)
      revalidatePath(`/admin/classes/${id}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-zinc-400 mb-6 font-sans">
        <Link href="/admin/dashboard" className="hover:text-primary transition">Школы</Link>
        <ChevronRight size={16} />
        {/* @ts-ignore */}
        <Link href={`/admin/schools/${cls.school?.id}`} className="hover:text-primary transition">{cls.school?.name}</Link>
        <ChevronRight size={16} />
        <span className="text-white">{cls.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          {/* @ts-ignore */}
          <h1 className="text-3xl font-serif mb-2">Класс {cls.name} <span className="text-zinc-500 text-2xl">({cls.school?.name})</span></h1>
          <div className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700 w-fit">
            <span className="text-zinc-400 text-sm">Ссылка для клиентов:</span>
            <Link href={`/c/${cls.slug}`} target="_blank" className="text-primary font-mono hover:underline flex items-center gap-1">
              /c/{cls.slug} <ExternalLink size={14} />
            </Link>
            <CopyButton path={`/c/${cls.slug}`} text={classUrl} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <AdminTabs activeTab={activeTab} classId={id} />

      {/* Tab Content */}
      {activeTab === 'photos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <Uploader classId={cls.id} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold font-sans mb-4 flex items-center justify-between">
                Групповые фото <span className="bg-zinc-800 text-zinc-400 text-sm py-1 px-3 rounded-full">{groupPhotos.length}</span>
              </h3>
              {groupPhotos.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">Нет загруженных фото</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {groupPhotos.map((photo: any) => (
                    <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden group border border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="Group photo" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <form action={deletePhoto}>
                          <input type="hidden" name="photoId" value={photo.id} />
                          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
                Портреты <span className="bg-zinc-800 text-zinc-400 text-sm py-1 px-3 rounded-full">{singlePhotos.length}</span>
              </h3>
              {singlePhotos.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">Нет загруженных фото</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {singlePhotos.map((photo: any) => (
                    <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden group border border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="Portrait photo" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <form action={deletePhoto}>
                          <input type="hidden" name="photoId" value={photo.id} />
                          <button type="submit" className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
      ) : activeTab === 'album' ? (
        <div className="mt-8">
          <AlbumEditor
            classId={cls.id}
            photos={albumPhotos}
            initialConfig={landingConfig}
          />
        </div>
      ) : (
        <div className="mt-8">
          <LandingEditor
            classId={cls.id}
            initialConfig={landingConfig}
          />
        </div>
      )}
    </div>
  )
}
