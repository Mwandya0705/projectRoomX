'use client'

import { ImageIcon, VideoIcon, Film, Paperclip, Sparkles, Download, RotateCcw, Home, LayoutDashboard, Zap, RefreshCw } from 'lucide-react'
import { useState, useRef, useCallback } from 'react'
import { AIJob } from '@/lib/ai/jobs'

const STYLES = [
  { id: 'luxury',      label: 'Luxury',      color: '#ff7759' },
  { id: 'ecommerce',   label: 'E-Commerce',  color: '#3b82f6' },
  { id: 'influencer',  label: 'Influencer',  color: '#ec4899' },
  { id: 'cinematic',   label: 'Cinematic',   color: '#8b5cf6' },
  { id: 'studio',      label: 'Studio',      color: '#10b981' },
] as const

type StyleId = typeof STYLES[number]['id']
type Mode = 'image' | 'video'

interface Props {
  user: { id: string; name: string | null; email: string; imageUrl: string | null }
  initialCredits: number
  initialJobs: AIJob[]
}

export default function AIStudioClient({ user, initialCredits, initialJobs }: Props) {
  const [mode, setMode] = useState<Mode>('image')
  const [style, setStyle] = useState<StyleId>('studio')
  const [prompt, setPrompt] = useState('')
  const [premium, setPremium] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string; type: Mode; enhanced: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState(initialCredits)
  const [jobs, setJobs] = useState<AIJob[]>(initialJobs)
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'credits'>('create')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const creditCost = mode === 'video' ? 250 : premium ? 50 : 20

  const handleUpload = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file)
    setUploadedPreview(preview)
    const fd = new FormData(); fd.append('image', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) setUploadedUrl(data.url)
    else setError('Image upload failed')
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_type: mode, prompt, style, uploaded_image_url: uploadedUrl, premium }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult({ url: data.result_url, type: mode, enhanced: data.enhanced_prompt })
      setCredits(data.credits_remaining)
      // Refresh jobs list
      const jr = await fetch('/api/ai/jobs')
      if (jr.ok) { const jd = await jr.json(); setJobs(jd.jobs || []) }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1210] text-[#eeece7] font-sans antialiased">
      {/* Top Bar - Cohere Black / Deep Green Aesthetic */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#17171c]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[#ff7759] flex items-center justify-center text-xs font-black text-black">AI</div>
          <span className="font-bold tracking-tight text-white text-sm">
            RoomX <span className="text-[#ff7759] font-mono text-xs uppercase tracking-widest ml-1">Studio</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-[#ff7759]">⚡</span>
            <span className="font-bold text-white">{credits.toLocaleString()}</span>
            <span className="text-white/40">credits</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7759] to-[#ffad9b] flex items-center justify-center text-xs font-bold text-black uppercase">
            {(user.name || user.email)[0]}
          </div>
        </div>
      </header>

      {/* Main Container - Adjusted Padding for Mobile Bottom Bar */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-screen pt-16 pb-16 lg:pb-0 overflow-x-hidden">
        {/* Sidebar - Desktop Layout (Side) and Mobile Layout (Bottom Sticky Nav Bar) */}
        <aside className="fixed bottom-0 left-0 right-0 h-16 lg:h-auto lg:static lg:w-56 border-t lg:border-t-0 lg:border-r border-white/5 flex flex-row lg:flex-col justify-around lg:justify-start gap-1 px-4 py-2 lg:px-3 lg:py-6 bg-[#17171c] z-50">
          {[
            { id: 'create',  icon: '✦', label: 'Create' },
            { id: 'history', icon: '◷', label: 'History' },
            { id: 'credits', icon: '⚡', label: 'Credits' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-3 py-2 lg:py-3 rounded-[8px] text-xs lg:text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-[#ff7759]/10 text-[#ff7759] border border-[#ff7759]/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="hidden lg:block">{item.label}</span>
            </button>
          ))}
          <div className="hidden lg:flex flex-col gap-1 mt-auto w-full">
            <a href="/" className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block">Home</span>
            </a>
            <a href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block">Dashboard</span>
            </a>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#0a1210]">
          {activeTab === 'create' && (
            <>
              {/* Left Panel: Inputs - Cohere sober command center style */}
              <div className="w-full lg:w-[440px] flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#17171c] overflow-y-auto shrink-0">
                <div className="p-6 space-y-6">

                  {/* Mode Selector */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff7759]/80 mb-2.5">Mode</p>
                    <div className="flex gap-2 p-1 bg-[#0a1210] rounded-[8px] border border-white/5">
                      {(['image','video'] as Mode[]).map(m => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`flex-1 py-2 rounded-[6px] text-xs font-bold transition-all capitalize flex items-center justify-center gap-2 ${
                            mode === m
                              ? 'bg-[#ff7759] text-black shadow-md'
                              : 'text-white/40 hover:text-white/70'
                          }`}
                        >
                          {m === 'image' ? <><ImageIcon className="w-3.5 h-3.5" />Image</> : <><VideoIcon className="w-3.5 h-3.5" />Video</>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Text Input */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2.5">Prompt</p>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="A luxury perfume bottle on black marble, cinematic light..."
                      rows={4}
                      className="w-full bg-[#0a1210] border border-white/5 rounded-[8px] px-4 py-3 text-sm text-white placeholder:text-white/10 resize-none outline-none focus:border-[#ff7759]/50 focus:ring-1 focus:ring-[#ff7759]/50 transition-all font-mono"
                    />
                    <p className="text-[10px] text-white/20 mt-1.5 font-mono">OpenAI will enhance your prompt for premium publication quality</p>
                  </div>

                  {/* Style Filter Chips */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2.5">Style</p>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map(s => {
                        const active = style === s.id
                        return (
                          <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              active
                                ? 'bg-[#ff7759] text-black border-transparent shadow-sm'
                                : 'border-[#ff7759]/20 text-white/50 hover:border-[#ff7759]/40 hover:text-white/80 bg-[#ff7759]/5'
                            }`}
                          >
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reference Image Drag and Drop */}
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2.5">
                      Reference Image <span className="text-white/20 normal-case font-mono">(optional)</span>
                    </p>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) handleUpload(f) }}
                      onClick={() => fileRef.current?.click()}
                      className={`relative h-28 rounded-[22px] border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                        dragOver ? 'border-[#ff7759] bg-[#ff7759]/5' : uploadedPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 hover:border-white/20 bg-[#0a1210]'
                      }`}
                    >
                      {uploadedPreview ? (
                        <>
                          <img src={uploadedPreview} alt="" className="h-full w-full object-cover rounded-[20px] opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#eeece7] bg-black/80 px-3.5 py-1.5 rounded-full border border-white/10">✓ Uploaded</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center flex flex-col items-center gap-2">
                          <Paperclip className="w-5 h-5 text-white/20" />
                          <p className="text-[10px] uppercase font-mono tracking-widest text-white/30">Drop product image here</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) handleUpload(f) }} />
                  </div>

                  {/* Premium Quality Switch */}
                  <div className="flex items-center justify-between p-4 rounded-[8px] bg-[#0a1210] border border-white/5">
                    <div>
                      <p className="text-xs font-bold text-white">Premium Quality</p>
                      <p className="text-[10px] text-white/40 font-mono">Flux Pro · Absolute fidelity</p>
                    </div>
                    <button
                      onClick={() => setPremium(!premium)}
                      disabled={mode === 'video'}
                      className={`w-10 h-5 rounded-full transition-all relative ${premium && mode !== 'video' ? 'bg-[#ff7759]' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${premium && mode !== 'video' ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Price info / cost indicator */}
                  <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-4">
                    <span className="text-white/40">RESOURCE COST</span>
                    <span className="font-bold text-[#ff7759] flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{creditCost} credits</span>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">{error}</div>
                  )}

                  {/* Generate Button - Cohere button-primary: pure white pill shape */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 shadow-md relative overflow-hidden group"
                    style={{
                      background: loading ? '#2c2c35' : '#ffffff',
                      color: loading ? '#ffffff' : '#000000'
                    }}
                  >
                    {!loading && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating…
                      </span>
                    ) : (
                      <>✦ Generate {mode === 'video' ? 'Video' : 'Image'}</>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Panel: Previews and Outputs */}
              <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
                <div className="flex-1 flex flex-col gap-4 max-w-5xl mx-auto w-full">
                  {/* Signature Output Container with rounded-[22px] (Signature Radius) */}
                  <div className="flex-1 rounded-[22px] border border-white/5 bg-[#17171c] flex items-center justify-center min-h-[380px] lg:min-h-[460px] relative overflow-hidden shadow-inner">
                    {loading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#17171c]/90">
                        {/* Minimalist circular geometric indicator */}
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-2 border-[#ff7759]/20 animate-ping" />
                          <div className="absolute inset-1 rounded-full border-2 border-[#ff7759]/60 animate-spin" style={{ animationDuration: '1.2s' }} />
                          <div className="absolute inset-2.5 rounded-full border-2 border-[#ffad9b] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                          <div className="absolute inset-4.5 rounded-full bg-[#ff7759] animate-pulse" />
                        </div>
                        <p className="text-white/60 text-xs font-mono uppercase tracking-[0.15em] mt-2">AI Engine in Motion</p>
                        <div className="flex items-center gap-2 mt-2">
                          {(mode === 'video'
                            ? ['Enhance', 'Image', 'Video', 'Store']
                            : ['Enhance', 'Generate', 'Store']
                          ).map((step, i) => (
                            <div key={step} className="flex items-center gap-1.5 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7759] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                              <span className="text-[9px] text-white/30 uppercase tracking-widest">{step}</span>
                              {i < (mode === 'video' ? 3 : 2) && <span className="text-white/10 text-[9px] ml-1">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!loading && !result && (
                      <div className="text-center space-y-3 p-4">
                        <p className="text-4xl text-[#ff7759] opacity-40 font-light">✦</p>
                        <p className="text-white/30 text-xs font-mono uppercase tracking-widest">Your dynamic {mode} canvas</p>
                      </div>
                    )}

                    {result && !loading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-[#0c1815]">
                        {result.type === 'image' ? (
                          <img src={result.url} alt="Generated" className="w-full h-full object-contain rounded-[20px]" />
                        ) : (
                          <video src={result.url} controls autoPlay loop className="w-full h-full object-contain rounded-[20px]" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enhanced prompt reveal panel */}
                  {result && (
                    <div className="p-4 rounded-[12px] bg-[#17171c] border border-white/5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff7759] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />AI Enhanced Prompt
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed font-mono">{result.enhanced}</p>
                    </div>
                  )}

                  {/* Action buttons - Cohere button-secondary / outline style */}
                  {result && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <a
                        href={result.url}
                        download={`roomx-${result.type}-${Date.now()}.${result.type === 'video' ? 'mp4' : 'jpg'}`}
                        className="py-3 rounded-full border border-white/10 hover:border-white/35 bg-white/5 text-white text-xs font-mono uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-[#ff7759]" />Download
                      </a>
                      <button
                        onClick={handleGenerate}
                        className="py-3 rounded-full border border-white/10 hover:border-white/35 bg-white/5 text-[#ff7759] text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />Regenerate
                      </button>
                      {result.type === 'image' && (
                        <button
                          onClick={() => { setUploadedUrl(result.url); setUploadedPreview(result.url); setMode('video'); setActiveTab('create') }}
                          className="col-span-2 md:col-span-1 py-3 rounded-full border border-[#ff7759]/20 hover:border-[#ff7759]/40 bg-[#ff7759]/5 text-white text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          <Film className="w-3.5 h-3.5 text-[#ff7759]" />Animate to Video
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Generation History</h2>
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/20">
                  <p className="text-3xl mb-2">◷</p>
                  <p className="text-xs uppercase font-mono tracking-widest">No previous generations recorded</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map(job => (
                    <div key={job.id} className="rounded-[16px] border border-white/5 bg-[#17171c] overflow-hidden group hover:border-[#ff7759]/30 transition-all flex flex-col">
                      {job.result_url ? (
                        job.job_type === 'video'
                          ? <video src={job.result_url} className="w-full h-40 object-cover" muted />
                          : <img src={job.result_url} alt="" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-[#0a1210]">
                          <span className={`text-[9px] uppercase font-mono tracking-widest px-3 py-1 rounded-full ${
                            job.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            job.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-[#ff7759]/10 text-[#ff7759] border border-[#ff7759]/20 animate-pulse'
                          }`}>{job.status}</span>
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-white/70 line-clamp-2 font-mono mb-2">{job.prompt}</p>
                          <div className="flex items-center justify-between text-[9px] font-mono text-white/30 uppercase tracking-wider">
                            <span>{job.job_type} · {job.style}</span>
                            <span className="text-[#ff7759]">⚡ {job.credit_cost}</span>
                          </div>
                        </div>
                        {job.result_url && (
                          <a href={job.result_url} download className="mt-3 text-center text-[10px] font-mono uppercase tracking-widest py-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/5">
                            ↓ Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Credits Wallet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Credit balance detail */}
                <div className="space-y-6">
                  <div className="rounded-[22px] p-8 bg-gradient-to-br from-[#17171c] to-[#0a1210] border border-white/5 shadow-md">
                    <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em] mb-2">Available Balance</p>
                    <p className="text-5xl font-black text-[#ff7759] leading-none mb-1">{credits.toLocaleString()}</p>
                    <p className="text-white/20 text-xs font-mono uppercase tracking-widest mt-2">Studio Credits Ready</p>
                  </div>

                  <div className="rounded-[16px] border border-white/5 bg-[#17171c] p-6">
                    <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-4">Pricing Resource Allocation</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Basic Image (Flux Schnell)', cost: 20, Icon: ImageIcon },
                        { label: 'Premium Image (Flux Pro)', cost: 50, Icon: Sparkles },
                        { label: 'AI Video (Luma Dream Machine)', cost: 250, Icon: VideoIcon },
                        { label: 'Refine / Variation', cost: 5, Icon: RefreshCw },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 font-mono text-xs">
                          <span className="text-white/60 flex items-center gap-2"><item.Icon className="w-3.5 h-3.5 text-[#ff7759]" />{item.label}</span>
                          <span className="font-bold text-white flex items-center gap-1">⚡ {item.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Purchase packs */}
                <div className="rounded-[16px] border border-white/5 bg-[#17171c] p-6 space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Secure Credit Purchase</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { credits: 1000, price: '$4.99' },
                      { credits: 3000, price: '$12.99', badge: 'Popular' },
                      { credits: 7000, price: '$24.99' },
                      { credits: 20000, price: '$59.99', badge: 'Best Value' },
                    ].map(pkg => (
                      <button key={pkg.credits} className="relative p-4 rounded-[12px] border border-white/5 hover:border-[#ff7759]/40 bg-[#0a1210] hover:bg-[#ff7759]/5 transition-all text-left group">
                        {pkg.badge && (
                          <span className="absolute top-2 right-2 text-[8px] font-mono font-bold uppercase bg-[#ff7759] text-black px-1.5 py-0.5 rounded-full">{pkg.badge}</span>
                        )}
                        <p className="text-lg font-black text-[#ff7759]">⚡ {pkg.credits.toLocaleString()}</p>
                        <p className="text-xl font-bold text-white mt-1">{pkg.price}</p>
                        <p className="text-[10px] text-white/30 font-mono mt-1 uppercase">credits</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/20 text-center mt-4 font-mono">Payment processed securely via Stripe. Connect key credentials in .env.local</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
