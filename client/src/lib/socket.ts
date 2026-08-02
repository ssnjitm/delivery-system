import type { Socket } from 'socket.io-client'

// The backend does not expose a Socket.IO (or SSE) realtime endpoint yet,
// and nothing in the app subscribes to socket events. Until a realtime
// transport is added, opening a WebSocket only produces 404 noise in the
// console. This module therefore exposes a no-op stub that preserves the
// existing API surface without attempting a connection.

const noopSocket = {
  connected: false,
  on: () => noopSocket,
  off: () => noopSocket,
  emit: () => false,
  disconnect: () => noopSocket,
  connect: () => noopSocket,
} as unknown as Socket

let socket: Socket | null = null

export function connectSocket(_token: string): Socket {
  void _token
  socket = noopSocket
  return socket
}

export function disconnectSocket(): void {
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}