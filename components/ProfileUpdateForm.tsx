'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileUpdateFormProps {
  currentUser: {
    id: string
    email: string
    name: string | null
    imageUrl: string | null
    clerkImageUrl: string | undefined
  }
}

export default function ProfileUpdateForm({ currentUser }: ProfileUpdateFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saveProgress, setSaveProgress] = useState(0)
  const [nameChanged, setNameChanged] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    imageUrl: currentUser.imageUrl || '',
  })

  // Sync state when props change (after router.refresh())
  useEffect(() => {
    setFormData({
      name: currentUser.name || '',
      imageUrl: currentUser.imageUrl || '',
    })
    setPreviewUrl(null)
  }, [currentUser.id, currentUser.name, currentUser.imageUrl])

  // Upload progress animation
  useEffect(() => {
    if (uploadingImage) {
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) { clearInterval(interval); return 85 }
          return prev + Math.random() * 15
        })
      }, 200)
      return () => clearInterval(interval)
    } else {
      if (uploadProgress > 0) setUploadProgress(100)
      const t = setTimeout(() => setUploadProgress(0), 800)
      return () => clearTimeout(t)
    }
  }, [uploadingImage])

  // Save progress animation
  useEffect(() => {
    if (loading) {
      setSaveProgress(0)
      const interval = setInterval(() => {
        setSaveProgress(prev => {
          if (prev >= 85) { clearInterval(interval); return 85 }
          return prev + Math.random() * 12
        })
      }, 150)
      return () => clearInterval(interval)
    } else {
      if (saveProgress > 0) {
        setSaveProgress(100)
        const t = setTimeout(() => setSaveProgress(0), 700)
        return () => clearTimeout(t)
      }
    }
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[ProfileForm] Submitting changes...', formData)
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim() || null,
          imageUrl: formData.imageUrl.trim() || null,
        }),
      })

      const data = await response.json()
      console.log('[ProfileForm] Response:', data)
      
      if (!response.ok) {
        let errMsg = 'Failed to update profile'
        if (data.error) {
          if (Array.isArray(data.error)) {
            errMsg = data.error.map((err: any) => err.message || JSON.stringify(err)).join(', ')
          } else if (typeof data.error === 'object') {
            errMsg = data.error.message || JSON.stringify(data.error)
          } else {
            errMsg = data.error
          }
        }
        throw new Error(errMsg)
      }

      setSuccess('Profile updated!')
      setNameChanged(false)
      setShowToast(true)
      
      // Refresh router immediately to sync UI
      router.refresh()
      
      setTimeout(() => {
        setShowToast(false)
        setSuccess('')
      }, 3000)
    } catch (error) {
      console.error('[ProfileForm] Submit error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const processFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max 5MB.')
      return
    }

    // Show local preview instantly
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setUploadingImage(true)
    setError('')
    setSuccess('')

    try {
      const fd = new FormData()
      fd.append('image', file)
      const response = await fetch('/api/upload/image', { method: 'POST', body: fd })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')

      setFormData(prev => ({ ...prev, imageUrl: data.url }))
      setPreviewUrl(data.url)
      setSuccess('Photo uploaded! Save your profile to apply.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image')
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const getImageUrl = () => previewUrl || formData.imageUrl || currentUser.imageUrl || currentUser.clerkImageUrl

  const initials = (currentUser.name || currentUser.email)
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* ── Success Toast ── */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#0d2a21] text-white rounded-2xl shadow-2xl shadow-black/30 transition-all duration-500 ${
          showToast
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-[#75f560] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#0d2a21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight">Profile saved successfully!</p>
          <p className="text-white/50 text-xs">Your changes are now live.</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowToast(false); setSuccess('') }}
          className="ml-2 text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Save Progress Bar ── */}
      <div className={`overflow-hidden rounded-full transition-all duration-300 ${saveProgress > 0 ? 'h-1.5 mb-2' : 'h-0'}`}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${saveProgress}%`,
            background: saveProgress === 100
              ? 'linear-gradient(90deg, #75f560, #4ade80)'
              : 'linear-gradient(90deg, #0d2a21, #75f560)',
          }}
        />
      </div>

      {/* ── Avatar Section ── */}
      <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-black/5">

        {/* Avatar with drag-drop overlay */}
        <div
          className={`relative group flex-shrink-0 cursor-pointer`}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploadingImage && fileInputRef.current?.click()}
        >
          {/* Avatar ring */}
          <div className={`w-28 h-28 rounded-full p-[3px] transition-all duration-300 ${
            isDragOver
              ? 'bg-gradient-to-br from-[#75f560] to-[#0d2a21] scale-105'
              : 'bg-gradient-to-br from-[#75f560]/60 to-[#0d2a21]/20 group-hover:from-[#75f560] group-hover:to-[#0d2a21]'
          }`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {getImageUrl() ? (
                <img
                  src={getImageUrl() || ''}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0d2a21] to-[#1a4a35] flex items-center justify-center text-white text-2xl font-bold font-nanum tracking-tight">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Upload overlay */}
          <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
            isDragOver
              ? 'bg-[#75f560]/30 opacity-100'
              : 'bg-black/50 opacity-0 group-hover:opacity-100'
          }`}>
            {uploadingImage ? (
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <>
                <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white text-[10px] font-semibold uppercase tracking-wider">
                  {isDragOver ? 'Drop' : 'Change'}
                </span>
              </>
            )}
          </div>

          {/* Upload progress ring */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <svg className="absolute inset-0 w-28 h-28 -rotate-90" viewBox="0 0 112 112">
              <circle
                cx="56" cy="56" r="53"
                fill="none" stroke="#75f560" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 53}`}
                strokeDashoffset={`${2 * Math.PI * 53 * (1 - uploadProgress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
          )}

          {/* Green check on complete */}
          {uploadProgress === 100 && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#75f560] rounded-full flex items-center justify-center shadow-md animate-bounce-once">
              <svg className="w-4 h-4 text-[#0d2a21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploadingImage}
          />
        </div>

        {/* Avatar info */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-[#0d2a21] font-nanum tracking-tight">
            {formData.name || 'Your Name'}
          </h3>
          <p className="text-[#0d2a21]/50 text-sm mt-1">{currentUser.email}</p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="text-xs font-semibold px-4 py-2 bg-[#0d2a21] text-white rounded-xl hover:bg-[#0d2a21]/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {uploadingImage ? 'Uploading…' : 'Upload Photo'}
            </button>
            {getImageUrl() && (
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setFormData(prev => ({ ...prev, imageUrl: '' })) }}
                className="text-xs font-semibold px-4 py-2 border border-black/10 text-[#0d2a21]/60 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 active:scale-95"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-[#0d2a21]/30 text-xs mt-3">Drop an image here, or click to browse · JPEG, PNG, WebP · max 5MB</p>
        </div>
      </div>

      {/* ── Form Fields ── */}
      <div className="space-y-5">
        {/* Display Name */}
        <div className="group">
          <label htmlFor="name" className="block text-xs font-semibold text-[#0d2a21]/50 uppercase tracking-widest mb-2">
            Display Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }))
                setNameChanged(e.target.value !== (currentUser.name || ''))
              }}
              className="w-full pl-4 pr-10 py-3.5 border border-black/10 rounded-2xl bg-[#f5f6f2] focus:bg-white focus:border-[#0d2a21]/30 focus:ring-4 focus:ring-[#75f560]/20 outline-none transition-all duration-200 text-[#0d2a21] font-medium placeholder:text-[#0d2a21]/30"
              placeholder="Your full name"
            />
            {nameChanged && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#75f560] animate-pulse" />
            )}
          </div>
          <p className="mt-1.5 text-xs text-[#0d2a21]/40 ml-1">Displayed to others in rooms and on your profile.</p>
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#0d2a21]/50 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={currentUser.email}
              disabled
              className="w-full pl-4 pr-10 py-3.5 border border-black/5 rounded-2xl bg-[#f5f6f2]/50 text-[#0d2a21]/40 font-medium cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-[#0d2a21]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[#0d2a21]/40 ml-1">Managed by Supabase Auth. Cannot be changed here.</p>
        </div>

        {/* Image URL (collapsible advanced) */}
        <details className="group/details">
          <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-semibold text-[#0d2a21]/40 uppercase tracking-widest hover:text-[#0d2a21]/60 transition-colors select-none">
            <svg className="w-3.5 h-3.5 transition-transform group-open/details:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced · Image URL
          </summary>
          <div className="mt-3">
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                setPreviewUrl(null)
              }}
              className="w-full pl-4 pr-4 py-3.5 border border-black/10 rounded-2xl bg-[#f5f6f2] focus:bg-white focus:border-[#0d2a21]/30 focus:ring-4 focus:ring-[#75f560]/20 outline-none transition-all duration-200 text-[#0d2a21] font-medium placeholder:text-[#0d2a21]/30 text-sm"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="mt-1.5 text-xs text-[#0d2a21]/40 ml-1">Paste a direct image URL instead of uploading a file.</p>
          </div>
        </details>
      </div>

      {/* ── Status Messages ── */}
      <div className="min-h-[40px]">
        {error && (
          <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl animate-slide-up">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        {success && !error && (
          <div className="flex items-center gap-3 p-3.5 bg-[#75f560]/10 border border-[#75f560]/30 rounded-2xl animate-slide-up">
            <div className="w-7 h-7 rounded-full bg-[#75f560]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#0d2a21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#0d2a21] text-sm font-semibold">{success}</p>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="relative flex-1 sm:flex-none sm:min-w-[160px] flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#0d2a21] text-white font-semibold rounded-2xl hover:bg-[#0d2a21]/85 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.97] overflow-hidden group"
        >
          {/* Shimmer effect while loading */}
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          )}
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            console.log('[ProfileForm] Cancelling changes, returning to dashboard...')
            router.push('/dashboard')
          }}
          className="flex-1 sm:flex-none px-6 py-3.5 border border-black/10 text-[#0d2a21]/60 font-semibold rounded-2xl hover:bg-[#0d2a21]/5 hover:text-[#0d2a21] transition-all duration-200 active:scale-[0.97]"
        >
          Cancel
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        .animate-slide-up { animation: slide-up 0.2s ease-out; }
        .animate-shimmer  { animation: shimmer 1.2s infinite; }
      `}</style>
    </form>
    </>
  )
}
