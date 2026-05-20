'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import NavigationClient from '@/components/NavigationClient'

type RoleType = 'admin' | 'member'
type CapacityType = '2' | '4' | '6' | '8' | 'public'

export default function CreateRoomPage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    role: 'admin' as RoleType,
    adminEmail: '', // Email of person to make admin (if role is member)
    capacity: 'public' as CapacityType,
    price: '',
  })
  const [error, setError] = useState('')

  const handleNextStep = () => {
    console.log('handleNextStep called, title:', formData.title)
    if (formData.title.trim()) {
      console.log('Title is valid, moving to step 2')
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate admin email if role is member
      if (formData.role === 'member' && !formData.adminEmail.trim()) {
        setError('Please enter the email of the person you want to make admin')
        setLoading(false)
        return
      }

      // Validate price for non-public rooms
      if (formData.capacity !== 'public' && !formData.price.trim()) {
        setError('Please enter a subscription price')
        setLoading(false)
        return
      }

      const price = formData.capacity !== 'public' ? parseFloat(formData.price) : 0

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          price: price,
          role: formData.role,
          adminEmail: formData.role === 'member' ? formData.adminEmail : null,
          capacity: formData.capacity === 'public' ? null : parseInt(formData.capacity),
          isPublic: formData.capacity === 'public',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating room:', error)
      setError(error instanceof Error ? error.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationClient />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Room</h1>
          <p className="text-gray-600">Set up your room with custom settings</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Basic Info</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Settings</span>
            </div>
          </div>
          {/* Debug: Current step */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500">
              Debug: Current step = {step}, Title = &quot;{formData.title}&quot;
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            // Only submit if we're on step 2
            if (step !== 2) {
              e.preventDefault()
              e.stopPropagation()
              return false
            }
            return handleSubmit(e)
          }}
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Trading Room"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what members can expect in your room..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.title.trim()}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next: Settings
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Role *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType, adminEmail: '' })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">I will be the Admin</div>
                      <div className="text-sm text-gray-600">You will have full control over the room</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={formData.role === 'member'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">I will be a Member</div>
                      <div className="text-sm text-gray-600">Assign someone else as admin</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Admin Email (if role is member) */}
              {formData.role === 'member' && (
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email Address *
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    required={formData.role === 'member'}
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the email address of the person who will be the admin. They must have an account.
                  </p>
                </div>
              )}

              {/* Capacity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Room Capacity *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['2', '4', '6', '8', 'public'] as CapacityType[]).map((cap) => (
                    <label
                      key={cap}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        formData.capacity === cap ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="capacity"
                        value={cap}
                        checked={formData.capacity === cap}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value as CapacityType, price: cap === 'public' ? '' : formData.price })}
                        className="sr-only"
                      />
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {cap === 'public' ? '🌐' : cap}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {cap === 'public' ? 'Public' : `${cap} People`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price (for non-public rooms) */}
              {formData.capacity !== 'public' && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Subscription Price (TZS) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      TZS
                    </span>
                    <input
                      type="number"
                      id="price"
                      required={formData.capacity !== 'public' as CapacityType}
                      min="1"
                      step="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="29900"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Monthly subscription price in Tanzanian Shillings (TZS)
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || (formData.role === 'member' && !formData.adminEmail.trim()) || (formData.capacity !== 'public' && !formData.price.trim())}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
