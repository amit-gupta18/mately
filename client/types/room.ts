export interface Room {
  _id: string;
  name: string;
  description?: string;
  owner: { _id: string; name: string; avatar?: string };
  participants: { _id: string; name: string; avatar?: string }[];
  isPrivate: boolean;
  maxParticipants: number;
  createdAt: string;
}
