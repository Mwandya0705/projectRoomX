import { Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function CreatorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  // Fetch the creator
  const { data: creator } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!creator) {
    notFound()
  }

  // Fetch the currently authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user's active subscriptions to know what they are members of
  let subscribedRoomIds = new Set<string>()
  if (user) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('room_id')
      .eq('subscriber_id', user.id)
      .eq('status', 'active')
    
    if (subs) {
      subs.forEach(s => subscribedRoomIds.add(s.room_id))
    }
  }

  // Fetch all rooms for this creator
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*, creator:users!rooms_creator_id_fkey(*)')
    .eq('creator_id', id)
    .order('created_at', { ascending: false })

  // Format rooms for display
  const formattedRooms = (rooms || []).map(room => {
    const isMember = user ? (room.creator_id === user.id || subscribedRoomIds.has(room.id)) : false;

    return {
      id: room.id,
      title: room.title,
      description: room.description,
      category: room.category || 'Other',
      isLive: room.is_live,
      isPublic: room.is_public,
      capacity: room.capacity,
      createdAt: room.created_at,
      isMember: isMember,
      creator: room.creator ? {
        id: room.creator.id,
        name: room.creator.name,
        email: room.creator.email,
        imageUrl: room.creator.image_url,
      } : {
        id: room.creator_id,
        name: null,
        email: 'Unknown',
        imageUrl: null,
      },
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-24">
      <main className="max-w-7xl mx-auto px-4 pt-30 sm:px-6 lg:px-8 py-8">
        <div className="mb-16 flex flex-col items-center text-center">
          {creator.image_url ? (
            <img
              src={creator.image_url}
              alt={creator.name || 'Creator'}
              className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white mb-6"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-4xl mb-6 shadow-xl border-4 border-white">
              {creator.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tighter mb-2">{creator.name || 'Anonymous Creator'}</h1>
          <p className="text-gray-500 font-medium italic">Creator on RoomX</p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tighter mb-2">Creator's Rooms</h2>
        </div>

        {formattedRooms.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 p-20 text-center">
            <p className="text-gray-400 font-medium text-lg mb-8">This creator hasn't opened any rooms yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formattedRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Room ID: {room.id.substring(0, 8)}</span>
                         <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">{room.category}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-[#062b2a] transition-colors">
                        {room.title}
                      </h3>
                      {room.description && (
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">
                          "{room.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="ml-auto flex flex-col items-end gap-1 w-full text-right">
                        {room.isLive && (
                          <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                            LIVE
                          </span>
                        )}
                        {room.isMember && (
                          <span className="px-3 py-1 bg-[#062b2a] text-[#10b981] text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                            MEMBER
                          </span>
                        )}
                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${room.isPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {room.isPublic ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                    </div>
                  </div>

                  <Link
                    href={room.isMember ? `/room/${room.id}` : room.isPublic ? `/room/${room.id}` : `/subscribe/${room.id}`}
                    className={`block w-full text-center px-4 py-3 sm:py-3.5 text-white rounded-[1.5rem] font-black text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl uppercase ${room.isMember ? 'bg-[#10b981] text-[#062b2a] hover:bg-[#0ea5e9]' : 'bg-[#062b2a] hover:bg-[#000]'}`}
                  >
                    {room.isMember ? 'Enter Room' : room.isPublic ? 'Orchestrate Entry' : 'Secure Access'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
