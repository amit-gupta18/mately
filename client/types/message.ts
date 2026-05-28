export interface Message {
  _id: string;
  room: string;
  sender: { _id: string; name: string; avatar?: string };
  text: string;
  createdAt: string;
}
