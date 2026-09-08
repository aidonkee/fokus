import Link from 'next/link'
import { Camera, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-white hover:text-[#FF6B35] transition-colors">
            <Camera className="w-6 h-6" />
            <span className="font-semibold text-lg">PhotoAdmin</span>
          </Link>
          
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/admin-auth')
          }}>
            <button type="submit" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  )
}
