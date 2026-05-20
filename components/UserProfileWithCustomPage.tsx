'use client'

import { UserProfile } from '@clerk/nextjs'
import ProfileUpdateForm from './ProfileUpdateForm'

interface UserProfileWithCustomPageProps {
  currentUser: {
    id: string
    email: string
    name: string | null
    imageUrl: string | null
    clerkImageUrl: string | undefined
  }
}

export default function UserProfileWithCustomPage({ currentUser }: UserProfileWithCustomPageProps) {
  return (
    <UserProfile 
      routing="hash"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none border-0",
          navbar: "border-b border-gray-200",
          page: "p-6",
        },
      }}
    >
      {/* Custom Profile Page */}
      <UserProfile.Page
        label="Profile"
        labelIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        url="profile"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h2>
            <p className="text-sm text-gray-600 mb-6">
              Update your display name and profile image for RoomX
            </p>
          </div>
          <ProfileUpdateForm currentUser={currentUser} />
        </div>
      </UserProfile.Page>
    </UserProfile>
  )
}

