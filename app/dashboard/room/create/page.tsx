'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavigationClient from '@/components/NavigationClient'
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Shield, 
  ArrowRight,
  Zap,
  Info,
  X,
  Plus
} from 'lucide-react'

type RoleType = 'admin' | 'member'
type CapacityType = '2' | '4' | '6' | '8' | 'public'

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
    price: '',
  })
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [currentInviteEmail, setCurrentInviteEmail] = useState('')
  const [error, setError] = useState('')

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
    if (formData.title.trim()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.role === 'member' && !formData.adminEmail.trim()) {
        throw new Error('Please enter the email of the person you want to make admin')
      }

      if (formData.capacity !== 'public' && !formData.price.trim()) {
        throw new Error('Please enter a subscription price')
      }

      const price = formData.capacity !== 'public' ? parseFloat(formData.price) : 0

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          price: price,
          role: formData.role,
          adminEmail: formData.role === 'member' ? formData.adminEmail : null,
          capacity: formData.capacity === 'public' ? null : parseInt(formData.capacity),
          isPublic: formData.capacity === 'public',
          inviteEmails: inviteEmails,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create room')
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pb-20">
      <NavigationClient />

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-20">
           
           {/* Left: Interactive Form */}
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
                 
                 {/* Step 1: Identity */}
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
                       <label className="text-[10px] font-black text-[#0d2a21] placeholder:text-[#01140e]/50 uppercase tracking-[0.2em] mb-4 block">Narration</label>
                       <textarea 
                         placeholder="What happens in this sanctuary? Describe the value."
                         value={formData.description}
                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                         rows={2}
                         className="w-full bg-transparent border-b-2 border-black/10 py-4 text-3xl font-nanum placeholder:text-[#01140e]/50 focus:border-[#10b981] outline-none text-black transition-all resize-none"
                       />
                    </div>

                    {step === 1 && (
                      <button 
                        type="button"
                        onClick={handleNextStep}
                        disabled={!formData.title.trim()}
                        className="px-8 py-3.5 sm:py-4 bg-[#0d2a21] text-white rounded-full font-bold flex items-center gap-3 hover:bg-[#184638] transition-all shadow-xl disabled:opacity-90 cursor-pointer "
                      >
                         <span>Define Settings</span>
                         <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                 </div>

                 {/* Step 2: Mechanics */}
                 {step === 2 && (
                   <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      
                      {/* Role & Access Section */}
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

                      {/* Delegated Admin Info */}
                      {formData.role === 'member' && (
                        <div className="space-y-6 p-8 bg-white rounded-[2.5rem] border-2 border-[#10b981] animate-in zoom-in-95 duration-300 shadow-lg">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                               <Shield className="w-5 h-5" />
                             </div>
                             <h4 className="font-bold text-[#0d2a21]">Assign Administrator</h4>
                           </div>
                           <p className="text-[#0d2a21]/50 text-xs mb-6">Enter the contact details of the expert who will lead this room.</p>
                           
                           <div className="space-y-4">
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
                        </div>
                      )}

                      {/* Capacity Grid */}
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

                      {/* Early Invitees Section */}
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
                              <div key={email} className="bg-white border border-black/5 px-4 py-2 rounded-full flex items-center gap-2 group">
                                <span className="text-xs font-bold text-[#0d2a21]">{email}</span>
                                <button 
                                  type="button"
                                  onClick={() => removeEmail(email)}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Monetization */}
                      {formData.capacity !== 'public' && (
                        <div className="animate-in zoom-in-95 duration-300">
                           <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] mb-4 block">Monthly Value (TZS)</label>
                           <input 
                             type="number"
                             placeholder="29900"
                             value={formData.price}
                             onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                             className="w-full bg-white px-8 py-6 rounded-[2rem] text-3xl font-bold font-nanum shadow-sm border border-black/5 outline-none focus:border-[#10b981] transition-all text-black"
                           />
                        </div>
                      )}

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

           {/* Right: Studio Preview */}
           <div className="hidden lg:block sticky top-32 h-fit">
              <div className="bg-[#0d2a21] rounded-[4rem] p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden group">
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
                             {formData.title || "Your Room Title"}
                          </h2>
                          <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-sm font-satoshi min-h-[4rem]">
                             {formData.description || "As you type your description, it will materialize here in real-time."}
                          </p>
                       </div>

                       <div className="flex items-center gap-6 pt-10">
                          <div className="flex -space-x-3">
                             {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0d2a21] bg-white/10" />)}
                          </div>
                          <p className="text-xs font-bold text-[#10b981] tracking-widest uppercase">
                             {formData.capacity === 'public' ? "Public Event" : `Closed for ${formData.capacity} experts`}
                          </p>
                       </div>

                       <div className="pt-8">
                          <button className="w-full py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white/30 cursor-default">
                             {formData.capacity === 'public' ? "Join Event" : `Unlock for TZS ${formData.price || '0'}`}
                          </button>
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

function SelectCard({ active, onClick, icon, title, desc }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] text-left transition-all border-2 flex flex-col gap-6 shadow-sm ${active ? 'bg-white border-[#10b981] shadow-lg' : 'bg-white/40 border-transparent hover:bg-white hover:border-[#0d2a21]/10'}`}
    >
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-white text-[#0d2a21]/30'}`}>{icon}</div>
       <div>
          <h4 className="font-bold text-[#0d2a21] text-lg leading-none mb-2">{title}</h4>
          <p className="text-[#0d2a21]/50 text-xs font-medium leading-relaxed">{desc}</p>
       </div>
    </button>
  )
}
