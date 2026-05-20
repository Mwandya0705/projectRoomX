'use client'

import dynamic from 'next/dynamic'

// Dynamically import LiveRoom to avoid SSR issues
const LiveRoom = dynamic(
  () => import('./LiveRoom'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Loading room...</p>
      </div>
    ),
  }
)

interface LiveRoomWrapperProps {
  roomId: string
  room: any
  user: any
  isCreator: boolean
}

export default function LiveRoomWrapper(props: LiveRoomWrapperProps) {
  return <LiveRoom {...props} />
}

