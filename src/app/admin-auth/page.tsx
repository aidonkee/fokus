import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from './AuthForm'

export const dynamic = 'force-dynamic'

export default async function AdminAuthPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B132B] p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-yellow-500/40 rounded-xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Требуется настройка окружения</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            В панели Vercel (<strong>Project Settings → Environment Variables</strong>) необходимо добавить переменные для подключения базы данных:
          </p>
          <div className="bg-black/60 p-4 rounded-lg text-xs text-yellow-300 text-left font-mono space-y-1 mb-6 border border-zinc-800">
            <div>NEXT_PUBLIC_SUPABASE_URL</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
            <div>SUPABASE_SERVICE_ROLE_KEY</div>
          </div>
          <p className="text-xs text-slate-400">
            После добавления переменных в Vercel выполните Redeploy.
          </p>
        </div>
      </div>
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/admin/dashboard')
    }
  } catch (err) {
    console.error('Auth error in AdminAuthPage:', err)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Вход в систему</h1>
          <p className="text-slate-400">Панель администратора</p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  )
}
