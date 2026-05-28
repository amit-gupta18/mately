'use client';
import { Room } from '@/types/room';
import { RoomCard } from './RoomCard';
import { Spinner } from '@/components/ui/Spinner';

interface Props { rooms?: Room[]; isLoading?: boolean; emptyText?: string }

export const RoomList = ({ rooms, isLoading, emptyText = 'No rooms found.' }: Props) => {
  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Spinner size="lg" className="text-indigo-600" />
    </div>
  );
  if (!rooms?.length) return (
    <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
      {emptyText}
    </div>
  );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => <RoomCard key={room._id} room={room} />)}
    </div>
  );
};
