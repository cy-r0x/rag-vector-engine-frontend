export type SocketTokenInfo = { prefix: string; created_at: string };

export type SocketInfo = { business_id: string; ws_url: string; token: SocketTokenInfo | null };

export type IssuedSocketToken = { token: string; prefix: string; created_at: string; ws_url: string };
