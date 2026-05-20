'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SubscribeButtonProps {
  roomId: string
}

export default function SubscribeButton({ roomId }: SubscribeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      // Validate roomId before sending
      if (!roomId || typeof roomId !== 'string') {
        throw new Error('Invalid room ID')
      }

      console.log('[SubscribeButton] Subscribing to room:', roomId)

      // Create checkout session
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle Zod validation errors
        if (data.error && Array.isArray(data.error)) {
          const errorMessages = data.error.map((err: any) => {
            if (err.path) {
              return `${err.path.join('.')}: ${err.message}`
            }
            return err.message
          }).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Click Pesa payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        throw new Error('No payment URL received')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout'
      alert(`Subscription Error: ${errorMessage}`)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : 'Subscribe Now'}
    </button>
  )
}

