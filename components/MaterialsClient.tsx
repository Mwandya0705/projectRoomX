'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  FileAudio, 
  File as FileIcon, 
  Eye, 
  Trash2, 
  Upload, 
  ChevronLeft, 
  Loader2, 
  Search,
  Filter,
  Map as MapIcon,
  Layout,
  X,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  BookOpen,
  Circle,
  Trophy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Material {
  id: string
  title: string
  description: string | null
  category: string
  phase: string
  file_url: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
  uploader: {
    name: string
    image_url: string | null
  }
}

interface MaterialsClientProps {
  roomId: string
  roomTitle: string
  user: any
  isCreator: boolean
}

export function MaterialsClient({ roomId, roomTitle, user, isCreator }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<'grid' | 'roadmap'>('grid')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'General',
    phase: 'Phase 1',
    file: null as File | null
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMaterials()
    fetchProgress()
  }, [roomId])

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/materials`)
      const data = await response.json()
      if (data.materials) setMaterials(data.materials)
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/materials/progress`)
      const data = await response.json()
      if (data.progress) {
        const completed = new Set<string>(data.progress.filter((p: any) => p.is_completed).map((p: any) => p.material_id))
        setCompletedIds(completed)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const toggleProgress = async (materialId: string) => {
    const isCompleted = !completedIds.has(materialId)
    
    // Optimistic UI
    const newCompleted = new Set(completedIds)
    if (isCompleted) newCompleted.add(materialId)
    else newCompleted.delete(materialId)
    setCompletedIds(newCompleted)

    try {
      await fetch(`/api/rooms/${roomId}/materials/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, isCompleted }),
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
      // Rollback on error
      fetchProgress()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadForm(prev => ({ ...prev, file: files[0], title: files[0].name }))
      setShowUploadModal(true)
    }
  }

  const handleFinalUpload = async () => {
    if (!uploadForm.file) return
    setUploading(true)
    try {
      const file = uploadForm.file
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${roomId}/${fileName}`

      const { error: storageError } = await supabase.storage
        .from('materials')
        .upload(filePath, file)
      if (storageError) throw storageError

      const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(filePath)

      const response = await fetch(`/api/rooms/${roomId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          phase: uploadForm.phase,
          fileUrl: publicUrl,
          filePath: filePath,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!response.ok) throw new Error('DB registration failed')

      setShowUploadModal(false)
      setUploadForm({ title: '', description: '', category: 'General', phase: 'Phase 1', file: null })
      fetchMaterials()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (materialId: string, filePath: string) => {
    if (!confirm('Permanently remove this material?')) return
    try {
      await supabase.storage.from('materials').remove([filePath])
      await supabase.from('room_materials').delete().eq('id', materialId)
      setMaterials(materials.filter(m => m.id !== materialId))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phase.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const roadmapData = materials.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {} as Record<string, Material[]>)

  const phases = Object.keys(roadmapData).sort()
  const completionRate = materials.length > 0 ? Math.round((completedIds.size / materials.length) * 100) : 0

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen pt-24 pb-20 font-satoshi">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
           <div className="space-y-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#0d2a21]/40 hover:text-[#0d2a21] font-bold text-xs transition-all">
                 <ChevronLeft className="w-4 h-4" />
                 Back to Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="text-5xl lg:text-7xl font-bold font-nanum text-[#0d2a21] leading-none tracking-tighter">
                   Sanctuary.
                </h1>
                {completionRate > 0 && (
                  <div className="px-4 py-2 bg-emerald-50 rounded-2xl flex items-center gap-2 border border-emerald-100 animate-in fade-in slide-in-from-left-4">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">{completionRate}% Mastery</span>
                  </div>
                )}
              </div>
              <p className="text-[#0d2a21]/60 font-medium max-w-md">Structured roadmap for <span className="text-[#0d2a21] font-bold">"{roomTitle}"</span>. Track your progress below.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0d2a21]/30" />
                 <input 
                   type="text" 
                   placeholder="Search roadmap..." 
                   className="w-full pl-11 pr-4 py-4 bg-white border border-[#0d2a21]/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d2a21]/5 transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => setView(view === 'grid' ? 'roadmap' : 'grid')}
                className={`px-6 py-3 sm:py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${view === 'roadmap' ? 'bg-[#0d2a21] text-white' : 'bg-white text-[#0d2a21] border border-[#0d2a21]/5'}`}
              >
                 {view === 'grid' ? <MapIcon className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                 <span>{view === 'grid' ? 'Roadmap View' : 'Vault View'}</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 sm:py-3.5 bg-[#10b981] text-[#0d2a21] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#059669] transition-all shadow-lg"
              >
                 <Upload className="w-4 h-4" />
                 <span>Upload</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
           </div>
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center text-[#0d2a21]/20">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="font-bold uppercase tracking-widest text-[10px]">Assembling knowledge...</p>
          </div>
        ) : view === 'grid' ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
               {paginatedMaterials.map((item) => (
                 <MaterialCard 
                   key={item.id} 
                   item={item} 
                   isCreator={isCreator} 
                   user={user} 
                   onDelete={handleDelete} 
                   formatSize={formatFileSize}
                   isCompleted={completedIds.has(item.id)}
                   onToggleProgress={() => toggleProgress(item.id)}
                 />
               ))}
               {paginatedMaterials.length === 0 && (
                 <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-[#0d2a21]/10">
                    <BookOpen className="w-12 h-12 text-[#0d2a21]/10 mx-auto mb-4" />
                    <p className="text-[#0d2a21]/40 font-bold">No resources found in this query.</p>
                 </div>
               )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                 <button 
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className="p-4 bg-white rounded-xl border border-[#0d2a21]/5 disabled:opacity-30"
                 >
                    <ChevronLeft className="w-5 h-5" />
                 </button>
                 <span className="text-sm font-bold text-[#0d2a21]/40">Page {currentPage} of {totalPages}</span>
                 <button 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage === totalPages}
                   className="p-4 bg-white rounded-xl border border-[#0d2a21]/5 disabled:opacity-30"
                 >
                    <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
            )}
          </>
        ) : (
          /* Roadmap View */
          <div className="space-y-12">
             {phases.map((phase, idx) => (
               <div key={phase} className="relative pl-12 border-l-2 border-[#0d2a21]/5 pb-12 last:pb-0">
                  <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-[#0d2a21] border-4 border-white shadow-sm flex items-center justify-center">
                     <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                  <div className="mb-8">
                     <span className="text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-[0.2em] mb-1 block">Level 0{idx + 1}</span>
                     <h3 className="text-3xl font-bold text-[#0d2a21] font-nanum">{phase}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {roadmapData[phase].map((item) => (
                        <div key={item.id} className={`bg-white p-6 rounded-3xl border transition-all group relative overflow-hidden ${completedIds.has(item.id) ? 'border-emerald-500/20 shadow-lg' : 'border-[#0d2a21]/5 shadow-sm'}`}>
                           {completedIds.has(item.id) && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />}
                           <div className="flex items-center justify-between mb-4 relative z-10">
                              <div className="px-3 py-1 bg-[#f5f6f2] rounded-full text-[10px] font-bold text-[#0d2a21]/40 uppercase tracking-widest">{item.category}</div>
                              <button onClick={() => toggleProgress(item.id)} className="transition-all active:scale-90">
                                {completedIds.has(item.id) ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                                ) : (
                                  <Circle className="w-6 h-6 text-[#0d2a21]/10 hover:text-[#0d2a21]/30 transition-colors" />
                                )}
                              </button>
                           </div>
                           <h4 className="text-lg font-bold text-[#0d2a21] mb-2 line-clamp-1">{item.title}</h4>
                           <p className="text-xs text-[#0d2a21]/60 line-clamp-2 mb-6 leading-relaxed">{item.description || 'No description provided.'}</p>
                           <div className="flex items-center justify-between mt-auto">
                              <a href={item.file_url} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold text-[#0d2a21] hover:text-[#10b981] transition-colors">
                                 Peek <ChevronRight className="w-4 h-4" />
                              </a>
                              {completedIds.has(item.id) && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Completed</span>}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0d2a21]/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 blur-3xl rounded-full" />
              <button onClick={() => setShowUploadModal(false)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-all">
                 <X className="w-6 h-6 text-[#0d2a21]/30" />
              </button>

              <h2 className="text-3xl lg:text-4xl font-bold font-nanum text-[#0d2a21] mb-2">Resource Details</h2>
              <p className="text-sm text-[#0d2a21]/40 mb-10 font-medium">Categorize your upload to help members follow the roadmap.</p>

              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest mb-2 ml-1">Title</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-[#f5f6f2] rounded-2xl text-sm font-bold text-[#0d2a21] border-none focus:ring-2 focus:ring-[#10b981]/50 outline-none transition-all"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(p => ({ ...p, title: e.target.value }))}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest mb-2 ml-1">Category</label>
                       <select 
                         className="w-full px-6 py-4 bg-[#f5f6f2] rounded-2xl text-sm font-bold text-[#0d2a21] border-none focus:ring-2 focus:ring-[#10b981]/50 outline-none transition-all"
                         value={uploadForm.category}
                         onChange={(e) => setUploadForm(p => ({ ...p, category: e.target.value }))}
                       >
                          <option>General</option>
                          <option>Tutorial</option>
                          <option>Documentation</option>
                          <option>Strategy</option>
                          <option>Bonus</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest mb-2 ml-1">Roadmap Phase</label>
                       <select 
                         className="w-full px-6 py-4 bg-[#f5f6f2] rounded-2xl text-sm font-bold text-[#0d2a21] border-none focus:ring-2 focus:ring-[#10b981]/50 outline-none transition-all"
                         value={uploadForm.phase}
                         onChange={(e) => setUploadForm(p => ({ ...p, phase: e.target.value }))}
                       >
                          <option>Phase 1: Intro</option>
                          <option>Phase 2: Core</option>
                          <option>Phase 3: Advanced</option>
                          <option>Phase 4: Mastery</option>
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea 
                      rows={3}
                      className="w-full px-6 py-4 bg-[#f5f6f2] rounded-2xl text-sm font-medium text-[#0d2a21]/70 border-none focus:ring-2 focus:ring-[#10b981]/50 outline-none transition-all resize-none"
                      placeholder="Briefly explain what this resource covers..."
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(p => ({ ...p, description: e.target.value }))}
                    />
                 </div>

                 <button 
                   onClick={handleFinalUpload}
                   disabled={uploading}
                   className="w-full py-3 sm:py-3.5 bg-[#0d2a21] text-white rounded-2xl font-bold text-lg hover:bg-[#184638] transition-all flex items-center justify-center gap-3 shadow-xl"
                 >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span>{uploading ? 'Launching into Vault...' : 'Commit to Sanctuary'}</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function MaterialCard({ item, isCreator, user, onDelete, formatSize, isCompleted, onToggleProgress }: any) {
  return (
    <div className={`bg-white p-8 rounded-[3rem] border transition-all group relative overflow-hidden ${isCompleted ? 'border-emerald-500/20 shadow-2xl' : 'border-[#0d2a21]/5 hover:shadow-2xl hover:-translate-y-1'}`}>
       {isCompleted && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />}
       <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-[#f5f6f2] flex items-center justify-center text-[#0d2a21] group-hover:scale-110 transition-transform">
             {item.file_type.includes('pdf') ? <FileText className="w-7 h-7 text-red-500" /> : 
              item.file_type.includes('audio') ? <FileAudio className="w-7 h-7 text-purple-500" /> :
              item.file_type.includes('image') ? <ImageIcon className="w-7 h-7 text-blue-500" /> :
              <FileIcon className="w-7 h-7 text-gray-400" />}
          </div>
          <div className="flex gap-2">
             <button onClick={onToggleProgress} className="p-3 bg-white border border-[#0d2a21]/5 rounded-2xl transition-all hover:scale-110 active:scale-95" title={isCompleted ? "Mark as Not Covered" : "Mark as Covered"}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" /> : <Circle className="w-5 h-5 text-[#0d2a21]/20" />}
             </button>
             <a href={item.file_url} target="_blank" className="p-3 bg-white border border-[#0d2a21]/5 rounded-2xl text-[#0d2a21]/40 hover:bg-[#0d2a21] hover:text-white transition-all" title="Preview Asset">
                <Eye className="w-4 h-4" />
             </a>
             {(isCreator || item.uploader.name === user.name) && (
               <button onClick={() => onDelete(item.id, item.file_path)} className="p-3 bg-red-50 rounded-2xl text-red-400 hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
               </button>
             )}
          </div>
       </div>

       <div className="mb-8 relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">{item.category}</span>
             <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest">{item.phase}</span>
             {isCompleted && <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-in zoom-in-50">Covered</span>}
          </div>
          <h3 className="text-xl font-bold text-[#0d2a21] line-clamp-1 mb-2">{item.title}</h3>
          <p className="text-xs text-[#0d2a21]/50 line-clamp-2 leading-relaxed h-8">{item.description || 'Access high-value sanctuary expertise.'}</p>
       </div>

       <div className="pt-6 border-t border-[#0d2a21]/5 flex items-center justify-between text-[10px] font-bold text-[#0d2a21]/30 uppercase tracking-[0.15em] relative z-10">
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full bg-[#0d2a21] text-white flex items-center justify-center text-[8px] font-black">{item.uploader.name.charAt(0)}</div>
             <span>{item.uploader.name}</span>
          </div>
          <span>{formatSize(item.file_size)}</span>
       </div>
    </div>
  )
}
