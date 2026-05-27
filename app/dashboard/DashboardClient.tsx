'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  BarChart3,
  Settings,
  Plus,
  ArrowUpRight,
  Play,
  Activity,
  Layers,
  Zap,
  Trash2,
  Loader2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Video,
  Sparkles,
  Save,
  Lock,
  Globe,
} from 'lucide-react'

/* ─── CONFIG MODAL ─────────────────────────────────────────── */

const RoomConfigModal = ({ room, isOpen, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    title: room.title,
    description: room.description || '',
    price: room.subscription_price_id?.split(':')[0] || '0',
    isPublic: room.is_public ?? false,
    aiEnabled: true,
    broadcast4k: true,
  })
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          is_public: formData.isPublic,
        }),
      })
      if (!res.ok) throw new Error('Update failed')
      onUpdate(room.id, formData)
      onClose()
    } catch {
      alert('Failed to update sanctuary settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[#0d2a21]/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full sm:max-w-5xl bg-[#f5f6f2] sm:rounded-[3rem] rounded-t-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-400 max-h-[92vh] overflow-y-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr]">

          {/* LEFT */}
          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold font-nanum text-[#0d2a21] tracking-tight">Sanctuary Config</h2>
              <button onClick={onClose} className="p-2.5 bg-white rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] block">Room Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white px-5 py-4 rounded-2xl font-bold text-xl border border-black/5 outline-none focus:border-[#10b981] transition-all text-black"
              />
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-white px-5 py-4 rounded-2xl text-base border border-black/5 outline-none focus:border-[#10b981] transition-all text-black resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ToggleCard active={formData.aiEnabled} onClick={() => setFormData({ ...formData, aiEnabled: !formData.aiEnabled })} icon={<Sparkles className="w-4 h-4" />} label="AI Summaries" />
              <ToggleCard active={formData.broadcast4k} onClick={() => setFormData({ ...formData, broadcast4k: !formData.broadcast4k })} icon={<Video className="w-4 h-4" />} label="4K Broadcast" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-[#0d2a21] p-6 sm:p-10 text-white space-y-6 flex flex-col">
            <div className="space-y-4 flex-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Visibility</label>
              <div className="flex gap-3">
                <button onClick={() => setFormData({ ...formData, isPublic: true })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-1.5 ${formData.isPublic ? 'bg-white text-[#0d2a21] border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}>
                  <Eye className="w-4 h-4" /> Public
                </button>
                <button onClick={() => setFormData({ ...formData, isPublic: false })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex flex-col items-center gap-1.5 ${!formData.isPublic ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}>
                  <EyeOff className="w-4 h-4" /> Private
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Monthly Fee (TZS)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-3xl font-black font-nanum text-white outline-none focus:border-[#10b981] transition-all"
                />
                <p className="text-[10px] text-white/30 italic">Creators keep 100% of revenue.</p>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 bg-[#10b981] text-[#0d2a21] rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#059669] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ToggleCard = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick}
    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${active ? 'bg-white border-[#10b981] shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}>
    <div className={`p-1.5 rounded-lg ${active ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-gray-100 text-gray-400'}`}>{icon}</div>
    <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-[#0d2a21]' : 'text-[#0d2a21]/30'}`}>{label}</span>
  </button>
)

/* ─── ROOM CARD ─────────────────────────────────────────────── */

function RoomCard({ room, onDelete, onConfig, deletingId }: {
  room: any
  onDelete: (id: string, title: string) => void
  onConfig: (room: any) => void
  deletingId: string | null
}) {
  const price = room.subscription_price_id ? Number(room.subscription_price_id.split(':')[0]) : 0
  const isDeleting = deletingId === room.id

  return (
    <div className={`bg-[#0d2a21] rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl transition-opacity ${isDeleting ? 'opacity-40' : ''}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-2 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 rounded-full text-[9px] font-black text-[#0d2a21] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-[#0d2a21] rounded-full animate-pulse" />
              {room.is_public ? 'Public' : 'Private'}
            </span>
            {price > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                <Lock className="w-2.5 h-2.5" />
                {price.toLocaleString()} TZS/mo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-bold text-white/70 hidden sm:block">
              {room.members?.length || 0} members
            </span>
            <button
              onClick={() => onDelete(room.id, room.title)}
              disabled={isDeleting}
              className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── Title & description ── */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-nanum leading-tight mb-2 tracking-tight">
          {room.title}
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-2">
          {room.description || 'Your private sanctuary. Manage subscribers and broadcast live.'}
        </p>

        {/* ── Members on mobile ── */}
        <p className="text-white/40 text-xs font-bold mb-5 sm:hidden">
          {room.members?.length || 0} members
        </p>

        {/* ── Action buttons ── */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          <Link href={`/room/${room.id}`} className="col-span-2 sm:col-auto">
            <button className="w-full sm:w-auto px-5 py-3 bg-[#10b981] text-[#0d2a21] rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#059669] transition-all">
              <Play className="w-4 h-4 fill-current" />
              Enter Studio
            </button>
          </Link>
          <Link href={`/room/${room.id}/materials`}>
            <button className="w-full sm:w-auto px-4 py-3 border border-white/20 rounded-full font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden xs:inline">Materials</span>
              <span className="xs:hidden">Files</span>
            </button>
          </Link>
          <button
            onClick={() => onConfig(room)}
            className="w-full sm:w-auto px-4 py-3 border border-white/20 rounded-full font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden xs:inline">Config</span>
            <span className="xs:hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN DASHBOARD CLIENT ─────────────────────────────────── */

interface DashboardClientProps {
  dbUser: any
  rooms: any[]
  subscriptions: any[]
}

export default function DashboardClient({ dbUser, rooms, subscriptions }: DashboardClientProps) {
  const [localRooms, setLocalRooms] = useState(rooms)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [configRoom, setConfigRoom] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const roomsPerPage = 3
  const totalPages = Math.ceil(localRooms.length / roomsPerPage)
  const currentRooms = localRooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage)
  const totalMembers = localRooms.reduce((acc: number, r: any) => acc + (r.members?.length || 0), 0)

  const handleUpdateRoom = (roomId: string, newData: any) => {
    setLocalRooms(localRooms.map((r: any) =>
      r.id === roomId ? { ...r, title: newData.title, description: newData.description, is_public: newData.isPublic, subscription_price_id: `${newData.price}:TZS` } : r
    ))
  }

  const handleDeleteRoom = async (roomId: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return
    setDeletingId(roomId)
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setLocalRooms(localRooms.filter((r: any) => r.id !== roomId))
      if (currentRooms.length === 1 && currentPage > 1) setCurrentPage(p => p - 1)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deletion failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pb-24 pt-20 sm:pt-24">

      {configRoom && (
        <RoomConfigModal room={configRoom} isOpen={!!configRoom} onClose={() => setConfigRoom(null)} onUpdate={handleUpdateRoom} />
      )}

      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0d2a21] leading-tight tracking-tighter font-nanum">
              Creator Control Center
            </h1>
            <p className="text-[#0d2a21]/50 text-sm mt-1">
              Welcome back, <span className="font-bold text-[#0d2a21]/70">{dbUser?.name || 'Explorer'}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link href="/profile" className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#0d2a21]/10 rounded-full text-sm font-bold text-[#0d2a21] hover:bg-white/80 transition-all flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </Link>
            <Link href="/dashboard/room/create" className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto px-4 py-2.5 bg-[#0d2a21] text-white rounded-full text-sm font-bold hover:bg-[#184638] transition-all flex items-center justify-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                <span>New Room</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <StatCard icon={<Users className="w-5 h-5 text-blue-500" />} label="Members" value={totalMembers.toString()} trend="+12%" />
          <StatCard icon={<BarChart3 className="w-5 h-5 text-emerald-500" />} label="Revenue" value="TZS 14.2K" trend="+8%" />
          <StatCard icon={<Activity className="w-5 h-5 text-orange-500" />} label="Engagement" value="94%" trend="+2%" />
          <StatCard icon={<Layers className="w-5 h-5 text-purple-500" />} label="Rooms" value={localRooms.length.toString()} trend="" />
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8">

          {/* Left: rooms */}
          <div className="space-y-4 sm:space-y-6 min-w-0">
            {localRooms.length > 0 ? (
              <>
                {currentRooms.map((room: any) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onDelete={handleDeleteRoom}
                    onConfig={setConfigRoom}
                    deletingId={deletingId}
                  />
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full bg-white border border-[#0d2a21]/10 flex items-center justify-center disabled:opacity-30 hover:bg-[#0d2a21] hover:text-white transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-full text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#0d2a21] text-white' : 'bg-white text-[#0d2a21]/40 border border-[#0d2a21]/5'}`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full bg-white border border-[#0d2a21]/10 flex items-center justify-center disabled:opacity-30 hover:bg-[#0d2a21] hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/50 rounded-2xl sm:rounded-[2.5rem] p-10 sm:p-16 border-2 border-dashed border-[#0d2a21]/10 text-center">
                <div className="w-16 h-16 bg-[#0d2a21]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-8 h-8 text-[#0d2a21]/30" />
                </div>
                <h2 className="text-2xl font-bold text-[#0d2a21] mb-3 font-nanum">No rooms yet</h2>
                <p className="text-[#0d2a21]/50 text-sm mb-6 max-w-xs mx-auto">Launch your first private room and start your monetization era.</p>
                <Link href="/dashboard/room/create">
                  <button className="px-8 py-3 bg-[#0d2a21] text-white rounded-full font-bold text-sm hover:bg-[#184638] transition-all shadow-lg">
                    Launch Room
                  </button>
                </Link>
              </div>
            )}

            {/* Subscriptions */}
            {subscriptions && subscriptions.length > 0 && (
              <div className="bg-white/60 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-white/60">
                <h3 className="text-xl font-bold text-[#0d2a21] font-nanum mb-5 flex items-center gap-2">
                  Your Access Passes
                  <span className="text-xs font-sans font-bold text-[#0d2a21]/30 bg-[#0d2a21]/5 px-2.5 py-1 rounded-full">{subscriptions.length}</span>
                </h3>
                <div className="space-y-3">
                  {subscriptions.map((sub: any) => (
                    <div key={sub.id} className="bg-white rounded-2xl p-4 border border-[#0d2a21]/5 flex items-center justify-between gap-3 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center text-[#0d2a21]/40 font-bold shrink-0">
                          R
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0d2a21] text-sm truncate">{(sub.rooms as any).title}</p>
                          <p className="text-xs text-[#0d2a21]/40 truncate">{(sub.rooms as any).description}</p>
                        </div>
                      </div>
                      <Link href={`/room/${(sub.rooms as any).id}`} className="shrink-0">
                        <button className="w-9 h-9 rounded-full bg-[#f5f6f2] flex items-center justify-center hover:bg-[#0d2a21] hover:text-white transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar widgets */}
          <div className="space-y-4 sm:space-y-6">

            {/* Audience growth chart */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-[#0d2a21]/5 shadow-sm">
              <h3 className="text-base font-bold text-[#0d2a21] font-nanum mb-6">Audience Growth</h3>
              <div className="h-36 flex items-end gap-2">
                {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${h}%`, backgroundColor: [2, 5].includes(i) ? '#10b981' : '#f0f1ec' }} />
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[10px] font-black text-[#0d2a21]/25 uppercase tracking-widest">
                <span>Mon</span><span>Sun</span>
              </div>
            </div>

            {/* Scale faster */}
            <div className="bg-[#0d2a21] p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] text-white shadow-xl">
              <Zap className="w-8 h-8 text-[#10b981] mb-4" />
              <h3 className="text-xl font-bold font-nanum mb-3">Scale Faster.</h3>
              <p className="text-white/40 text-xs mb-6 leading-relaxed">
                Integrate your rooms with Adroom to discover high-value experts and participants automatically.
              </p>
              <button className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Boost Recruitment
              </button>
            </div>

            {/* Quick links */}
            <div className="bg-white p-5 rounded-2xl border border-[#0d2a21]/5 shadow-sm grid grid-cols-2 gap-2">
              <Link href="/rooms">
                <button className="w-full py-3 bg-[#f5f6f2] rounded-xl text-xs font-bold text-[#0d2a21] flex items-center justify-center gap-2 hover:bg-[#0d2a21] hover:text-white transition-all">
                  <Globe className="w-4 h-4" /> Browse
                </button>
              </Link>
              <Link href="/dashboard/room/create">
                <button className="w-full py-3 bg-[#f5f6f2] rounded-xl text-xs font-bold text-[#0d2a21] flex items-center justify-center gap-2 hover:bg-[#0d2a21] hover:text-white transition-all">
                  <Plus className="w-4 h-4" /> New Room
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#0d2a21]/5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#0d2a21]/5 flex items-center justify-center">{icon}</div>
        {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <p className="text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-[#0d2a21] tracking-tighter">{value}</h4>
    </div>
  )
}
