'use client';
import Link from 'next/link';
import { Room } from '@/types/room';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export const RoomCard = ({ room }: { room: Room }) => (
  <Link href={`/dashboard/rooms/${room._id}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-semibold text-gray-900 line-clamp-1">{room.name}</h3>
      <Badge label={room.isPrivate ? 'Private' : 'Public'} variant={room.isPrivate ? 'warning' : 'success'} />
    </div>
    {room.description && (
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{room.description}</p>
    )}
    <div className="flex items-center justify-between text-xs text-gray-400">
      <div className="flex items-center gap-1.5">
        <Avatar name={room.owner.name} avatar={room.owner.avatar} size="sm" />
        <span>{room.owner.name}</span>
      </div>
      <span>{room.participants.length}/{room.maxParticipants} members</span>
    </div>
  </Link>
);
