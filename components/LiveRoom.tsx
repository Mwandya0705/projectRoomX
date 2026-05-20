'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  Chat,
  ParticipantTile,
  GridLayout,
  useTracks,
  useParticipants,
  useRoomContext,
  TrackToggle,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import type { Room, User } from '@/lib/types/database'

interface LiveRoomProps {
  roomId: string
  room: Room & { users: User }
  user: User
  isCreator: boolean
}

export default function LiveRoom({ roomId, room, user, isCreator }: LiveRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch access token
    const fetchToken = async () => {
      try {
        console.log('Fetching access token for room:', roomId)
        const response = await fetch(`/api/rooms/${roomId}/access-token`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Access token API error:', response.status, errorData)
          throw new Error(errorData.error || `Failed to get access token (${response.status})`)
        }

        const data = await response.json()
        console.log('Access token received:', { hasToken: !!data.token, hasUrl: !!data.url })

        if (!data.token || !data.url) {
          throw new Error('Invalid response: missing token or URL')
        }

        setToken(data.token)
        setUrl(data.url)
      } catch (err) {
        console.error('Error fetching access token:', err)
        setError(err instanceof Error ? err.message : 'Failed to connect')
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [roomId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Connecting to room...</p>
      </div>
    )
  }

  if (error || !token || !url) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <div className="text-center max-w-md p-6">
          <p className="text-xl mb-4 font-semibold">Failed to connect to room</p>
          <p className="text-gray-400 mb-4">{error || 'Missing token or URL'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={isCreator}
      audio={isCreator}
      token={token}
      serverUrl={url}
      data-lk-theme="default"
      className="h-screen"
      onDisconnected={() => {
        // Redirect to dashboard after disconnecting
        window.location.href = '/dashboard'
      }}
    >
      {/* Header with navigation */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <Link
          href="/dashboard"
          className="text-white hover:text-blue-400 transition-colors font-medium"
        >
          ← Back to Dashboard
        </Link>
        <div className="text-white text-sm">
          {room.title}
        </div>
      </div>

      <div className="flex h-full" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Main video area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <CustomVideoConference isCreator={isCreator} />
          </div>
          <RoomControls room={room} isCreator={isCreator} />
        </div>

        {/* Sidebar with chat and participants */}
        <div className="w-80 border-l border-gray-700 flex flex-col">
          <RoomParticipants roomId={roomId} />
          <div className="flex-1 overflow-hidden">
            <Chat />
          </div>
        </div>
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}

function CustomVideoConference({ isCreator }: { isCreator: boolean }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  )
}

function RoomControls({
  room,
  isCreator,
}: {
  room: Room
  isCreator: boolean
}) {
  const router = useRouter()
  const roomContext = useRoomContext()

  // Handle manual disconnect/leave
  const handleLeave = async () => {
    try {
      // Disconnect from LiveKit room if connected
      // roomContext.room is the LiveKit room instance
      const livekitRoom = (roomContext as any)?.room
      if (livekitRoom) {
        await livekitRoom.disconnect()
      }
    } catch (error) {
      console.error('Error disconnecting from room:', error)
    } finally {
      // Always redirect to dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center">
      <div className="flex-1">
        {room.description && (
          <p className="text-gray-400 text-sm">{room.description}</p>
        )}
      </div>
      <div className="flex gap-2 items-center">
        {isCreator && (
          <>
            <TrackToggle
              source={Track.Source.Camera}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Camera
            </TrackToggle>
            <TrackToggle
              source={Track.Source.Microphone}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Mic
            </TrackToggle>
            <TrackToggle
              source={Track.Source.ScreenShare}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Share Screen
            </TrackToggle>
          </>
        )}
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {isCreator ? 'End Session' : 'Leave Room'}
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}

function RoomParticipants({ roomId }: { roomId: string }) {
  const participants = useParticipants()

  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800">
      <h2 className="text-lg font-semibold text-white mb-3">
        Participants ({participants.length})
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-gray-400 text-sm">No participants yet</p>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.identity}
              className="flex items-center gap-2 p-2 rounded bg-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {participant.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {participant.name || 'Anonymous'}
                </p>
                {participant.isLocal && (
                  <p className="text-gray-400 text-xs">You</p>
                )}
              </div>
              {participant.isSpeaking && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

