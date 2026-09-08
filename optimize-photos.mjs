// One-time optimizer: downloads all class photos from Supabase Storage,
// resizes them to max 2000px JPEG (q80) with macOS `sips`, uploads them back,
// updates the photos table and deletes the heavy originals.
//
// Usage: node optimize-photos.mjs
// (requires .env.local with NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

const env = {}
for (const line of fs.readFileSync(new URL('./.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2]
}

const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const EMAIL = 'admin@photo.com'
const PASSWORD = '22822922'

const MAX_DIM = 2000
const JPG_QUALITY = 80
const MIN_SIZE_TO_PROCESS = 300 * 1024 // only bother with files larger than this
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'photoopt-'))

let token = null

const T = (ms = 120000) => AbortSignal.timeout(ms)

async function login() {
  const r = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    signal: T(),
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  })
  if (!r.ok) throw new Error(`login failed: ${r.status} ${await r.text()}`)
  token = (await r.json()).access_token
}

async function api(pathname, { method = 'GET', body, raw = false, headers = {} } = {}) {
  if (!token) await login()
  const doFetch = () =>
    fetch(BASE + pathname, {
      method,
      signal: T(),
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${token}`,
        ...(body && !raw ? { 'Content-Type': 'application/json' } : {}),
        ...headers
      },
      body: body && !raw ? JSON.stringify(body) : body
    })
  let r = await doFetch()
  if (r.status === 401) {
    await login()
    r = await doFetch()
  }
  if (!r.ok) throw new Error(`${method} ${pathname} -> ${r.status}: ${await r.text()}`)
  if (raw) return r
  const text = await r.text()
  return text ? JSON.parse(text) : null
}

async function download(url, dest) {
  const r = await fetch(url, { signal: T(300000) })
  if (!r.ok) throw new Error(`download ${url} -> ${r.status}`)
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()))
}

function sipsResize(input, output) {
  return exec('sips', ['-Z', String(MAX_DIM), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(JPG_QUALITY), input, '--out', output])
}

const photos = await api('/rest/v1/photos?select=id,url')
console.log(`Found ${photos.length} photos, working dir: ${TMP}\n`)

let processed = 0
let skipped = 0
let before = 0
let after = 0

for (const p of photos) {
  const url = new URL(p.url)
  const storagePath = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\/object\/public\//, ''))
  const dot = storagePath.lastIndexOf('.')
  const folder = storagePath.slice(0, dot)
  const stem = storagePath.slice(dot + 1) === 'jpg' ? storagePath : `${storagePath.slice(0, dot)}.jpg`
  const isJpg = storagePath.endsWith('.jpg')

  const inPath = path.join(TMP, 'in')
  const outPath = path.join(TMP, 'out.jpg')

  try {
    await download(p.url, inPath)
    const origSize = fs.statSync(inPath).size
    before += origSize
    const name = storagePath.split('/').pop()

    if (origSize < MIN_SIZE_TO_PROCESS) {
      console.log(`skip  ${name} (${Math.round(origSize / 1024)} KB, already small)`)
      skipped++
      fs.unlinkSync(inPath)
      continue
    }

    await sipsResize(inPath, outPath)
    const newSize = fs.statSync(outPath).size

    if (newSize > origSize * 0.9) {
      console.log(`skip  ${name} (resize saves nothing: ${Math.round(origSize / 1024)} -> ${Math.round(newSize / 1024)} KB)`)
      skipped++
      fs.unlinkSync(inPath)
      fs.unlinkSync(outPath)
      continue
    }

    const data = fs.readFileSync(outPath)
    const upFetch = () =>
      fetch(`${BASE}/storage/v1/object/${encodeUriFold(stem)}`, {
        method: 'POST',
        signal: T(),
        headers: {
          apikey: ANON,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true'
        },
        body: data
      })
    let up = await upFetch()
    if (up.status === 401) {
      await login()
      up = await upFetch()
    }
    if (!up.ok) throw new Error(`upload failed ${stem}: ${up.status} ${await up.text()}`)

    const newUrl = `${BASE}/storage/v1/object/public/${encodeUriFold(stem)}`
    const patch = await api(`/rest/v1/photos?id=eq.${p.id}`, {
      method: 'PATCH',
      body: { url: newUrl },
      headers: { Prefer: 'return=minimal' }
    })
    void patch

    if (!isJpg) {
      const del = await fetch(`${BASE}/storage/v1/object/${encodeUriFold(storagePath)}`, {
        method: 'DELETE',
        signal: T(),
        headers: { apikey: ANON, Authorization: `Bearer ${token}` }
      })
      if (!del.ok) console.log(`  ! could not delete old file (${del.status})`)
    }

    after += newSize
    processed++
    console.log(`ok    ${name}: ${Math.round(origSize / 1024)} KB -> ${Math.round(newSize / 1024)} KB`)
  } catch (e) {
    console.error(`ERROR ${p.id}: ${e.message}`)
  } finally {
    for (const f of [inPath, outPath]) {
      try { fs.unlinkSync(f) } catch {}
    }
  }
}

fs.rmSync(TMP, { recursive: true, force: true })
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`
console.log(`\nDone: ${processed} optimized, ${skipped} skipped. Storage: ${mb(before)} -> ${mb(after)} saved ${mb(before - after)}`)

function encodeUriFold(p) {
  return p.split('/').map(encodeURIComponent).join('/')
}
