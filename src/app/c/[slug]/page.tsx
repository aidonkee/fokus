import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClientLanding from './ClientLanding'
import { DEFAULT_LANDING_CONFIG, LandingConfig } from '@/types/landing-config'
import { albumFlatPhotos, buildAlbumPages, orderAlbumPhotos, type AlbumPhoto } from '@/lib/album'

export default async function ClassLandingPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: cls } = await supabase
    .from('classes')
    .select('*, school:schools(*)')
    .eq('slug', slug)
    .single()

  if (!cls) {
    notFound()
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('class_id', cls.id)
    .in('type', ['group', 'single'])
    .order('created_at', { ascending: true })

  const { data: landingConfigRow } = await supabase
    .from('landing_config')
    .select('*')
    .eq('class_id', cls.id)
    .single()

  const landingConfig: LandingConfig = landingConfigRow?.config
    ? { ...DEFAULT_LANDING_CONFIG, ...landingConfigRow.config }
    : DEFAULT_LANDING_CONFIG

  interface PhotoRow {
    id: string
    url: string
    type: string
  }

  const rawPhotos: AlbumPhoto[] = (photos || []).map((p: PhotoRow) => ({
    id: p.id,
    url: p.url,
    type: p.type === 'single' ? 'single' : 'group'
  }))
  const orderedPhotos = orderAlbumPhotos(rawPhotos, landingConfig.album)
  const albumPages = buildAlbumPages(orderedPhotos, landingConfig.album)

  return (
    <ClientLanding
      cls={cls}
      albumPages={albumPages}
      albumPhotos={orderedPhotos}
      config={landingConfig}
    />
  )
}
