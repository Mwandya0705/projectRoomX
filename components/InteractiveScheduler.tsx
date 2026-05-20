'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalIcon, Check, Loader2, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:30 AM', 
  '01:00 PM', '02:30 PM', '04:00 PM', 
  '05:30 PM'
]

export function InteractiveScheduler() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [step, setStep] = useState<'date' | 'time' | 'confirm' | 'success'>('date')
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  // Generate current month days
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const paddingDays = Array.from({ length: firstDay }, (_, i) => null)
  const allDays = [...paddingDays, ...calendarDays]

  useGSAP(() => {
    // Safety check: ensure the ref exists before animating
    if (step === 'date' && calendarRef.current) {
      gsap.fromTo(calendarRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' })
    }
  }, { scope: containerRef, dependencies: [step] })

  const handleDateSelect = (day: number) => {
    if (!calendarRef.current) return setStep('time') // Fallback if ref is missing
    
    setSelectedDate(day)
    gsap.to(calendarRef.current, { 
      opacity: 0, 
      x: -50, 
      duration: 0.5, 
      ease: 'power4.in',
      onComplete: () => {
         // Second safety check inside the async callback
         if (containerRef.current) setStep('time')
      }
    })
  }

  const handleTimeSelect = (time: string) => {
    if (!timeRef.current) return setStep('confirm') // Fallback
    
    setSelectedTime(time)
    gsap.to(timeRef.current, { 
      opacity: 0, 
      y: -20, 
      duration: 0.5, 
      ease: 'power4.in',
      onComplete: () => {
         if (containerRef.current) setStep('confirm')
      }
    })
  }

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 2000)
  }

  return (
    <div ref={containerRef} className="w-full min-h-[600px] bg-white rounded-[4rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden border border-black/5">
       <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 blur-3xl rounded-full" />
       
       {step === 'date' && (
         <div ref={calendarRef} className="relative z-10">
            <header className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-3xl font-bold text-[#0d2a21] font-nanum">Pick a Day</h2>
                  <p className="text-sm text-[#0d2a21]/40 font-medium">May 2026</p>
               </div>
               <div className="flex gap-2">
                  <button className="p-3 bg-[#f5f6f2] rounded-2xl hover:bg-gray-100 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-3 bg-[#f5f6f2] rounded-2xl hover:bg-gray-100 transition-all"><ChevronRight className="w-4 h-4" /></button>
               </div>
            </header>

            <div className="grid grid-cols-7 gap-2 mb-4">
               {DAYS.map(d => <div key={d} className="text-[10px] font-black text-[#0d2a21]/20 uppercase text-center tracking-widest">{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-3">
               {allDays.map((day, idx) => (
                 <button 
                   key={idx}
                   disabled={!day || day < today.getDate()}
                   onClick={() => day && handleDateSelect(day)}
                   className={`aspect-square rounded-2xl text-sm font-bold flex items-center justify-center transition-all relative group
                    ${!day ? 'opacity-0 cursor-default' : 
                      day < today.getDate() ? 'text-[#0d2a21]/10 cursor-not-allowed' : 
                      'bg-[#f5f6f2] text-[#0d2a21] hover:bg-[#0d2a21] hover:text-white hover:scale-110 shadow-sm'}
                   `}
                 >
                    {day}
                    {day && day === today.getDate() && (
                      <div className="absolute bottom-2 w-1 h-1 bg-[#10b981] rounded-full" />
                    )}
                 </button>
               ))}
            </div>
         </div>
       )}

       {step === 'time' && (
         <div ref={timeRef} className="relative z-10">
            <button onClick={() => setStep('date')} className="flex items-center gap-2 text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest mb-8 hover:text-[#0d2a21] transition-all">
               <ChevronLeft className="w-4 h-4" /> Back to calendar
            </button>
            <header className="mb-12">
               <h2 className="text-3xl font-bold text-[#0d2a21] font-nanum">Available Slots</h2>
               <p className="text-sm text-[#0d2a21]/40 font-medium italic">Wednesday, May {selectedDate}</p>
            </header>

            <div className="grid grid-cols-1 gap-3">
               {TIME_SLOTS.map((time, idx) => (
                 <button 
                   key={idx}
                   onClick={() => handleTimeSelect(time)}
                   className="w-full p-4 sm:p-5 bg-[#f5f6f2] rounded-3xl text-left font-bold text-[#0d2a21] flex items-center justify-between group hover:bg-[#0d2a21] hover:text-white transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-white/50 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <Clock className="w-4 h-4" />
                       </div>
                       <span>{time}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                 </button>
               ))}
            </div>
         </div>
       )}

       {step === 'confirm' && (
         <div className="relative z-10 flex flex-col items-center text-center justify-center h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 bg-emerald-500/10 animate-ping rounded-full" />
               <Sparkles className="w-10 h-10 text-[#10b981]" />
            </div>
            <h2 className="text-4xl font-bold text-[#0d2a21] font-nanum mb-4">Secure the Slot?</h2>
            <p className="text-[#0d2a21]/60 mb-10 max-w-xs mx-auto">You're booking a 1-on-1 Sanctuary Strategy session for <b>May {selectedDate} at {selectedTime}</b>.</p>
            
            <div className="w-full space-y-4 mb-10">
               <input type="text" placeholder="Full Name" className="w-full p-5 bg-[#f5f6f2] rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#10b981]/20 transition-all" />
               <input type="email" placeholder="Business Email" className="w-full p-5 bg-[#f5f6f2] rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-[#10b981]/20 transition-all" />
            </div>

            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-[#0d2a21] text-white rounded-[2rem] font-bold text-base sm:text-lg hover:bg-[#184638] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
               <span>{loading ? 'Confirming...' : 'Confirm Booking'}</span>
            </button>
            <button onClick={() => setStep('time')} className="mt-6 text-xs font-black text-[#0d2a21]/20 uppercase tracking-[0.2em] hover:text-[#0d2a21] transition-all">Cancel</button>
         </div>
       )}

       {step === 'success' && (
         <div ref={successRef} className="relative z-10 flex flex-col items-center text-center justify-center h-full animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-[#0d2a21] rounded-full flex items-center justify-center mb-10 shadow-2xl">
               <Check className="w-12 h-12 text-[#10b981] animate-in slide-in-from-bottom-2" />
            </div>
            <h2 className="text-5xl font-bold text-[#0d2a21] font-nanum mb-6 leading-tight">It's Official.</h2>
            <p className="text-lg text-[#0d2a21]/60 mb-12 max-w-sm font-medium">Check your inbox. Your calendar invite and a preview of the Sanctuary strategy are on their way.</p>
            
            <div className="p-8 bg-[#f5f6f2] rounded-[3rem] w-full border border-black/5">
               <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center"><CalIcon className="w-5 h-5 text-[#0d2a21]" /></div>
                  <div>
                     <p className="text-[10px] font-black text-[#0d2a21]/30 uppercase tracking-widest">Confirmed Time</p>
                     <p className="text-lg font-bold text-[#0d2a21]">May {selectedDate} • {selectedTime}</p>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  )
}
