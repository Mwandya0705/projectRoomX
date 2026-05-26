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
  Shield,
  Eye,
  EyeOff,
  Video,
  Sparkles,
  Save
} from 'lucide-react'

/* ------------------ MODAL COMPONENT ------------------ */

const RoomConfigModal = ({ room, isOpen, onClose, onUpdate }: any) => {
  const [formData, setFormData] = useState({
    title: room.title,
    description: room.description || '',
    price: room.subscription_price_id?.split(':')[0] || '0',
    isPublic: room.is_public ?? false,
    aiEnabled: true,
    broadcast4k: true
  })
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call to update room
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          is_public: formData.isPublic
        })
      })
      if (!response.ok) throw new Error('Update failed')
      onUpdate(room.id, formData)
      onClose()
    } catch (err) {
      alert('Failed to update sanctuary settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
      {/* 🎬 Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-[#0d2a21]/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* 🎭 Modal Content */}
      <div className="relative w-full max-w-5xl bg-[#f5f6f2] rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto lg:overflow-hidden">
        <div className="grid lg:grid-cols-[1.5fr_1fr]">
          
          {/* LEFT: SETTINGS FORM */}
          <div className="p-6 md:p-10 lg:p-14 space-y-8 md:space-y-10 lg:max-h-[85vh] lg:overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold font-nanum text-[#0d2a21] tracking-tight leading-none">Sanctuary <br/>Configuration</h2>
              <button onClick={onClose} className="p-3 bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Identity Section */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-[#0d2a21]/40 uppercase tracking-[0.2em] block">Identity</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white px-8 py-5 rounded-2xl font-bold font-nanum text-2xl border border-black/5 outline-none focus:border-[#10b981] transition-all text-black"
                />
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-white px-8 py-5 rounded-2xl font-medium text-lg border border-black/5 outline-none focus:border-[#10b981] transition-all text-black resize-none"
                />
              </div>

              {/* Advanced Toggles Section */}
              <div className="grid md:grid-cols-2 gap-4">
                <ToggleCard 
                  active={formData.aiEnabled} 
                  onClick={() => setFormData({...formData, aiEnabled: !formData.aiEnabled})}
                  icon={<Sparkles className="w-4 h-4" />}
                  label="AI Summaries"
                />
                <ToggleCard 
                  active={formData.broadcast4k} 
                  onClick={() => setFormData({...formData, broadcast4k: !formData.broadcast4k})}
                  icon={<Video className="w-4 h-4" />}
                  label="4K Broadcast"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: MONETIZATION & ACTION */}
          <div className="bg-[#0d2a21] p-6 md:p-10 lg:p-14 text-white space-y-8 md:space-y-10 flex flex-col lg:max-h-[85vh] lg:overflow-y-auto">
            <div className="space-y-8 flex-1">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Monetization Engine</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFormData({...formData, isPublic: true})}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.isPublic ? 'bg-white text-[#0d2a21] border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}
                  >
                    <Eye className="w-4 h-4 mx-auto mb-2" />
                    Public
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, isPublic: false})}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${!formData.isPublic ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}
                  >
                    <EyeOff className="w-4 h-4 mx-auto mb-2" />
                    Private
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Monthly Access Fee (TZS)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-8 py-6 rounded-3xl text-4xl font-black font-nanum text-white outline-none focus:border-[#10b981] transition-all"
                />
                <p className="text-[10px] text-white/30 font-medium italic">Creators keeping 100% of revenue in the RoomX Era.</p>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 sm:py-4.5 bg-[#10b981] text-[#0d2a21] rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#059669] transition-all shadow-2xl active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Commit Changes</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

const ToggleCard = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${active ? 'bg-white border-[#10b981] shadow-md' : 'bg-white/50 border-transparent hover:bg-white'}`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-[#10b981] text-[#0d2a21]' : 'bg-gray-100 text-gray-400'}`}>{icon}</div>
    <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-[#0d2a21]' : 'text-[#0d2a21]/30'}`}>{label}</span>
  </button>
)

/* ------------------ MAIN CLIENT ------------------ */

interface DashboardClientProps {
  dbUser: any
  rooms: any[]
  subscriptions: any[]
}

export default function DashboardClient({ 
  dbUser, 
  rooms, 
  subscriptions,
}: DashboardClientProps) {
  
  const [localRooms, setLocalRooms] = useState(rooms)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // 🎢 Modal State
  const [configRoom, setConfigRoom] = useState<any>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const roomsPerPage = 2
  const indexOfLastRoom = currentPage * roomsPerPage
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
  const currentRooms = localRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  const totalPages = Math.ceil(localRooms.length / roomsPerPage)

  const totalMembers = localRooms.reduce((acc: number, room: any) => acc + (room.members?.length || 0), 0)

  const handleUpdateRoom = (roomId: string, newData: any) => {
    setLocalRooms(localRooms.map((r: any) => 
      r.id === roomId ? { 
        ...r, 
        title: newData.title, 
        description: newData.description, 
        is_public: newData.isPublic,
        subscription_price_id: `${newData.price}:TZS`
      } : r
    ))
  }

  const handleDeleteRoom = async (roomId: string, title: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(roomId)
    try {
      const response = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete room')
      }
      setLocalRooms(localRooms.filter((r: any) => r.id !== roomId))
      if (currentRooms.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Deletion failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans pb-24 pt-24">
      
      {/* 🎬 Configuration Modal Overlay */}
      {configRoom && (
        <RoomConfigModal 
          room={configRoom} 
          isOpen={!!configRoom} 
          onClose={() => setConfigRoom(null)} 
          onUpdate={handleUpdateRoom}
        />
      )}

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 3xl:px-24 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-6">
          <div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-[#0d2a21] leading-[1.05] tracking-tighter font-nanum mb-3">
              Creator Control Center
            </h1>
            <p className="text-[#0d2a21]/60 font-medium">Welcome back, {dbUser?.name || 'Explorer'}. Your monetization era is in full swing.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-6 py-3 bg-white border border-[#0d2a21]/10 rounded-full text-sm font-bold text-[#0d2a21] hover:bg-white/80 transition-all shadow-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
             </button>
             <Link href="/dashboard/room/create">
                <button className="px-6 py-3 bg-[#0d2a21] text-white rounded-full text-sm font-bold hover:bg-[#184638] transition-all shadow-lg flex items-center gap-2">
                   <Plus className="w-4 h-4" />
                   <span>New Room</span>
                </button>
             </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <StatCard icon={<Users className="text-blue-600" />} label="Total Members" value={totalMembers.toString()} trend="+12%" />
           <StatCard icon={<BarChart3 className="text-emerald-600" />} label="Monthly Rev" value="$14,240" trend="+8.4%" />
           <StatCard icon={<Activity className="text-orange-600" />} label="Engagement" value="94%" trend="+2.1%" />
           <StatCard icon={<Layers className="text-purple-600" />} label="Active Rooms" value={localRooms.length.toString()} trend="0%" />
        </div>

        <div className="grid lg:grid-cols-[2.2fr_1.2fr] gap-6 lg:gap-10 3xl:gap-16">
           
           <div className="space-y-8 lg:space-y-10">
              {localRooms.length > 0 ? (
                <>
                  {currentRooms.map((room: any) => (
                    <div key={room.id} className={`bg-[#0d2a21] rounded-[2rem] md:rounded-[3.5rem] p-8 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl group mb-8 last:mb-0 transition-opacity ${deletingId === room.id ? 'opacity-50 grayscale' : ''}`}>
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
                       
                       <div className="relative z-10">
                          <div className="flex items-center justify-between gap-3 mb-8">
                             <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black text-[#0d2a21] uppercase tracking-widest flex items-center gap-2">
                                   <span className="w-2 h-2 bg-[#0d2a21] rounded-full animate-pulse" />
                                   {room.is_public ? 'PUBLIC ACCESS' : 'PRIVATE SANCTUARY'}
                                </div>
                                {room.subscription_price_id && (
                                  <div className="px-3 py-1 bg-blue-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                    {room.subscription_price_id.split(':')[0]} TZS / Month
                                  </div>
                                )}
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                                   {room.members?.length || 0} Members
                                </div>
                                <button 
                                  onClick={() => handleDeleteRoom(room.id, room.title)}
                                  disabled={deletingId === room.id}
                                  className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                                  title="Delete Sanctuary"
                                >
                                  {deletingId === room.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                             </div>
                          </div>

                          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold font-nanum leading-none mb-6 tracking-tight">
                             {room.title}
                          </h2>
                          <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-10 max-w-xl font-satoshi">
                             {room.description || "Your private sanctuary for high-value expertise. Manage your subscribers and broadcast in 4K clarity."}
                          </p>

                          <div className="flex flex-wrap gap-4">
                             <Link href={`/room/${room.id}`}>
                                <button className="px-10 py-3 sm:py-4 bg-[#10b981] text-[#0d2a21] rounded-full font-bold flex items-center gap-3 hover:bg-[#059669] transition-all group/btn">
                                   <Play className="w-5 h-5 fill-current group-hover/btn:scale-125 transition-transform" />
                                   <span>Enter Studio</span>
                                </button>
                             </Link>
                             <Link href={`/room/${room.id}/materials`}>
                                <button className="px-8 py-3 sm:py-4 border border-white/20 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                                   <FolderOpen className="w-5 h-5" />
                                   <span>Materials</span>
                                </button>
                             </Link>
                             {/* 🎬 Configuration Popup Trigger */}
                             <button 
                                onClick={() => setConfigRoom(room)}
                                className="px-8 py-3 sm:py-4 border border-white/20 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                             >
                                <Settings className="w-5 h-5" />
                                <span>Configuration</span>
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-12 h-12 rounded-full bg-white border border-[#0d2a21]/10 flex items-center justify-center disabled:opacity-30 transition-all hover:bg-[#0d2a21] hover:text-white shadow-sm"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-full text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#0d2a21] text-white' : 'bg-white text-[#0d2a21]/40 border border-[#0d2a21]/5'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-12 h-12 rounded-full bg-white border border-[#0d2a21]/10 flex items-center justify-center disabled:opacity-30 transition-all hover:bg-[#0d2a21] hover:text-white shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] p-16 border border-white/60 text-center border-dashed">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Plus className="w-10 h-10 text-gray-400" />
                   </div>
                   <h2 className="text-3xl font-bold text-[#0d2a21] mb-4 font-nanum">No Active Rooms</h2>
                   <p className="text-[#0d2a21]/60 mb-8 max-w-sm mx-auto">Launch your first private room to start building your monetization era.</p>
                   <Link href="/dashboard/room/create">
                      <button className="px-10 py-3 sm:py-3.5 bg-[#0d2a21] text-white rounded-full font-bold shadow-lg">Launch Engine</button>
                   </Link>
                </div>
              )}

              {subscriptions && subscriptions.length > 0 && (
                <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] p-10 lg:p-14 border border-white/60 shadow-sm">
                   <h3 className="text-3xl font-bold text-[#0d2a21] font-nanum mb-8 flex items-center gap-3">
                      Your Access Passes
                      <span className="text-sm font-sans font-bold text-[#0d2a21]/30 bg-[#0d2a21]/5 px-3 py-1 rounded-full uppercase tracking-widest">{subscriptions.length}</span>
                   </h3>
                   <div className="space-y-4">
                      {subscriptions.map((sub: any) => (
                        <div key={sub.id} className="group bg-white p-6 rounded-[2rem] border border-[#0d2a21]/5 flex items-center justify-between hover:shadow-xl transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold italic overflow-hidden">
                                 <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center">R</div>
                              </div>
                              <div>
                                 <h4 className="text-xl font-bold text-[#0d2a21] group-hover:text-blue-600 transition-colors">{(sub.rooms as any).title}</h4>
                                 <p className="text-sm text-[#0d2a21]/50 line-clamp-1 max-w-xs">{(sub.rooms as any).description}</p>
                              </div>
                           </div>
                           <Link href={`/room/${(sub.rooms as any).id}`}>
                              <button className="w-12 h-12 rounded-full bg-[#f5f6f2] flex items-center justify-center hover:bg-[#0d2a21] hover:text-white transition-all">
                                 <ArrowUpRight className="w-5 h-5" />
                              </button>
                           </Link>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>

           <div className="space-y-10">
              <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-[#0d2a21]/5 overflow-hidden">
                 <h3 className="text-2xl font-bold text-[#0d2a21] font-nanum mb-8">Audience Growth</h3>
                 <div className="h-48 flex items-end gap-3 px-2">
                    <Bar h="40%" />
                    <Bar h="60%" />
                    <Bar h="45%" active />
                    <Bar h="80%" />
                    <Bar h="55%" />
                    <Bar h="90%" active />
                    <Bar h="70%" />
                 </div>
                 <div className="mt-8 flex justify-between items-center text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-[0.1em]">
                    <span>Mon</span>
                    <span>Sun</span>
                 </div>
              </div>

              <div className="bg-[#0d2a21] p-10 rounded-[3.5rem] text-white shadow-xl">
                 <Zap className="w-10 h-10 text-[#10b981] mb-6" />
                 <h3 className="text-2xl font-bold font-nanum mb-4">Scale Faster.</h3>
                 <p className="text-white/40 text-xs mb-8 leading-relaxed">Integrate your rooms with Adroom to discover high-value experts and participants automatically.</p>
                 <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Boost Recruitment</button>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#0d2a21]/5 shadow-sm hover:shadow-md transition-all group">
       <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0d2a21]/5 flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{trend}</span>
       </div>
       <div>
          <p className="text-[11px] font-black text-[#0d2a21]/30 uppercase tracking-[0.15em] mb-1">{label}</p>
          <h4 className="text-3xl font-bold text-[#0d2a21] tracking-tighter">{value}</h4>
       </div>
    </div>
  )
}

function Bar({ h, active = false }: { h: string, active?: boolean }) {
  return (
    <div className="flex-1 rounded-t-xl transition-all duration-500 hover:h-[100%]" style={{ height: h, backgroundColor: active ? '#10b981' : '#f5f6f2' }} />
  )
}
