export type AlbumPhotoType = 'group' | 'single'

export interface AlbumPhoto {
  id: string
  url: string
  type: AlbumPhotoType
}

export interface AlbumConfig {
  photoOrder?: string[]
  hiddenPhotoIds?: string[]
  layouts?: string[]
}

export type AlbumLayoutKey = 'duo' | 'grid' | 'split-l' | 'split-r' | 'top'

export interface AlbumLayout {
  key: AlbumLayoutKey
  capacity: number
  label: string
  slots: string[]
}

const CELL = 'col-start-1 col-end-2'
const CELL_R = 'col-start-2 col-end-3'

export const ALBUM_LAYOUTS: Record<AlbumLayoutKey, AlbumLayout> = {
  duo: {
    key: 'duo',
    capacity: 2,
    label: '2 больших',
    slots: [
      `${CELL} row-start-1 row-end-3`,
      `${CELL_R} row-start-1 row-end-3`,
    ],
  },
  grid: {
    key: 'grid',
    capacity: 4,
    label: '2 × 2',
    slots: [
      `${CELL} row-start-1 row-end-2`,
      `${CELL_R} row-start-1 row-end-2`,
      `${CELL} row-start-2 row-end-3`,
      `${CELL_R} row-start-2 row-end-3`,
    ],
  },
  'split-l': {
    key: 'split-l',
    capacity: 3,
    label: 'Слева большое',
    slots: [
      `${CELL} row-start-1 row-end-3`,
      `${CELL_R} row-start-1 row-end-2`,
      `${CELL_R} row-start-2 row-end-3`,
    ],
  },
  'split-r': {
    key: 'split-r',
    capacity: 3,
    label: 'Справа большое',
    slots: [
      `${CELL} row-start-1 row-end-2`,
      `${CELL} row-start-2 row-end-3`,
      `${CELL_R} row-start-1 row-end-3`,
    ],
  },
  top: {
    key: 'top',
    capacity: 3,
    label: 'Сверху широкое',
    slots: [
      'col-start-1 col-end-3 row-start-1 row-end-2',
      `${CELL} row-start-2 row-end-3`,
      `${CELL_R} row-start-2 row-end-3`,
    ],
  },
}

export const ALBUM_LAYOUT_KEYS = Object.keys(ALBUM_LAYOUTS) as AlbumLayoutKey[]

export const DEFAULT_LAYOUT_CYCLE: AlbumLayoutKey[] = [
  'grid',
  'split-l',
  'grid',
  'split-r',
  'top',
  'grid',
  'duo',
]

export interface AlbumPage {
  index: number
  layout: AlbumLayoutKey
  photos: AlbumPhoto[]
}

export function layoutForKey(key: string | undefined | null): AlbumLayout {
  return ALBUM_LAYOUTS[key as AlbumLayoutKey] ?? ALBUM_LAYOUTS.grid
}

export function orderAlbumPhotos(photos: AlbumPhoto[], album?: AlbumConfig): AlbumPhoto[] {
  const hidden = new Set(album?.hiddenPhotoIds ?? [])
  const visiblePhotos = photos.filter((p) => !hidden.has(p.id))
  const order = album?.photoOrder
  if (!order || order.length === 0) return visiblePhotos

  const byId = new Map(visiblePhotos.map((p) => [p.id, p]))
  const ordered: AlbumPhoto[] = []
  const used = new Set<string>()

  for (const id of order) {
    const photo = byId.get(id)
    if (photo && !used.has(id)) {
      ordered.push(photo)
      used.add(id)
    }
  }
  for (const photo of visiblePhotos) {
    if (!used.has(photo.id)) ordered.push(photo)
  }
  return ordered
}

export function layoutForPageIndex(
  pageIndex: number,
  album?: AlbumConfig
): AlbumLayoutKey {
  const custom = album?.layouts
  if (custom && custom.length > 0) {
    const key = custom[pageIndex % custom.length]
    return layoutForKey(key).key
  }
  return DEFAULT_LAYOUT_CYCLE[pageIndex % DEFAULT_LAYOUT_CYCLE.length]
}

export function buildAlbumPages(photos: AlbumPhoto[], album?: AlbumConfig): AlbumPage[] {
  const ordered = orderAlbumPhotos(photos, album)
  const pages: AlbumPage[] = []

  let i = 0
  let pageIndex = 0
  while (i < ordered.length) {
    const remaining = ordered.length - i

    if (remaining === 1) {
      const merged = pages.length > 0 ? [...pages[pages.length - 1].photos, ordered[i]] : [ordered[i]]
      if (pages.length > 0) pages.pop()
      if (merged.length <= 2) {
        pages.push({ index: pageIndex, layout: 'duo', photos: merged })
        pageIndex += 1
      } else if (merged.length === 3) {
        pages.push({ index: pageIndex, layout: 'top', photos: merged })
        pageIndex += 1
      } else if (merged.length === 4) {
        pages.push({ index: pageIndex, layout: 'grid', photos: merged })
        pageIndex += 1
      } else {
        pages.push({ index: pageIndex, layout: 'split-l', photos: merged.slice(0, 3) })
        pageIndex += 1
        pages.push({ index: pageIndex, layout: 'duo', photos: merged.slice(3) })
        pageIndex += 1
      }
      break
    }

    const layoutKey = layoutForPageIndex(pageIndex, album)
    const layout = layoutForKey(layoutKey)
    const slice = ordered.slice(i, i + layout.capacity)
    pages.push({ index: pageIndex, layout: layoutKey, photos: slice })
    i += layout.capacity
    pageIndex += 1
  }

  return pages
}

export function albumFlatPhotos(pages: AlbumPage[]): AlbumPhoto[] {
  return pages.flatMap((page) => page.photos)
}

export function pageOfPhoto(pages: AlbumPage[], photoId: string): number {
  for (const page of pages) {
    if (page.photos.some((p) => p.id === photoId)) return page.index
  }
  return -1
}
