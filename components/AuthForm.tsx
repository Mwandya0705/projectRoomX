'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, Info, CheckCircle, Eye, EyeOff, ArrowLeft, User } from 'lucide-react'

type Mode = 'signin' | 'signup' | 'forgot'

type Message = { type: 'error' | 'success'; text: string }

export default function AuthForm() {
  const supabase = createClient()

  const [mode, setMode]       = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // True when signup is done — show "check your email" state
  const [signupSent, setSignupSent] = useState(false)
  // True when forgot-password email is sent
  const [resetSent, setResetSent]   = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setMessage(null)
    setSignupSent(false)
    setResetSent(false)
  }

  // ── Sign In ────────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Authentication failed.' })
    } finally {
      setLoading(false)
    }
  }

  // ── Sign Up (server route → Resend confirmation email) ────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed.')
      setSignupSent(true)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Signup failed.' })
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password (server route → Resend reset email) ──────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed.')
      setResetSent(true)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Request failed.' })
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to login with Google.' })
      setLoading(false)
    }
  }

  // ── Signup success state ─────────────────────────────────────────────────
  if (signupSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-5 py-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-[#10b981]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0d2a21] tracking-tight">Check your inbox.</h2>
          <p className="text-sm text-[#0d2a21]/50 mt-2 leading-relaxed">
            We've sent a confirmation link to <strong className="text-[#0d2a21]">{email}</strong>.
            Click it to activate your account.
          </p>
        </div>
        <p className="text-xs text-[#0d2a21]/30">Didn't receive it? Check your spam folder.</p>
        <button
          onClick={() => switchMode('signin')}
          className="text-xs font-bold text-[#10b981] hover:underline"
        >
          Back to Sign In
        </button>
      </motion.div>
    )
  }

  // ── Reset sent state ──────────────────────────────────────────────────────
  if (resetSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-5 py-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-[#10b981]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0d2a21] tracking-tight">Email sent.</h2>
          <p className="text-sm text-[#0d2a21]/50 mt-2 leading-relaxed">
            If <strong className="text-[#0d2a21]">{email}</strong> is registered, you'll receive
            a password reset link shortly.
          </p>
        </div>
        <p className="text-xs text-[#0d2a21]/30">The link expires in 1 hour.</p>
        <button
          onClick={() => switchMode('signin')}
          className="text-xs font-bold text-[#10b981] hover:underline"
        >
          Back to Sign In
        </button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Error / success banner */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key="msg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-start gap-3 ${
              message.type === 'error'
                ? 'bg-red-50 text-red-900 border border-red-100'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
            }`}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-relaxed">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── SIGN IN ───────────────────────────────────────────────────── */}
        {mode === 'signin' && (
          <motion.form
            key="signin"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            onSubmit={handleSignIn}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. name@residence.com"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d2a21]/30 hover:text-[#0d2a21]/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#0d2a21] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#184638] transition-all active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Access Dashboard</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}

        {/* ── SIGN UP ───────────────────────────────────────────────────── */}
        {mode === 'signup' && (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            onSubmit={handleSignUp}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. name@residence.com"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0d2a21]/30 hover:text-[#0d2a21]/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#0d2a21] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#184638] transition-all active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}

        {/* ── FORGOT PASSWORD ────────────────────────────────────────────── */}
        {mode === 'forgot' && (
          <motion.form
            key="forgot"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            onSubmit={handleForgot}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="flex items-center gap-1.5 text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest hover:text-[#0d2a21] transition-colors mb-2"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </button>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-widest ml-1">Your Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/20 group-focus-within:text-[#10b981] transition-colors" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. name@residence.com"
                  className="w-full bg-[#f5f6f2] border-2 border-transparent focus:border-[#10b981]/20 focus:bg-white px-11 py-4 rounded-2xl text-sm font-bold outline-none transition-all text-black"
                />
              </div>
            </div>

            <p className="text-xs text-[#0d2a21]/40 leading-relaxed ml-1">
              Enter the email address linked to your account and we'll send you a reset link.
            </p>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#0d2a21] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#184638] transition-all active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send Reset Link</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}

      </AnimatePresence>

      {/* Google — hide on forgot mode */}
      {mode !== 'forgot' && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5" /></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-[#0d2a21]/20 bg-white px-4 mx-auto w-fit">Identity Provider</div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-black/5 text-[#0d2a21] hover:bg-[#f5f6f2] font-bold px-6 py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </>
      )}

      {/* Mode switcher */}
      {mode !== 'forgot' && (
        <div className="text-center">
          <button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-xs font-bold text-[#0d2a21] hover:text-[#10b981] transition-colors"
          >
            {mode === 'signin' ? 'New to RoomX? Create an account' : 'Already have an account? Sign in'}
          </button>
        </div>
      )}
    </div>
  )
}
