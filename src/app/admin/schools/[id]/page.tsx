import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ChevronRight, Plus, Users } from 'lucide-react'
import { notFound } from 'next/navigation'

function generateSlug(length = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default async function AdminSchoolView({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (!school) {
    notFound()
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', id)
    .order('created_at', { ascending: false })

  async function createClass(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    if (!name) return

    let unique = false
    let slug = ''
    const supabase = await createClient()
    
    // Simple retry loop to ensure unique slug
    while (!unique) {
      slug = generateSlug()
      const { data } = await supabase.from('classes').select('id').eq('slug', slug).single()
      if (!data) unique = true
    }

    await supabase.from('classes').insert({ 
      name, 
      school_id: id,
      slug
    })
    revalidatePath(`/admin/schools/${id}`)
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center gap-2 text-zinc-400 mb-6 font-sans">
        <Link href="/admin/dashboard" className="hover:text-primary transition">Школы</Link>
        <ChevronRight size={16} />
        <span className="text-white">{school.name}</span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Классы — {school.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create new class form/card */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-4 font-sans text-primary">Добавить класс</h2>
          <form action={createClass} className="flex flex-col gap-3">
            <input 
              name="name" 
              placeholder="Название класса (например, 7А)" 
              required
              className="bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-primary"
            />
            <button 
              type="submit"
              className="bg-primary text-black font-bold py-3 rounded flex items-center justify-center gap-2 hover:bg-yellow-400 transition"
            >
              <Plus size={20} />
              Создать
            </button>
          </form>
        </div>

        {/* List of classes */}
        {classes?.map((cls) => (
          <Link 
            key={cls.id} 
            href={`/admin/classes/${cls.id}`}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-primary hover:-translate-y-1 transition-all group flex flex-col relative overflow-hidden"
          >
            <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold font-sans mb-1">{cls.name}</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Код: <span className="font-mono text-zinc-300">{cls.slug}</span>
            </p>
            <div className="mt-auto flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Управление фото <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
