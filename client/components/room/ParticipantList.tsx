'use client';
import { useRoomStore } from '@/store/roomStore';
import { Avatar } from '@/components/ui/Avatar';

export const ParticipantList = () => {
  const { participants } = useRoomStore();
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-black uppercase tracking-widest text-brand-black/40">
        Online — {participants.length}
      </h3>
      <div className="flex flex-col gap-2">
        {participants.map((p) => (
          <div key={p._id} className="flex items-center gap-2">
            <div className="relative">
              <Avatar name={p.name} avatar={p.avatar} size="sm" />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 ring-2 ring-white" />
            </div>
            <span className="text-sm font-bold text-brand-black">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
