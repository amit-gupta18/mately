'use client';
import { useUIStore } from '@/store/uiStore';
import { useGetRooms } from '@/hooks/useRooms';
import { RoomList } from '@/components/dashboard/RoomList';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { Button } from '@/components/ui/Button';

export default function BrowseRoomsPage() {
  const { isCreateRoomModalOpen, openCreateRoomModal, closeCreateRoomModal } = useUIStore();
  const { data: rooms, isLoading } = useGetRooms();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Browse Rooms</h2>
          <p className="text-sm text-gray-400 mt-1">Join an existing room or create your own</p>
        </div>
        <Button onClick={openCreateRoomModal}>+ New Room</Button>
      </div>
      <RoomList rooms={rooms} isLoading={isLoading} emptyText="No rooms available. Create the first one!" />
      <CreateRoomModal isOpen={isCreateRoomModalOpen} onClose={closeCreateRoomModal} />
    </div>
  );
}
