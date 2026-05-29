'use client';
import { Room } from '@/types/room';
import { RoomCard } from './RoomCard';
import { Spinner } from '@/components/ui/Spinner';

interface Props { rooms?: Room[]; isLoading?: boolean; emptyText?: string }

export const RoomList = ({ rooms, isLoading, emptyText = 'No rooms found.' }: Props) => {
  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
  if (!rooms?.length) return (
    <div className="rounded-2xl border-2 border-dashed border-brand-border p-14 text-center">
      <p className="text-sm font-bold text-brand-black/40">{emptyText}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => <RoomCard key={room._id} room={room} />)}
    </div>
  );
};
