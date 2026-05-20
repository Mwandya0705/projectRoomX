'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  ExternalLink, 
  Link as LinkIcon, 
  MoreVertical,
  Settings as SettingsIcon,
  Calendar as CalIcon,
  Users,
  Clock,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  Video,
  Mail,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Globe,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Save,
  Zap,
  BarChart3,
  VideoIcon,
  Mic2,
  Phone,
  UserCheck,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  FileText,
  Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface Assistant {
  id: string
  name: string
  email: string
  phone: string
  photo_url: string
  specialty?: string
}

interface EventType {
  id: string
  title: string
  description?: string
  price?: number
  duration_minutes: number
  event_type: string
  location_type: string
  activity_type: string
  is_active: boolean
  scheduled_date?: string
  invitations_count?: number
  assistant?: Assistant
}

export function SchedulingManager() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Activity Types')
  const [activities, setActivities] = useState<EventType[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAssistants, setLoadingAssistants] = useState(false)
  const [asstError, setAsstError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4
  
  const [settings, setSettings] = useState({ timezone: 'Eastern Time (ET)', buffer: 15, dailyLimit: 5, limitActive: true, autoNotify: true })
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteModalData, setInviteModalData] = useState<{ isOpen: boolean, activityId: string, activityTitle: string }>({
    isOpen: false, activityId: '', activityTitle: ''
  })
  
  const [newActivity, setNewActivity] = useState({
    title: '', 
    description: '',
    price: 0,
    duration: 30, 
    type: 'One-on-One', 
    location: 'Video Call', 
    activityType: 'Walkthrough', 
    date: new Date().toISOString().split('T')[0], 
    time: '09:00', 
    assistantId: '', 
    inviteEmail: ''
  })

  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    setLoadingAssistants(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: dbUser } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(dbUser)
        
        const { data: assts } = await supabase.from('scheduling_assistants').select('*')
        if (assts) setAssistants(assts.map(a => ({
          ...a,
          specialty: a.name.includes('Emmanuel') ? 'Strategy Expert' : a.name.includes('Kerrie') ? 'Operations Lead' : 'Technical Support'
        })))
        setLoadingAssistants(false)

        const { data: events } = await supabase
          .from('scheduling_events')
          .select(`*, assistant:scheduling_assistants(*), invitations:scheduling_invitations(count)`)
          .eq('creator_id', authUser.id)
          .order('created_at', { ascending: false })
        
        if (events) {
          setActivities(events.map((e: any) => ({
            ...e,
            invitations_count: e.invitations[0]?.count || 0
          })))
        }

        const { data: invites } = await supabase.from('scheduling_invitations').select(`*, activity:scheduling_events(title)`).eq('sender_id', authUser.id).order('created_at', { ascending: false })
        if (invites) setInvitations(invites)
      }
    } catch (e: any) { setAsstError(e.message) } finally { setLoading(false) }
  }

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      const { error } = await supabase.from('scheduling_events').delete().eq('id', id)
      if (error) throw error
      setActivities(activities.filter(a => a.id !== id))
    } catch (e: any) { alert(e.message) }
  }

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.assistantId) return alert('Fill all required fields')
    setPublishing(true)
    try {
      const { data: event, error: eventError } = await supabase.from('scheduling_events').insert({
        creator_id: user.id, 
        title: newActivity.title, 
        description: newActivity.description,
        price: newActivity.price,
        duration_minutes: newActivity.duration, 
        event_type: newActivity.type, 
        location_type: newActivity.location, 
        activity_type: newActivity.activityType, 
        scheduled_date: `${newActivity.date}T${newActivity.time}:00Z`, 
        assistant_id: newActivity.assistantId, 
        is_active: true
      }).select().single()

      if (eventError) throw eventError

      // Notify Assistant
      await fetch('/api/scheduling/notify-assistant', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ assistantId: newActivity.assistantId, activityTitle: newActivity.title, scheduledDate: `${newActivity.date}T${newActivity.time}:00Z` }) 
      })

      // Send Optional Invite
      if (newActivity.inviteEmail) {
        await fetch('/api/scheduling/invite', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ email: newActivity.inviteEmail, activityId: event.id }) 
        })
      }

      setShowCreateModal(false)
      fetchData()
    } catch (error: any) { alert(`Error: ${error.message}`) } finally { setPublishing(false) }
  }

  const totalPages = Math.ceil(activities.length / itemsPerPage)
  const currentActivities = activities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl font-sans text-[#1a202c]">
      <header className="bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0d2a21] rounded-xl flex items-center justify-center text-white font-bold text-xl">X</div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0a1b39]">Sanctuary Sync</h2>
         </div>
         <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-[#0d2a21] text-white rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#184638] transition-all shadow-lg">
            <Plus className="w-4 h-4" /> <span>Create Activity</span>
         </button>
      </header>

      <div className="p-10 space-y-10 min-h-[600px]">
         <nav className="flex gap-10 border-b border-slate-100 pb-1">
            {['Activity Types', 'Sent Invitations', 'Settings'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-[#0d2a21]' : 'text-slate-400 hover:text-slate-600'}`}>
                 {tab} {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0d2a21] rounded-t-full" />}
              </button>
            ))}
         </nav>

         <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'Activity Types' && (
              <div className="space-y-10">
                 <div className="grid lg:grid-cols-2 gap-10">
                    <AnimatePresence mode="wait">
                       {currentActivities.map(event => (
                         <motion.div key={event.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                            <ActivityCard 
                              event={event} 
                              onInvite={() => setInviteModalData({ isOpen: true, activityId: event.id, activityTitle: event.title })}
                              onDelete={() => handleDeleteActivity(event.id)}
                            />
                         </motion.div>
                       ))}
                    </AnimatePresence>
                    {activities.length === 0 && !loading && <EmptyState onCreate={() => setShowCreateModal(true)} />}
                 </div>

                 {totalPages > 1 && (
                   <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Showing page {currentPage} of {totalPages}</p>
                      <div className="flex items-center gap-2">
                         <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 bg-white border border-slate-100 rounded-2xl disabled:opacity-30 hover:bg-[#0d2a21] hover:text-white transition-all shadow-sm"><ChevronLeft size={20} /></button>
                         <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 bg-white border border-slate-100 rounded-2xl disabled:opacity-30 hover:bg-[#0d2a21] hover:text-white transition-all shadow-sm"><ChevronRight size={20} /></button>
                      </div>
                   </div>
                 )}
              </div>
            )}
            
            {activeTab === 'Sent Invitations' && (
              <InvitationsTable invitations={invitations} onDelete={() => fetchData()} />
            )}

            {activeTab === 'Settings' && (
               <SettingsPanel settings={settings} setSettings={setSettings} onSave={() => alert('Settings Saved')} loading={false} />
            )}
         </div>
      </div>

      {showCreateModal && (
        <AdvancedCreateModal 
          onClose={() => setShowCreateModal(false)}
          assistants={assistants}
          loadingAssistants={loadingAssistants}
          newActivity={newActivity}
          setNewActivity={setNewActivity}
          onSubmit={handleCreateActivity}
          publishing={publishing}
        />
      )}

      <SanctuaryInviteModal 
        isOpen={inviteModalData.isOpen}
        onClose={() => setInviteModalData(p => ({ ...p, isOpen: false }))}
        activityId={inviteModalData.activityId}
        activityTitle={inviteModalData.activityTitle}
        onSuccess={fetchData}
      />
    </div>
  )
}

function AdvancedCreateModal({ onClose, assistants, loadingAssistants, newActivity, setNewActivity, onSubmit, publishing }: any) {
   return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-[#0d2a21]/90 backdrop-blur-xl">
         <div className="bg-white w-full max-w-7xl rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden flex flex-col h-[90vh]">
            <button onClick={onClose} className="absolute top-10 right-10 p-4 hover:bg-slate-100 rounded-full text-slate-300 transition-all"><X className="w-8 h-8" /></button>
            
            <header className="mb-12">
               <div className="flex items-center gap-4 mb-4">
                  <div className="px-4 py-1.5 bg-[#0d2a21] text-white rounded-full text-[10px] font-black uppercase tracking-widest">Orchestration Wizard</div>
                  <div className="h-px flex-1 bg-slate-100" />
               </div>
               <h2 className="text-6xl font-bold text-[#0a1b39] font-nanum tracking-tighter leading-none">Activity Blueprint</h2>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 overflow-y-auto pr-6 pb-10">
               {/* Column 1: Core Details */}
               <div className="lg:col-span-4 space-y-10">
                  <div className="space-y-6">
                     <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Target size={12} className="text-[#0d2a21]" /> Global Identity</label>
                     <input type="text" className="w-full px-8 py-6 bg-slate-50 rounded-[2.5rem] text-xl font-bold text-[#0d2a21] outline-none border-2 border-transparent focus:border-[#0d2a21]/10 transition-all" placeholder="e.g. Platinum Strategy Sync" value={newActivity.title} onChange={(e) => setNewActivity((p:any) => ({ ...p, title: e.target.value }))} />
                     <textarea rows={3} className="w-full px-8 py-6 bg-slate-50 rounded-[2.5rem] text-sm font-medium text-[#0d2a21]/60 outline-none border-2 border-transparent focus:border-[#0d2a21]/10 transition-all resize-none" placeholder="Draft the session agenda or goals..." value={newActivity.description} onChange={(e) => setNewActivity((p:any) => ({ ...p, description: e.target.value }))} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={12} /> Price</label>
                        <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-lg text-[#0d2a21] outline-none" value={newActivity.price} onChange={(e) => setNewActivity((p:any) => ({ ...p, price: parseFloat(e.target.value) }))} />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> Duration</label>
                        <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm text-[#0d2a21] outline-none" value={newActivity.duration} onChange={(e) => setNewActivity((p:any) => ({ ...p, duration: parseInt(e.target.value) }))}>
                           <option value={15}>15 Minutes</option>
                           <option value={30}>30 Minutes</option>
                           <option value={60}>60 Minutes</option>
                           <option value={120}>2 Hours</option>
                        </select>
                     </div>
                  </div>

                  <div className="bg-[#f5f6f2] p-8 rounded-[3rem] border border-black/5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block"><UserPlus size={12} className="inline mr-1" /> Optional Member Outreach</label>
                     <p className="text-[10px] text-slate-400 italic mb-4">Send an automated invite magic link to a guest instantly.</p>
                     <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="email" placeholder="guest@email.com" className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#0d2a21]/20 shadow-sm" value={newActivity.inviteEmail} onChange={(e) => setNewActivity((p:any) => ({ ...p, inviteEmail: e.target.value }))} />
                     </div>
                  </div>
               </div>

               {/* Column 2: Assistant Registry */}
               <div className="lg:col-span-5 bg-slate-50 p-10 rounded-[4rem] border border-slate-100 relative">
                  <div className="flex justify-between items-center mb-10">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Expert Assistant</label>
                     <div className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-emerald-600 border border-emerald-50">VERIFIED TEAM</div>
                  </div>
                  
                  {loadingAssistants ? <Loader2 className="animate-spin mx-auto text-slate-300 w-12 h-12 mt-20" /> : (
                     <div className="space-y-4">
                        {assistants.map((asst:any) => (
                           <div 
                             key={asst.id} 
                             onClick={() => setNewActivity((p:any) => ({ ...p, assistantId: asst.id }))} 
                             className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center gap-6 ${newActivity.assistantId === asst.id ? 'bg-white border-[#0d2a21] shadow-2xl scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white hover:shadow-lg'}`}
                           >
                              <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-sm bg-slate-200">
                                 <img src={asst.photo_url} className="w-full h-full object-cover" alt={asst.name} />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{asst.specialty || 'Generalist'}</p>
                                 <h4 className="font-bold text-2xl text-[#0a1b39] tracking-tighter">{asst.name}</h4>
                                 <div className="flex items-center gap-3 mt-2">
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold"><Mail size={10} /> {asst.email}</span>
                                 </div>
                              </div>
                              {newActivity.assistantId === asst.id && (
                                <div className="w-10 h-10 bg-[#0d2a21] rounded-full flex items-center justify-center text-white"><CheckCircle2 size={20} /></div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Column 3: Timing & Summary */}
               <div className="lg:col-span-3 space-y-8">
                  <div className="bg-[#f8fafc] p-10 rounded-[3.5rem] border border-slate-100">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 block">Execution Timeline</label>
                     <div className="space-y-6">
                        <div className="relative">
                           <CalIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input type="date" className="w-full pl-12 pr-6 py-5 bg-white rounded-2xl font-bold text-sm outline-none shadow-sm" value={newActivity.date} onChange={(e) => setNewActivity((p:any) => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="relative">
                           <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input type="time" className="w-full pl-12 pr-6 py-5 bg-white rounded-2xl font-bold text-sm outline-none shadow-sm" value={newActivity.time} onChange={(e) => setNewActivity((p:any) => ({ ...p, time: e.target.value }))} />
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#0d2a21] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                     <Zap className="w-12 h-12 text-yellow-400 mb-8" />
                     <h3 className="text-2xl font-bold font-nanum mb-4 tracking-tight">Sync Engine</h3>
                     <p className="text-white/40 text-[10px] leading-relaxed mb-10 italic">Publishing will instantly notify the assistant and secure your outreach slot.</p>
                     
                     <button 
                       onClick={onSubmit} 
                       disabled={publishing} 
                       className="w-full py-6 bg-white text-[#0d2a21] rounded-[2.5rem] font-black text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                     >
                        {publishing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={16} />}
                        <span>{publishing ? 'ORCHESTRATING...' : 'PUBLISH BLUEPRINT'}</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

function ActivityCard({ event, onInvite, onDelete }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative">
       <div className={`absolute left-0 top-0 bottom-0 w-[14px] ${event.activity_type === 'Audit' ? 'bg-purple-500' : 'bg-[#0d2a21]'}`} />
       <div className="p-12">
          <div className="flex justify-between items-start mb-10">
             <div className="flex items-center gap-3">
                <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${event.activity_type === 'Audit' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>{event.activity_type}</span>
                {event.price > 0 && <span className="px-5 py-2 rounded-2xl text-[10px] font-black bg-slate-50 text-[#0d2a21] border border-slate-100">${event.price}</span>}
             </div>
             <button onClick={onDelete} className="p-3 bg-red-50 text-red-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-xl">
                <Trash2 size={20} />
             </button>
          </div>
          
          <div className="mb-10">
             <h3 className="text-4xl font-bold text-[#0a1b39] mb-4 tracking-tighter leading-tight group-hover:text-[#0d2a21] transition-colors">{event.title}</h3>
             {event.description && <p className="text-sm text-slate-400 font-medium line-clamp-2 italic mb-6 leading-relaxed">"{event.description}"</p>}
             <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                <div className="flex items-center gap-3 bg-slate-50/50 px-5 py-2.5 rounded-2xl border border-slate-100/50"><Clock className="w-4 h-4 text-emerald-500" /> {event.duration_minutes}m Session</div>
                <div className="flex items-center gap-3 bg-slate-50/50 px-5 py-2.5 rounded-2xl border border-slate-100/50"><CalIcon className="w-4 h-4 text-blue-500" /> {new Date(event.scheduled_date).toLocaleDateString()}</div>
             </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
             {event.assistant && (
               <div className="flex items-center gap-4">
                  <img src={event.assistant.photo_url} className="w-12 h-12 rounded-2xl object-cover shadow-md border-2 border-white" alt={event.assistant.name} />
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Assigned Expert</p>
                     <p className="text-sm font-bold text-[#0a1b39]">{event.assistant.name}</p>
                  </div>
               </div>
             )}
             <div className="flex gap-3">
                <button onClick={onInvite} className="p-4 bg-[#0d2a21] text-white rounded-2xl hover:scale-105 transition-all shadow-xl"><UserPlus size={18} /></button>
                <button className="p-4 bg-white border border-slate-200 text-[#0d2a21] rounded-2xl hover:bg-slate-50 transition-all"><LinkIcon size={18} /></button>
             </div>
          </div>
       </div>
    </div>
  )
}

function SettingsPanel({ settings, setSettings, onSave, loading }: any) {
   return (
      <div className="max-w-4xl space-y-10">
         <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-slate-50 p-10 rounded-[4rem] border border-slate-100 space-y-8">
               <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><Globe size={12} /> Sync Timezone</label>
                  <select value={settings.timezone} onChange={(e) => setSettings((p:any) => ({ ...p, timezone: e.target.value }))} className="w-full bg-white border border-slate-200 p-5 rounded-2xl text-sm font-bold outline-none shadow-sm"><option>Eastern Time (ET)</option><option>Pacific Time (PT)</option><option>GMT</option></select>
               </div>
               <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><Clock size={12} /> Session Buffer</label>
                  <div className="flex gap-2">{[15, 30, 60].map(m => (<button key={m} onClick={() => setSettings((p:any) => ({ ...p, buffer: m }))} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${settings.buffer === m ? 'bg-[#0d2a21] text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}>{m}m</button>))}</div>
               </div>
            </div>
            <div className="bg-[#0d2a21] p-10 rounded-[4rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-6"><div><h4 className="text-xl font-bold font-nanum">Sync Guard</h4><p className="text-white/40 text-[9px] uppercase tracking-widest">Productivity Protocol</p></div><button onClick={() => setSettings((p:any) => ({ ...p, limitActive: !p.limitActive }))}>{settings.limitActive ? <ToggleRight className="text-emerald-400 w-10 h-10" /> : <ToggleLeft className="text-white/20 w-10 h-10" />}</button></div>
               <div className={`space-y-4 transition-all ${settings.limitActive ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}><label className="text-[10px] font-black uppercase text-white/40">Daily Cap</label><input type="number" value={settings.dailyLimit} onChange={(e) => setSettings((p:any) => ({ ...p, dailyLimit: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-2xl font-bold outline-none" /></div>
            </div>
         </div>
         <button onClick={onSave} disabled={loading} className="w-full py-6 bg-[#0d2a21] text-white rounded-[2.5rem] font-black text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-[1.01] transition-all">{loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} <span>SYNCHRONIZE GLOBAL PREFERENCES</span></button>
      </div>
   )
}

function SanctuaryInviteModal({ isOpen, onClose, activityId, activityTitle, onSuccess }: any) {
  const [email, setEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/invite/${activityId}` : ''
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email) return; setIsInviting(true); setStatus(null)
    try {
      const response = await fetch('/api/scheduling/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activityId, email }) })
      if ((await response.json()).success) { setStatus({ type: 'success', message: `Sent!` }); setEmail(''); onSuccess(); } else { setStatus({ type: 'error', message: 'Failed' }) }
    } catch (err) { setStatus({ type: 'error', message: 'Error' }) } finally { setIsInviting(false) }
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[3rem] p-10 text-white"><div className="flex justify-between mb-8"><h2 className="text-3xl font-bold font-nanum">Invite</h2><button onClick={onClose}><X /></button></div><form onSubmit={handleInvite} className="space-y-4"><input type="email" required placeholder="guest@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm" /><button type="submit" className="w-full py-5 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2">{isInviting ? <Loader2 className="animate-spin" /> : <Mail size={18} />} Send Magic Link</button></form></motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function InvitationsTable({ invitations, onDelete }: any) {
  return (
    <div className="space-y-6">
       <h3 className="text-3xl font-bold text-[#0a1b39] tracking-tighter">Invitation Registry</h3>
       <div className="bg-[#f8fafc] border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 border-b border-slate-100"><tr><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Activity</th><th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th></tr></thead>
             <tbody className="divide-y divide-slate-100">{invitations.map((invite:any) => (<tr key={invite.id} className="hover:bg-white transition-colors"><td className="px-12 py-10 flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm"><Mail className="text-slate-300" size={18} /></div> <span className="font-bold text-[#0a1b39]">{invite.recipient_email}</span></td><td className="px-12 py-10 font-bold text-[#0a1b39]">{invite.activity?.title || 'Direct'}</td><td className="px-12 py-10"><span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest ${invite.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{invite.status}</span></td></tr>))}</tbody>
          </table>
       </div>
    </div>
  )
}

function EmptyState({ onCreate }: any) {
  return (
    <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-50 rounded-[4rem] group hover:border-slate-100 transition-all"><Zap className="w-16 h-16 text-slate-100 mx-auto mb-6" /><h4 className="text-3xl font-bold text-slate-200">The registry is currently silent.</h4><button onClick={onCreate} className="mt-8 px-10 py-5 bg-slate-50 text-slate-400 rounded-[2.5rem] font-black text-xs tracking-widest hover:bg-[#0d2a21] hover:text-white transition-all shadow-sm">LAUNCH BLUEPRINT</button></div>
  )
}
