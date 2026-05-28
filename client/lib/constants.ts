export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

export const QUERY_KEYS = {
  me:             () => ['auth', 'me'] as const,
  rooms:          () => ['rooms'] as const,
  room:           (id: string) => ['rooms', id] as const,
  roomMessages:   (id: string) => ['rooms', id, 'messages'] as const,
  sessions:       () => ['sessions'] as const,
  sessionsByRoom: (roomId: string) => ['sessions', 'room', roomId] as const,
  stats:          () => ['sessions', 'stats'] as const,
};
