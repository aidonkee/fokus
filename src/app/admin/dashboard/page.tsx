import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Plus, School } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })

  async function createSchool(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    if (!name) return

    const supabase = await createClient()
    await supabase.from('schools').insert({ name })
    revalidatePath('/admin/dashboard')
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Школы</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create new school form/card */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-4 font-sans text-primary">Добавить школу</h2>
          <form action={createSchool} className="flex flex-col gap-3">
            <input 
              name="name" 
              placeholder="Название школы (например, Школа №1366)" 
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

        {/* List of schools */}
        {schools?.map((school) => (
          <Link 
            key={school.id} 
            href={`/admin/schools/${school.id}`}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-primary hover:-translate-y-1 transition-all group flex flex-col"
          >
            <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
              <School size={24} />
            </div>
            <h3 className="text-xl font-bold font-sans mb-2">{school.name}</h3>
            <p className="text-zinc-400 text-sm mt-auto">
              Создано: {new Date(school.created_at).toLocaleDateString('ru-RU')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
