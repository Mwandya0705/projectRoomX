'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, Info } from 'lucide-react'

export default function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Success! Check your email for a confirmation link.' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Redirect will be handled by auth listener or manual redirect
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Auth error:', error)
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Authentication failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in with Google:', error)
      setMessage({ type: 'error', text: 'Failed to login with Google.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-900 border border-red-100' : 'bg-emerald-50 text-emerald-900 border border-emerald-100'}`}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-relaxed">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@residence.com"
              className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest">Password</label>
            {mode === 'signin' && (
              <button type="button" className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:underline">Forgot?</button>
            )}
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 sm:py-3.5 bg-[#0d2a21] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#184638] transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{mode === 'signin' ? 'Access Dashboard' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5" /></div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-[#0d2a21]/20 bg-white px-4 mx-auto w-fit">Identity Provider</div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-black/5 text-[#0d2a21] hover:bg-[#f5f6f2] font-bold px-6 py-3 sm:py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="text-center">
        <button 
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-xs font-bold text-[#0d2a21] hover:text-[#10b981] transition-colors"
        >
          {mode === 'signin' ? "New to RoomX? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  )
}
