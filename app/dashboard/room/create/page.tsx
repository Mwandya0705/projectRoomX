'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Users,
  Shield,
  ArrowRight,
  Zap,
  Info,
  X,
  Plus,
  Unlock,
  Lock,
  DollarSign,
} from 'lucide-react'


type RoleType = 'admin' | 'member'
type CapacityType = '2' | '4' | '6' | '8' | 'public'

function formatTZS(raw: string): string {
  const num = raw.replace(/\D/g, '')
  return num ? Number(num).toLocaleString('en-US') : ''
}

export default function CreateRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    role: 'admin' as RoleType,
    adminEmail: '',
    capacity: 'public' as CapacityType,
    category: 'Other',
  })
  const [isPaid, setIsPaid] = useState(false)
  const [priceRaw, setPriceRaw] = useState('') // raw digits only
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [currentInviteEmail, setCurrentInviteEmail] = useState('')
  const [error, setError] = useState('')

  const priceNumber = parseInt(priceRaw.replace(/\D/g, '') || '0', 10)
  const priceDisplay = formatTZS(priceRaw)

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setPriceRaw(digits)
  }

  const handleAddEmail = () => {
    if (!currentInviteEmail.trim()) return
    if (!currentInviteEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (inviteEmails.includes(currentInviteEmail)) {
      setError('Email already added')
      return
    }
    setInviteEmails([...inviteEmails, currentInviteEmail])
    setCurrentInviteEmail('')
    setError('')
  }

  const removeEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter(e => e !== email))
  }

  const handleNextStep = () => {
    if (formData.title.trim()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.role === 'member' && !formData.adminEmail.trim()) {
        throw new Error('Please enter the email of the person you want to make admin')
      }

      if (isPaid && priceNumber < 500) {
        throw new Error('Minimum subscription price is TZS 500')
      }

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          price: isPaid ? priceNumber : 0,
          role: formData.role,
          adminEmail: formData.role === 'member' ? formData.adminEmail : null,
          capacity: formData.capacity === 'public' ? null : parseInt(formData.capacity),
          isPublic: formData.capacity === 'public',
          inviteEmails,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create room')
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pb-20">
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-20">

          {/* ── Left: Form ─────────────────────────────────────── */}
          <div className="max-w-2xl">
            <div className="mb-12">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#0d2a21]/40 hover:text-[#0d2a21] transition-all group mb-8">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Control Center</span>
              </Link>
              <h1 className="text-[52px] lg:text-[72px] font-bold text-[#0d2a21] leading-none tracking-tighter font-nanum mb-4">
                Architect <br/><span className="text-[#10b981]">your Room.</span>
              </h1>
              <p className="text-[#0d2a21]/60 text-lg">Define the boundaries of your private sanctuary.</p>
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-900 animate-in fade-in slide-in-from-top-4">
                <Info className="w-6 h-6 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">

              {/* ── Step 1: Identity ─────────────────────────── */}
              <div className={`space-y-8 transition-all duration-500 ${step === 2 ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="group">
                  <label className="text-[10px] font-black text-[#0d2a21] uppercase tracking-[0.2em] mb-4 block">Room Identity</label>
                  <input
                    type="text"
                    placeholder="e.g. The Signal Lounge"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-black/10 py-4 text-4xl font-bold font-nanum placeholder:text-[#01140e]/50 focus:border-[#10b981] outline-none text-black transition-all"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-[#0d2a21] uppercase tracking-[0.2em] mb-4 block">Narration</label>
                  <textarea
                    placeholder="What happens in this sanctuary? Describe the value."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full bg-transparent border-b-2 border-black/10 py-4 text-3xl font-nanum placeholder:text-[#01140e]/50 focus:border-[#10b981] outline-none text-black transition-all resize-none"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-[#0d2a21] uppercase tracking-[0.2em] mb-4 block">Category</label>
                  <div className="flex flex-wrap gap-4">
                    {['Trading', 'Content Creation', 'Education', 'Consulting', 'Other'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${formData.category === cat ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-white border border-black/5 text-[#0d2a21]/60 hover:bg-white/80'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {step === 1 && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!formData.title.trim()}
                    className="px-8 py-3.5 sm:py-4 bg-[#0d2a21] text-white rounded-full font-bold flex items-center gap-3 hover:bg-[#184638] transition-all shadow-xl disabled:opacity-90"
                  >
                    <span>Define Settings</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* ── Step 2: Mechanics ────────────────────────── */}
              {step === 2 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

                  {/* Role */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <SelectCard
                      active={formData.role === 'admin'}
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      icon={<Shield className="w-5 h-5" />}
                      title="Full Control"
                      desc="You lead the sessions."
                    />
                    <SelectCard
                      active={formData.role === 'member'}
                      onClick={() => setFormData({ ...formData, role: 'member' })}
                      icon={<Users className="w-5 h-5" />}
                      title="Delegated"
                      desc="Assign another leader."
                    />
                  </div>

                  {formData.role === 'member' && (
                    <div className="space-y-6 p-8 bg-white rounded-[2.5rem] border-2 border-[#10b981] animate-in zoom-in-95 duration-300 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                          <Shield className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-[#0d2a21]">Assign Administrator</h4>
                      </div>
                      <p className="text-[#0d2a21]/50 text-xs mb-6">Enter the contact details of the expert who will lead this room.</p>
                      <div>
                        <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] mb-2 block ml-1">Administrator Email</label>
                        <input
                          type="email"
                          placeholder="expert@example.com"
                          required
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full bg-[#f5f6f2] px-6 py-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all text-black"
                        />
                      </div>
                    </div>
                  )}

                  {/* Capacity */}
                  <div>
                    <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] mb-6 block">Engagement Scale</label>
                    <div className="flex flex-wrap gap-4">
                      {['2', '4', '6', '8', 'public'].map((cap) => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => setFormData({ ...formData, capacity: cap as CapacityType })}
                          className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${formData.capacity === cap ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-white text-[#0d2a21]/60 hover:bg-white/80'}`}
                        >
                          {cap === 'public' ? 'Unlimited' : `${cap} Seats`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Pricing ──────────────────────────────── */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] mb-6 block">
                        Access Pricing
                      </label>

                      {/* Free / Paid toggle */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => { setIsPaid(false); setPriceRaw('') }}
                          className={`relative p-6 rounded-[2rem] text-left transition-all border-2 flex flex-col gap-3 shadow-sm ${
                            !isPaid
                              ? 'bg-white border-[#10b981] shadow-lg'
                              : 'bg-white/40 border-transparent hover:bg-white hover:border-[#0d2a21]/10'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isPaid ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-white text-[#0d2a21]/30'}`}>
                            <Unlock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0d2a21] text-base leading-none mb-1">Free</p>
                            <p className="text-[#0d2a21]/40 text-xs font-medium">Open to all members</p>
                          </div>
                          {!isPaid && (
                            <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPaid(true)}
                          className={`relative p-6 rounded-[2rem] text-left transition-all border-2 flex flex-col gap-3 shadow-sm ${
                            isPaid
                              ? 'bg-white border-[#10b981] shadow-lg'
                              : 'bg-white/40 border-transparent hover:bg-white hover:border-[#0d2a21]/10'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPaid ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-white text-[#0d2a21]/30'}`}>
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0d2a21] text-base leading-none mb-1">Paid</p>
                            <p className="text-[#0d2a21]/40 text-xs font-medium">Monthly subscription fee</p>
                          </div>
                          {isPaid && (
                            <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                          )}
                        </button>
                      </div>

                      {/* Price input — only when Paid */}
                      {isPaid && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-3">
                          <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] block">
                            Monthly Price (TZS)
                          </label>

                          <div className="relative group">
                            {/* Currency prefix */}
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                              <DollarSign className="w-5 h-5 text-[#10b981]" />
                              <span className="text-sm font-black text-[#0d2a21]/40 uppercase tracking-widest">TZS</span>
                              <span className="w-px h-5 bg-black/10" />
                            </div>

                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={priceDisplay}
                              onChange={handlePriceChange}
                              className="w-full bg-white border-2 border-transparent focus:border-[#10b981]/30 pl-32 pr-8 py-6 rounded-[2rem] text-3xl font-bold font-nanum shadow-sm outline-none transition-all text-black"
                            />

                            {/* Per month badge */}
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-[#f5f6f2] text-[#0d2a21]/40 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                              / mo
                            </div>
                          </div>

                          {/* Quick preset buttons */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPriceRaw(String(preset))}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                  priceNumber === preset
                                    ? 'bg-[#10b981] text-[#0d2a21] border-[#10b981]'
                                    : 'bg-white text-[#0d2a21]/50 border-black/8 hover:border-[#10b981]/40 hover:text-[#0d2a21]'
                                }`}
                              >
                                {preset.toLocaleString('en-US')}
                              </button>
                            ))}
                          </div>

                          {/* Info note */}
                          <p className="text-[11px] text-[#0d2a21]/40 font-medium ml-1 leading-relaxed">
                            Subscribers pay this amount monthly via M-Pesa, Tigo, Airtel, or card. You can update pricing later from the room settings.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Early Invitees */}
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] mb-4 block">Early Invitees</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="guest@example.com"
                        value={currentInviteEmail}
                        onChange={(e) => setCurrentInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                        className="flex-1 bg-white px-6 py-4 rounded-2xl text-sm font-bold shadow-sm border border-black/5 outline-none focus:border-[#10b981] transition-all text-black"
                      />
                      <button
                        type="button"
                        onClick={handleAddEmail}
                        className="px-6 bg-[#0d2a21] text-white rounded-2xl hover:bg-[#184638] transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    {inviteEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                        {inviteEmails.map(email => (
                          <div key={email} className="bg-white border border-black/5 px-4 py-2 rounded-full flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0d2a21]">{email}</span>
                            <button type="button" onClick={() => removeEmail(email)} className="text-red-400 hover:text-red-600 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 sm:px-8 sm:py-3.5 border border-black/10 rounded-full font-bold hover:bg-white transition-all"
                    >Back</button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 sm:px-10 sm:py-3.5 bg-[#0d2a21] text-white rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#184638] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Zap className="w-5 h-5" />
                      <span>{loading ? 'Powering Up...' : 'Launch Reality'}</span>
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>

          {/* ── Right: Studio Preview ───────────────────────── */}
          <div className="hidden lg:block sticky top-32 h-fit">
            <div className="bg-[#0d2a21] rounded-[4rem] p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#10b981]/20 blur-[100px] rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Studio Preview</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="h-[2px] bg-white/10 w-full" />

                  <div>
                    <h2 className="text-4xl font-bold font-nanum leading-tight min-h-[3rem]">
                      {formData.title || 'Your Room Title'}
                    </h2>
                    <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-sm min-h-[4rem]">
                      {formData.description || 'As you type your description, it will materialize here in real-time.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0d2a21] bg-white/10" />)}
                    </div>
                    <p className="text-xs font-bold text-[#10b981] tracking-widest uppercase">
                      {formData.capacity === 'public' ? 'Public Event' : `Closed for ${formData.capacity} experts`}
                    </p>
                  </div>

                  {/* Pricing preview block */}
                  <div className="pt-4 space-y-3">
                    {isPaid && priceNumber > 0 ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Monthly Access</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mr-1">TZS</span>
                          <span className="text-4xl font-black font-nanum text-[#10b981] tracking-tighter">
                            {priceNumber.toLocaleString('en-US')}
                          </span>
                          <span className="text-white/30 text-xs font-bold uppercase tracking-widest">/ mo</span>
                        </div>
                        <button className="w-full mt-2 py-3.5 bg-[#10b981]/10 border border-[#10b981]/30 rounded-2xl text-xs font-black uppercase tracking-widest text-[#10b981] cursor-default">
                          Subscribe to Access
                        </button>
                      </>
                    ) : (
                      <button className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white/30 cursor-default">
                        {formData.capacity === 'public' ? 'Join Free' : 'Free Access'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 px-8 flex items-center gap-4 text-[#0d2a21]/30">
              <Sparkles className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium leading-relaxed italic">
                RoomX uses Prism technology. Every setting here defines your engine's capability.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function SelectCard({ active, onClick, icon, title, desc }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] text-left transition-all border-2 flex flex-col gap-6 shadow-sm ${active ? 'bg-white border-[#10b981] shadow-lg' : 'bg-white/40 border-transparent hover:bg-white hover:border-[#0d2a21]/10'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-white text-[#0d2a21]/30'}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-[#0d2a21] text-lg leading-none mb-2">{title}</h4>
        <p className="text-[#0d2a21]/50 text-xs font-medium leading-relaxed">{desc}</p>
      </div>
    </button>
  )
}
