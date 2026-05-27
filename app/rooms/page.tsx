import { Link } from 'next-view-transitions'
import { createClient } from '@/lib/supabase/server'

export default async function RoomsPage() {
  const supabase = createClient()

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

  // Fetch all rooms with their creators
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*, creator:users!rooms_creator_id_fkey(*)')
    .order('created_at', { ascending: false })

  // Format rooms for display
  const formattedRooms = (rooms || []).map(room => {
    // Check if user is a member (either creator or has active sub)
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
  }})

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tighter mb-1.5">Browse Rooms</h1>
            <p className="text-gray-500 font-medium italic text-sm sm:text-base">Discover live rooms from the sanctuary of creators.</p>
          </div>
          <Link
            href="/dashboard"
            className="self-start sm:self-auto px-5 py-2.5 bg-[#062b2a] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Dashboard
          </Link>
        </div>

        {formattedRooms.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 p-10 sm:p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-gray-400 font-medium text-lg mb-8">The sanctuary is currently silent.</p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-3 sm:py-3.5 bg-[#062b2a] text-white rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Create the First Room
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {formattedRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden"
              >
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{room.id.substring(0, 6)}</span>
                         <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">{room.category}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#062b2a] transition-colors line-clamp-2">
                        {room.title}
                      </h3>
                      {room.description && (
                        <p className="text-gray-500 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Link href={`/creator/${room.creator.id}`} className="group/creator flex items-center gap-4 flex-1">
                      {room.creator.imageUrl ? (
                        <img
                          src={room.creator.imageUrl}
                          alt={room.creator.name || 'Creator'}
                          className="w-12 h-12 rounded-xl object-cover shadow-sm border-2 border-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold">
                          {room.creator.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover/creator:text-[#062b2a] transition-colors">
                          {room.creator.name || 'Anonymous Creator'}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{room.creator.email.split('@')[0]}</p>
                      </div>
                    </Link>
                    <div className="ml-auto flex flex-col items-end gap-1">
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
