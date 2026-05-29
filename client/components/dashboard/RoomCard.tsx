'use client';
import Link from 'next/link';
import { Room } from '@/types/room';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export const RoomCard = ({ room }: { room: Room }) => (
  <Link href={`/dashboard/rooms/${room._id}`} className="group block rounded-2xl border-2 border-brand-border bg-brand-white p-5 hover:border-brand-black hover:shadow-[4px_4px_0px_#0A0A0A] transition-all">
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-black text-brand-black line-clamp-1 group-hover:text-brand-black">{room.name}</h3>
      <Badge label={room.isPrivate ? 'Private' : 'Public'} variant={room.isPrivate ? 'warning' : 'success'} />
    </div>
    {room.description && (
      <p className="text-sm text-brand-black/50 line-clamp-2 mb-4">{room.description}</p>
    )}
    <div className="flex items-center justify-between text-xs text-brand-black/40 font-medium">
      <div className="flex items-center gap-1.5">
        <Avatar name={room.owner.name} avatar={room.owner.avatar} size="sm" />
        <span>{room.owner.name}</span>
      </div>
      <span className="font-bold text-brand-black/60">{room.participants.length}/{room.maxParticipants}</span>
    </div>
  </Link>
);
