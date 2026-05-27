'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, Loader2, Info, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PageState = 'loading' | 'ready' | 'success' | 'expired'

function ResetPasswordForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [pageState,    setPageState]    = useState<PageState>('loading')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    // The browser client has detectSessionInUrl:true so it auto-exchanges
    // the ?code= param and fires onAuthStateChange with PASSWORD_RECOVERY.
    // We subscribe to that event instead of manually calling exchangeCodeForSession.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      }
    })

    // Edge case: user refreshed the page after the code was already exchanged
    // — a regular SIGNED_IN session will exist, treat it as ready.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState('ready')
      }
    })

    // If nothing fires within 5 s (bad/expired link) show the expired state.
    const timeout = setTimeout(() => {
      setPageState(prev => (prev === 'loading' ? 'expired' : prev))
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      // Get the current access token to pass to the server.
      // The server-side route uses admin to update the password, which bypasses
      // Supabase's "must be a recovery session" restriction and avoids client-side
      // PKCE code-verifier issues that cause updateUser() to hang.
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          accessToken: session?.access_token ?? undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password.')

      setPageState('success')
      await supabase.auth.signOut()
      setTimeout(() => router.push('/sign-in'), 2500)
    } catch (err) {
      console.error('[ResetPassword] update failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">

      {/* Loading */}
      {pageState === 'loading' && (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
          <p className="text-sm font-bold text-[#0d2a21]/40">Verifying link…</p>
        </motion.div>
      )}

      {/* Expired / invalid */}
      {pageState === 'expired' && (
        <motion.div key="expired" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Info className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#0d2a21] leading-tight tracking-tighter mb-3">Link expired.</h1>
          <p className="text-sm text-[#0d2a21]/50 mb-8">
            This password reset link is invalid or has expired.<br />Request a new one from the sign-in page.
          </p>
          <Link href="/sign-in"
            className="inline-flex items-center gap-2 bg-[#0d2a21] text-white rounded-2xl px-6 py-3 font-bold text-sm hover:bg-[#184638] transition-all">
            Back to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Success */}
      {pageState === 'success' && (
        <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 text-[#10b981]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0d2a21] leading-tight tracking-tighter mb-3">Password updated.</h1>
          <p className="text-sm text-[#0d2a21]/50">Redirecting you to sign in…</p>
        </motion.div>
      )}

      {/* New password form */}
      {pageState === 'ready' && (
        <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="text-center mb-10">
            <h1 className="text-[42px] font-bold text-[#0d2a21] leading-none tracking-tighter mb-2">
              New <span className="text-[#10b981]">Password.</span>
            </h1>
            <p className="text-[#0d2a21]/50 text-sm font-medium mt-4">Choose a strong password for your account.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl flex items-start gap-3 bg-red-50 text-red-900 border border-red-100 mb-4">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} required minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d2a21]/30 hover:text-[#0d2a21]/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type={showConfirm ? 'text' : 'password'} required minLength={6}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d2a21]/30 hover:text-[#0d2a21]/60 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {confirm.length > 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-xs font-bold ml-1 ${password === confirm ? 'text-[#10b981]' : 'text-red-500'}`}>
                {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
              </motion.p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#0d2a21] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#184638] transition-all active:scale-95 disabled:opacity-50">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><span>Update Password</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </motion.div>
      )}

    </AnimatePresence>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6f2] px-4 font-nanum">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 2xl:p-12 shadow-2xl shadow-black/5 border border-black/5 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#75f560]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#0d2a21]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
