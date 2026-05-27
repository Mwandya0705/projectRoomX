'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  Chat,
  ParticipantTile,
  GridLayout,
  useTracks,
  useParticipants,
  useRoomContext,
  TrackToggle,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  MessageSquare,
  Video,
  Mic,
  LogOut,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Radio,
  Download,
  FileText,
  Brain,
  Loader2,
  CheckCircle,
  Sparkles,
  X,
  LayoutGrid,
} from 'lucide-react'
import type { Room, User } from '@/lib/types/database'
import InviteModal from './InviteModal'

/* ─── INTELLIGENCE HOOK ─────────────────────────────────────── */

function useMeetingIntelligence(roomId: string, roomTitle: string) {
  const [isRecording, setIsRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ transcript: string; summary: string } | null>(null)
  const [exported, setExported] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async (stream: MediaStream) => {
    chunksRef.current = []
    const recorder = new MediaRecorder(stream)
    recorder.ondataavailable = e => chunksRef.current.push(e.data)
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      await processMeeting(blob)
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const processMeeting = async (blob: Blob) => {
    setProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob)
      formData.append('roomId', roomId)
      const res = await fetch('/api/meetings/process', { method: 'POST', body: formData })
      setResult(await res.json())
    } catch (e) {
      console.error('Intelligence processing failed:', e)
    } finally {
      setProcessing(false)
    }
  }

  const handleExport = () => {
    if (!result) return
    const content = `ROOMX INTELLIGENCE REPORT\nSanctuary: ${roomTitle}\nDate: ${new Date().toLocaleString()}\n\nSUMMARY:\n${result.summary}\n\nTRANSCRIPT:\n${result.transcript}`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${roomTitle.replace(/\s+/g, '_')}_Intel.txt`
    a.click()
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return { isRecording, startRecording, stopRecording, processing, result, handleExport, exported }
}

/* ─── PARTICIPANT LIST ──────────────────────────────────────── */

function ParticipantList() {
  const participants = useParticipants()
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-zinc-500 text-xs font-bold uppercase tracking-widest">
          <Users className="w-8 h-8 mb-2 opacity-30" />
          No participants yet
        </div>
      ) : (
        participants.map(p => (
          <div key={p.identity} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(p.name || p.identity || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{p.name || p.identity}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{p.isLocal ? 'You' : 'Participant'}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

/* ─── MAIN LIVE ROOM ────────────────────────────────────────── */

type TabType = 'chat' | 'participants' | 'intel'

interface LiveRoomProps {
  roomId: string
  room: Room & { users: User }
  user: User
  isCreator: boolean
}

export default function LiveRoom({ roomId, room, user, isCreator }: LiveRoomProps) {
  const [token, setToken] = useState<string | undefined>()
  const [url, setUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)   // closed by default on mobile
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const intel = useMeetingIntelligence(roomId, room.title)

  // Open sidebar by default on large screens
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setSidebarOpen(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    fetch(`/api/rooms/${roomId}/access-token`)
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error)))
      .then(d => { setToken(d.token); setUrl(d.url) })
      .catch(e => setError(typeof e === 'string' ? e : 'Failed to connect'))
      .finally(() => setLoading(false))
  }, [roomId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-bold">Synchronizing Studio…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-4 px-6 text-center">
        <p className="text-red-400 font-bold">{error}</p>
        <Link href="/dashboard" className="px-6 py-3 bg-zinc-800 rounded-full text-sm font-bold hover:bg-zinc-700 transition-all">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const openTab = (tab: TabType) => {
    setActiveTab(tab)
    setSidebarOpen(true)
  }

  return (
    <LiveKitRoom
      video={isCreator}
      audio={isCreator}
      token={token}
      serverUrl={url}
      data-lk-theme="default"
      className="h-screen bg-zinc-950 overflow-hidden flex flex-col"
      onDisconnected={() => { window.location.href = '/dashboard' }}
    >
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} roomId={roomId} roomTitle={room.title} />
      <RoomAudioRenderer />

      {/* ── TOP HEADER ── */}
      <header className="shrink-0 z-40 px-3 sm:px-5 pt-3 sm:pt-4">
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/60 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shadow-xl">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-zinc-800 transition-all shrink-0">
              <ChevronLeft size={18} className="text-zinc-400" />
            </Link>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-white font-bold text-sm truncate font-nanum">{room.title}</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${intel.isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#10b981]'}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${intel.isRecording ? 'text-red-500' : 'text-[#10b981]'}`}>
                  {intel.isRecording ? 'Recording' : 'Live'}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isCreator && (
              <button
                onClick={() => intel.isRecording ? intel.stopRecording() : intel.startRecording(new MediaStream())}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${intel.isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
              >
                <Radio size={13} />
                <span className="hidden sm:inline">{intel.isRecording ? 'Stop' : 'Rec'}</span>
              </button>
            )}
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <UserPlus size={13} />
              <span className="hidden sm:inline">Invite</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Video area */}
        <main className="flex-1 relative flex flex-col p-2 sm:p-4 pb-16 sm:pb-4 overflow-hidden min-w-0">
          <div className="flex-1 bg-zinc-900/40 rounded-xl sm:rounded-[2rem] overflow-hidden border border-zinc-800/40 min-h-0">
            <CustomVideoConference />
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <RoomControls room={room} isCreator={isCreator} />
          </div>
        </main>

        {/* Desktop sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-40 w-5 h-16 items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-l-xl text-zinc-500 hover:text-zinc-200 border border-zinc-700/50 transition-all ${sidebarOpen ? 'right-80' : 'right-0'}`}
        >
          {sidebarOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute inset-y-0 right-0 lg:static lg:h-full w-[85vw] sm:w-80 lg:w-80 bg-zinc-950 border-l border-zinc-800/50 flex flex-col z-50 lg:z-20 shadow-2xl"
            >
              {/* Sidebar header */}
              <div className="shrink-0 p-3 pb-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex p-1 bg-zinc-900 rounded-xl gap-1">
                    {([['chat', MessageSquare, 'Chat'], ['participants', Users, 'People'], ['intel', Brain, 'Intel']] as const).map(([tab, Icon, label]) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as TabType)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Icon size={12} />
                        <span className="hidden xs:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-all shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Sidebar content */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {activeTab === 'chat' && (
                  <Chat className="flex-1 bg-transparent border-none text-white lk-chat" />
                )}
                {activeTab === 'participants' && <ParticipantList />}
                {activeTab === 'intel' && (
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {intel.processing ? (
                      <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                          <Brain className="w-5 h-5 text-indigo-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-white font-bold font-nanum">Synthesizing Intelligence…</p>
                      </div>
                    ) : intel.result ? (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Sparkles size={12} /> AI Summary
                          </div>
                          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-xs text-indigo-100 leading-relaxed">
                            {intel.result.summary}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                            <FileText size={12} /> Transcript
                          </div>
                          <div className="text-[11px] text-zinc-400 leading-relaxed font-mono p-4 bg-zinc-900 rounded-2xl border border-zinc-800 max-h-48 overflow-y-auto">
                            {intel.result.transcript}
                          </div>
                        </div>
                        <button
                          onClick={intel.handleExport}
                          className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${intel.exported ? 'bg-[#10b981] text-black' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                          {intel.exported ? <><CheckCircle size={14} /> Exported</> : <><Download size={14} /> Download Intel</>}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-center opacity-20">
                        <Radio className="w-10 h-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Standby</p>
                        <p className="text-[10px] max-w-[160px] leading-relaxed">Press Rec to begin meeting synthesis.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      <div className="sm:hidden shrink-0 z-40 px-3 pb-3 pt-1">
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-2 flex items-center justify-between gap-2 shadow-2xl">
          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {isCreator && (
              <>
                <TrackToggle source={Track.Source.Microphone}>
                  <div className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all active:scale-90">
                    <Mic size={16} />
                  </div>
                </TrackToggle>
                <TrackToggle source={Track.Source.Camera}>
                  <div className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all active:scale-90">
                    <Video size={16} />
                  </div>
                </TrackToggle>
              </>
            )}
          </div>

          {/* Centre nav */}
          <div className="flex items-center gap-1">
            {([['chat', MessageSquare], ['participants', Users], ['intel', Brain]] as const).map(([tab, Icon]) => (
              <button
                key={tab}
                onClick={() => openTab(tab as TabType)}
                className={`p-2.5 rounded-xl transition-all ${activeTab === tab && sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          {/* Leave */}
          <MobileLeaveButton room={room} isCreator={isCreator} />
        </div>
      </div>
    </LiveKitRoom>
  )
}

/* ─── VIDEO GRID ────────────────────────────────────────────── */

function CustomVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  return (
    <div className="h-full w-full relative">
      <GridLayout tracks={tracks} className="h-full lk-grid-layout !gap-2 sm:!gap-4 !p-0">
        <ParticipantTile className="!bg-zinc-900/50 !rounded-xl sm:!rounded-[2rem] !border-none !overflow-hidden shadow-xl" />
      </GridLayout>
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-xl pointer-events-none"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
          <div className="w-2 h-2 bg-red-500 rounded-full relative" />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Live</span>
      </motion.div>
    </div>
  )
}

/* ─── DESKTOP CONTROLS ──────────────────────────────────────── */

function RoomControls({ room, isCreator }: { room: Room; isCreator: boolean }) {
  const router = useRouter()
  const roomCtx = useRoomContext()

  const handleLeave = async () => {
    try { await (roomCtx as any)?.room?.disconnect() } catch {}
    router.push('/dashboard')
  }

  return (
    <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 shadow-2xl ring-1 ring-white/5">
      {isCreator && (
        <div className="flex items-center gap-2 px-1">
          <TrackToggle source={Track.Source.Microphone}>
            <div className="p-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all active:scale-90"><Mic size={18} /></div>
          </TrackToggle>
          <TrackToggle source={Track.Source.Camera}>
            <div className="p-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all active:scale-90"><Video size={18} /></div>
          </TrackToggle>
        </div>
      )}
      <div className="h-8 w-px bg-zinc-800 mx-1" />
      <button
        onClick={handleLeave}
        className="px-6 py-3.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        <LogOut size={16} />
        {isCreator ? 'End' : 'Leave'}
      </button>
    </div>
  )
}

/* ─── MOBILE LEAVE BUTTON ───────────────────────────────────── */

function MobileLeaveButton({ room, isCreator }: { room: Room; isCreator: boolean }) {
  const router = useRouter()
  const roomCtx = useRoomContext()

  const handleLeave = async () => {
    try { await (roomCtx as any)?.room?.disconnect() } catch {}
    router.push('/dashboard')
  }

  return (
    <button
      onClick={handleLeave}
      className="px-4 py-2.5 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
    >
      <LogOut size={14} />
      <span>{isCreator ? 'End' : 'Leave'}</span>
    </button>
  )
}
