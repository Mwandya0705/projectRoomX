'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X, Share2, Mail, Link as LinkIcon, Send, Loader2 } from 'lucide-react'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
}

export default function InviteModal({ isOpen, onClose, roomId, roomTitle }: InviteModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Use window.location.origin to get the base URL
  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/room/${roomId}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsInviting(true)
    setInviteStatus(null)

    try {
      const response = await fetch('/api/rooms/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setInviteStatus({ type: 'success', message: `Invitation sent to ${email}!` })
        setEmail('')
      } else {
        setInviteStatus({ type: 'error', message: data.error || 'Failed to send invitation.' })
      }
    } catch (err) {
      setInviteStatus({ type: 'error', message: 'An unexpected error occurred.' })
    } finally {
      setIsInviting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomTitle} on RoomX`,
          text: `Join my live room: ${roomTitle}`,
          url: inviteLink,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,1)] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Invite Guests</h2>
                  <p className="text-zinc-400 text-sm">Expand your circle in {roomTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-all hover:rotate-90 hover:scale-110"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Email Invite Form */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    Direct Email Invite
                  </label>
                  <form onSubmit={handleEmailInvite} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="guest@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isInviting}
                      className="bg-white text-black px-6 rounded-2xl font-bold transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
                    >
                      {isInviting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </form>
                  {inviteStatus && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border ${
                        inviteStatus.type === 'success' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {inviteStatus.message}
                    </motion.p>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Link Input Section */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    Copy Magic Link
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        readOnly
                        value={inviteLink}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-zinc-400 text-sm font-mono truncate"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-indigo-400 transition-colors">
                        <LinkIcon size={16} />
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center justify-center min-w-[110px] gap-2 rounded-2xl px-4 py-4 font-bold transition-all shadow-xl active:scale-95 ${
                        copied 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 shadow-black/80'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={18} />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Share Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-2xl py-4 text-sm font-bold transition-all border border-indigo-500/20 active:scale-95"
                  >
                    <Share2 size={18} />
                    <span>Direct Share</span>
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=Join ${roomTitle}&body=${inviteLink}`)}
                    className="flex items-center justify-center gap-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-2xl py-4 text-sm font-bold transition-all border border-indigo-500/20 active:scale-95"
                  >
                    <Mail size={18} />
                    <span>Mail Client</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer decoration */}
            <div className="h-1.5 bg-gradient-to-r from-transparent via-indigo-600 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
