// One-time repair after the double-path incident (optimize-photos.mjs v1):
//  1. 7b rows: point DB back at the intact single-path originals
//  2. 8B rows: move existing double-path resized objects to single path
//  3. delete any remaining double-path objects

import fs from 'node:fs'

const env = {}
for (const line of fs.readFileSync(new URL('./.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2]
}
const BASE = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let token = null

async function login() {
  const r = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@photo.com', password: '22822922' })
  })
  if (!r.ok) throw new Error(`login failed: ${r.status}`)
  token = (await r.json()).access_token
}
const H = () => ({ apikey: ANON, Authorization: `Bearer ${token}` })
const enc = (p) => p.split('/').map(encodeURIComponent).join('/')

await login()
const rows = await (await fetch(`${BASE}/rest/v1/photos?select=id,url`, { headers: H() })).json()
const oldUrls = fs.readFileSync('/tmp/photo-urls.txt', 'utf8').trim().split('\n')
const oldByStem = new Map(oldUrls.map((u) => [u.split('/').pop(), u]))

let patched = 0
for (const r of rows) {
  const p = decodeURIComponent(new URL(r.url).pathname.replace(/^\/storage\/v1\/object\/public\//, ''))
  if (!p.startsWith('photos/photos/')) continue
  const single = p.replace(/^photos\/photos\//, 'photos/')
  const name = p.split('/').pop()
  const stemNoExt = name.replace(/\.[^.]+$/, '')

  const singleHasFile = (await fetch(`${BASE}/storage/v1/object/public/${enc(single)}`, { method: 'HEAD' })).ok

  if (singleHasFile) {
    // 7b case: original intact at single path -> point DB back to it
    const target = oldByStem.get(name) || `${BASE}/storage/v1/object/public/${enc(single)}`
    await fetch(`${BASE}/rest/v1/photos?id=eq.${r.id}`, {
      method: 'PATCH',
      headers: { ...H(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ url: target })
    })
    patched++
    console.log(`patch-db  ${name} -> single (original intact)`)
  } else {
    // 8B case: source lives at double path -> move object to single
    const src = await fetch(`${BASE}/storage/v1/object/public/${enc(p)}`)
    if (!src.ok) {
      console.log(`MISSING ${name}: no single, no double -> data lost!`)
      continue
    }
    const data = Buffer.from(await src.arrayBuffer())
    const up = await fetch(`${BASE}/storage/v1/object/${enc(single)}`, {
      method: 'POST',
      headers: { ...H(), 'Content-Type': src.headers.get('content-type') || 'image/jpeg', 'x-upsert': 'true' },
      body: data
    })
    if (!up.ok) throw new Error(`failed to restore ${single}: ${up.status} ${await up.text()}`)
    const newUrl = `${BASE}/storage/v1/object/public/${enc(single)}`
    await fetch(`${BASE}/rest/v1/photos?id=eq.${r.id}`, {
      method: 'PATCH',
      headers: { ...H(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ url: newUrl })
    })
    const del = await fetch(`${BASE}/storage/v1/object/${enc(p)}`, { method: 'DELETE', headers: H() })
    if (!del.ok) console.log(`  ! could not delete double ${p} (${del.status})`)
    patched++
    console.log(`moved     ${name}: double -> single (${Math.round(data.length / 1024)} KB)`)
  }
}
console.log(`\nrepaired ${patched} rows`)

// sweep: delete any leftover double-path objects (check a few known prefixes)
for (const cls of ['9ee726ef-5d3f-4400-8859-08351a2c2308', 'de273e2b-beef-4d25-a885-1262bbb1b286']) {
  for (const r of rows) {
    const p = decodeURIComponent(new URL(r.url).pathname.replace(/^\/storage\/v1\/object\/public\//, ''))
    if (p.includes(cls)) {
      const leftover = `photos/photos/${cls}/${p.split('/').pop()}`
      const d = await fetch(`${BASE}/storage/v1/object/${enc(leftover)}`, { method: 'DELETE', headers: H() })
      if (d.ok) console.log(`swept leftover ${leftover}`)
    }
  }
}

// final verification: GET every DB url
const rows2 = await (await fetch(`${BASE}/rest/v1/photos?select=id,url`, { headers: H() })).json()
let total = 0
let bad = 0
for (const r of rows2) {
  const res = await fetch(r.url, { method: 'GET' })
  const buf = Buffer.from(await res.arrayBuffer())
  total += buf.length
  if (!res.ok) {
    bad++
    console.log('STILL BROKEN', res.status, r.url)
  }
}
console.log(`\nverified: ${rows2.length - bad}/${rows2.length} OK, total ${(total / 1048576).toFixed(1)} MB`)
