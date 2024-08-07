import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '../room-manager/room-manager.service';
import { Socket } from 'socket.io';

export interface User {
  socket: Socket;
  name: string;
}

@Injectable()
export class UserManagerService {
  private users: User[] = [];
  private queue: string[] = [];

  constructor(private readonly roomManager: RoomManagerService) {}

  addUser(name: string, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    console.log('this.queue', this.queue, this.queue.length);
    
    socket.emit('lobby');
    this.clearQueue();
    this.initHandlers(socket);
  }

  removeUser(socketId: string) {
    this.users = this.users.filter((user) => user.socket.id !== socketId);
    this.queue = this.queue.filter((id) => id !== socketId);
  }

  private clearQueue() {
    if (this.queue.length < 2) return;

    const id1 = this.queue.pop();
    const id2 = this.queue.pop();
    const user1 = this.users.find((user) => user.socket.id === id1);
    const user2 = this.users.find((user) => user.socket.id === id2);

    if (user1 && user2) {
      this.roomManager.createRoom(user1, user2);
    }

    this.clearQueue();
  }

  private initHandlers(socket: Socket) {
    socket.on('offer', ({ sdp, roomId }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    });

    socket.on('answer', ({ sdp, roomId }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    });

    socket.on('add-ice-candidate', ({ candidate, roomId, type }) => {
      this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
    });
  }
}
