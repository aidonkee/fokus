import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ClassAdminClient } from './ClassAdminClient'
import { CopyButton } from './CopyButton'
import { revalidatePath } from 'next/cache'
import { DEFAULT_LANDING_CONFIG, LandingConfig } from '@/types/landing-config'
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

      {/* Instant Client Tabs & Panels */}
      <ClassAdminClient
        classId={cls.id}
        groupPhotos={groupPhotos}
        singlePhotos={singlePhotos}
        albumPhotos={albumPhotos}
        landingConfig={landingConfig}
        initialTab={activeTab}
        deletePhotoAction={deletePhoto}
      />
    </div>
  )
}
