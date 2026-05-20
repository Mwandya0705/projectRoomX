'use client'

import { useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

export default function ProfileImageUploader() {
  const { user, isLoaded } = useUser()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isLoaded || !user) {
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)

    // Basic validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }

    try {
      setUploading(true)
      // Use Clerk's built-in API to update the profile image
      await user.setProfileImage({ file })
      setSuccess('Profile image updated successfully.')
    } catch (err) {
      console.error('Error updating Clerk profile image:', err)
      setError('Failed to update profile image. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile image</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a profile picture. It will appear across your account, including in the header.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || user.primaryEmailAddress?.emailAddress || 'Profile'}
              className="h-16 w-16 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-lg font-semibold text-gray-700">
              {(user.firstName?.[0] || user.lastName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || '?').toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            id="profile-image-upload"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label
            htmlFor="profile-image-upload"
            className={`inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading…' : 'Upload new image'}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG, GIF, or WebP. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  )
}



