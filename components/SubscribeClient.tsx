'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight, 
  Lock, 
  CheckCircle2,
  CreditCard,
  User,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import NavigationClient from '@/components/NavigationClient'

interface SubscribeClientProps {
  room: {
    id: string
    title: string
    description: string
    price: string
    creator: string
  }
  user: any
}

export default function SubscribeClient({ room, user }: SubscribeClientProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'summary' | 'payment' | 'success'>('summary')
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('Initiating secure transaction...')
  
  // Card states
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'generic'>('generic')

  // Auto-detect Card Type
  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s+/g, '')
    if (cleanNumber.startsWith('4')) {
      setCardType('visa')
    } else if (cleanNumber.startsWith('5')) {
      setCardType('mastercard')
    } else {
      setCardType('generic')
    }
  }, [cardNumber])

  // Formatting Card Number: XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 16) value = value.slice(0, 16)
    
    // Auto space
    const matches = value.match(/\d{1,4}/g)
    const matchString = matches ? matches.join(' ') : ''
    setCardNumber(matchString)
  }

  // Formatting Expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.slice(0, 4)
    
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`
    }
    setExpiryDate(value)
  }

  // Formatting CVV: XXX
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 3) value = value.slice(0, 3)
    setCvv(value)
  }

  // Loading text micro-animation
  useEffect(() => {
    if (!loading) return
    const messages = [
      'Establishing secure handshake...',
      'Encrypting billing credentials...',
      'Authorizing payment gateway...',
      'Configuring private sanctuary pass...',
      'Granting exclusive access...'
    ]
    let idx = 0
    const interval = setInterval(() => {
      if (idx < messages.length - 1) {
        idx++
        setLoadingMessage(messages[idx])
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [loading])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardholderName.trim()) {
      setErrorMessage('Please enter cardholder name')
      return
    }
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setErrorMessage('Please enter a valid 16-digit card number')
      return
    }
    if (expiryDate.length < 5) {
      setErrorMessage('Please enter a valid expiry date (MM/YY)')
      return
    }
    if (cvv.length < 3) {
      setErrorMessage('Please enter a valid CVV code')
      return
    }

    setErrorMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          cardholderName,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          expiryDate,
          cvv
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Direct authorization failed')
      }

      // Dynamic unlock success state
      setLoading(false)
      setStep('success')

      // Auto-redirect to the room after success animation
      setTimeout(() => {
        window.location.href = data.redirectUrl || `/room/${room.id}`
      }, 3500)

    } catch (error: any) {
      console.error('[SubscribeClient] Payment failed:', error)
      setErrorMessage(error.message || 'Payment authorization failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2] font-sans overflow-x-hidden">
      <NavigationClient />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 pb-24">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-20 items-center">
          
          {/* Left: Value Proposition */}
          <div className="space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#0d2a21]/5 rounded-full text-[#0d2a21]/40 text-[10px] font-black uppercase tracking-[0.2em]">
              <Lock className="w-3 h-3" />
              Private Sanctuary Access
            </div>

            <h1 className="text-[40px] sm:text-[56px] lg:text-[76px] font-bold text-[#0d2a21] leading-[0.95] tracking-tighter font-nanum">
              Secure your <br/><span className="text-[#10b981]">Access Pass.</span>
            </h1>

            <p className="text-[#0d2a21]/60 text-lg max-w-xl leading-relaxed">
              You're entering {room.creator}'s private sanctuary. To maintain the quality and exclusivity of the content, this room requires an active subscription pass.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6 lg:gap-0 lg:space-y-6">
              <BenefitItem icon={<Zap className="w-5 h-5 text-yellow-500" />} text="Real-time 4K Low Latency Streaming" />
              <BenefitItem icon={<Users className="w-5 h-5 text-blue-500" />} text="Direct Collaboration with Creator" />
              <BenefitItem icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} text="Exclusive Materials & Resources" />
            </div>
          </div>

          {/* Right: The Aesthetic Interactive Checkout Terminal */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#10b981]/20 to-blue-500/20 blur-3xl opacity-50 transition-opacity duration-700" />
            
            <div className="relative bg-[#0d2a21] rounded-3xl sm:rounded-[3rem] p-5 sm:p-10 lg:p-12 text-white shadow-2xl overflow-hidden border border-white/5 min-h-[580px] sm:min-h-[620px] lg:min-h-[600px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-[100px] rounded-full pointer-events-none" />
              
              {/* STEP 1: Summary Panel */}
              {step === 'summary' && (
                <div className="space-y-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-nanum tracking-tight">{room.title}</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">by {room.creator}</p>
                      </div>
                      <ShieldCheck className="w-10 h-10 text-[#10b981]" />
                    </div>

                    <div className="h-[1px] bg-white/10 w-full" />

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monthly Access Fee</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black font-nanum tracking-tighter">TZS {Number(room.price).toLocaleString()}</span>
                        <span className="text-white/30 font-bold uppercase tracking-widest text-[10px]">/ month</span>
                      </div>
                    </div>

                    <p className="text-white/50 text-sm leading-relaxed">
                      Instant cancellation at any time. Fully encrypted bank-grade checkout system.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <button 
                      onClick={() => setStep('payment')}
                      className="w-full py-4 bg-[#10b981] text-[#0d2a21] rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#059669] transition-all group/btn shadow-xl"
                    >
                      <span>Secure Access Pass</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    
                    <p className="text-center text-[10px] text-white/20 font-medium tracking-wide uppercase">
                      Powered by Sanctuary Sync & ClickPesa Secure
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Interactive Payment Card Terminal */}
              {step === 'payment' && (
                <div className="space-y-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <button 
                      onClick={() => { setStep('summary'); setErrorMessage(''); }}
                      className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-2"
                      disabled={loading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Summary
                    </button>
                    
                    {/* Visual Credit Card Container */}
                    <div className="w-full aspect-[1.586] max-w-sm mx-auto rounded-2xl relative preserve-3d transition-transform duration-700 ease-out"
                         style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      
                      {/* FRONT OF CARD */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#047857] rounded-2xl p-4 sm:p-6 flex flex-col justify-between backface-hidden shadow-lg border border-white/10 text-white">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-7 bg-yellow-500/20 border border-yellow-500/30 rounded-md flex items-center justify-center">
                            {/* Card Chip graphic */}
                            <div className="w-6 h-4 border border-yellow-500/40 rounded-sm grid grid-cols-2" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-wider">
                            {cardType === 'visa' ? 'VISA' : cardType === 'mastercard' ? 'MASTERCARD' : 'SECURE ACCESS'}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Card Number display */}
                          <div className="text-base xs:text-lg sm:text-xl font-bold font-mono tracking-widest whitespace-nowrap">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <span className="text-[7px] text-white/50 uppercase tracking-widest block">Cardholder</span>
                              <span className="text-[9px] xs:text-[11px] sm:text-xs font-bold uppercase tracking-wider block max-w-[110px] xs:max-w-[180px] truncate">
                                {cardholderName || 'YOUR FULL NAME'}
                              </span>
                            </div>
                            <div className="space-y-1 text-right">
                              <span className="text-[7px] text-white/50 uppercase tracking-widest block">Expires</span>
                              <span className="text-[10px] sm:text-xs font-bold font-mono block">
                                {expiryDate || 'MM/YY'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] to-[#022c22] rounded-2xl py-4 sm:py-6 flex flex-col justify-between backface-hidden shadow-lg border border-white/10 text-white"
                           style={{ transform: 'rotateY(180deg)' }}>
                        <div className="w-full h-6 sm:h-8 bg-black/80 mt-1" />
                        <div className="px-4 sm:px-6 space-y-2 sm:space-y-4">
                          <div className="flex justify-between items-center gap-2 sm:gap-4">
                            <div className="flex-1 h-6 sm:h-8 bg-white/20 rounded flex items-center justify-end px-2 sm:px-3 font-mono text-[9px] sm:text-xs text-white/50 tracking-widest italic line-through">
                              Sanctuary Sync Secure
                            </div>
                            <div className="w-10 sm:w-12 h-6 sm:h-8 bg-white text-black font-bold font-mono text-[10px] sm:text-xs flex items-center justify-center rounded">
                              {cvv || 'CVV'}
                            </div>
                          </div>
                          <p className="text-[5px] sm:text-[6px] text-white/30 leading-normal uppercase tracking-widest">
                            This custom digital access token is securely authorized by the RoomX transaction platform using the configured client PAYMENT_API_KEY environment credentials.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Billing Form Inputs */}
                  <form onSubmit={handlePay} className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {errorMessage && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">
                          {errorMessage}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block">Cardholder Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input 
                            type="text"
                            required
                            placeholder="Enter Cardholder Name"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            disabled={loading}
                            onFocus={() => setIsFlipped(false)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-[#10b981] focus:ring-0 outline-none transition-colors disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input 
                            type="text"
                            required
                            placeholder="4000 1234 5678 9010"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            disabled={loading}
                            onFocus={() => setIsFlipped(false)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:border-[#10b981] focus:ring-0 outline-none transition-colors disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block">Expiry Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input 
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={expiryDate}
                              onChange={handleExpiryChange}
                              disabled={loading}
                              onFocus={() => setIsFlipped(false)}
                              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:border-[#10b981] focus:ring-0 outline-none transition-colors disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block">CVV Code</label>
                          <input 
                            type="password"
                            required
                            placeholder="***"
                            value={cvv}
                            onChange={handleCvvChange}
                            disabled={loading}
                            onFocus={() => setIsFlipped(true)}
                            onBlur={() => setIsFlipped(false)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-mono focus:border-[#10b981] focus:ring-0 outline-none transition-colors disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#10b981] text-[#0d2a21] rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#059669] transition-all shadow-xl disabled:opacity-50 mt-4"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2.5">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="animate-pulse">{loadingMessage}</span>
                        </div>
                      ) : (
                        <>
                          <span>Pay TZS {Number(room.price).toLocaleString()}</span>
                          <Lock className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: Premium Unlock Success State */}
              {step === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                  <div className="relative">
                    {/* Glowing Ring Effect */}
                    <div className="absolute inset-0 bg-[#10b981]/30 blur-2xl rounded-full scale-150 animate-pulse" />
                    
                    {/* Glowing Checkmark Wrapper */}
                    <div className="relative w-24 h-24 rounded-full bg-[#10b981] flex items-center justify-center shadow-2xl border-4 border-white/10 scale-0 animate-scale-up">
                      <CheckCircle2 className="w-12 h-12 text-[#0d2a21] animate-checkmark" />
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h3 className="text-3xl font-black font-nanum tracking-tight text-[#10b981]">
                      Access Pass Secured!
                    </h3>
                    <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
                      Your monthly subscription is active. Welcome to {room.creator}'s private sanctuary.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.25em] animate-pulse">
                      Unlocking Studio...
                    </span>
                    <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#10b981] w-full rounded-full animate-loader-progress" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
      
      {/* Dynamic 3D Card Animation Styles */}
      <style jsx global>{`
        .preserve-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        @keyframes scale-up {
          to {
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes loader-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-loader-progress {
          animation: loader-progress 3s linear forwards;
        }
      `}</style>
    </div>
  )
}

function BenefitItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex sm:flex-col lg:flex-row items-center sm:items-start lg:items-center gap-3 sm:gap-2 lg:gap-4 group">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-110 transition-transform shrink-0">
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-bold text-[#0d2a21]/80 tracking-tight sm:leading-tight lg:leading-normal">{text}</span>
    </div>
  )
}
