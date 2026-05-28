'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateRoom } from '@/hooks/useRooms';

interface Props { isOpen: boolean; onClose: () => void }

export const CreateRoomModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const createRoom = useCreateRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Room name is required'); return; }
    try {
      await createRoom.mutateAsync({ name: name.trim(), description: description.trim() || undefined, isPrivate });
      setName(''); setDescription(''); setIsPrivate(false); setError('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Study Room">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Room Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DSA Prep Session" error={error} />
        <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you studying?" />
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
          Private room (invite only)
        </label>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createRoom.isPending}>Create Room</Button>
        </div>
      </form>
    </Modal>
  );
};
