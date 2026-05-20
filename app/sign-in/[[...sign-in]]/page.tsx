import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthForm from '@/components/AuthForm'

export default async function SignInPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f2] px-4 font-nanum">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 2xl:p-12 shadow-2xl shadow-black/5 border border-black/5 relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#75f560]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#0d2a21]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-10">
          <h1 className="text-[42px] lg:text-[52px] font-bold text-[#0d2a21] mb-2 leading-none tracking-tighter">Enter your <br/><span className="text-[#10b981]">Sanctuary.</span></h1>
          <p className="text-[#0d2a21]/50 text-sm font-medium mt-4">Access the infrastructure of influence.</p>
        </div>

        <AuthForm />
      </div>
    </div>
  )
}


