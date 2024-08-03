import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ALLOWED_ORIGINS } from 'src/config';

@WebSocketGateway({
  cors: {
    origin: ALLOWED_ORIGINS,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string): void {
    client.join(room);
    client.to(room).emit('user-connected', client.id);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, room: string): void {
    client.leave(room);
    client.to(room).emit('user-disconnected', client.id);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  @SubscribeMessage('send-offer')
  handleOffer(client: Socket, payload: { room: string; offer: any }): void {
    client
      .to(payload.room)
      .emit('receive-offer', { sender: client.id, offer: payload.offer });
  }

  @SubscribeMessage('send-answer')
  handleAnswer(client: Socket, payload: { room: string; answer: any }): void {
    client
      .to(payload.room)
      .emit('receive-answer', { sender: client.id, answer: payload.answer });
  }

  @SubscribeMessage('send-ice-candidate')
  handleIceCandidate(
    client: Socket,
    payload: { room: string; candidate: any },
  ): void {
    client.to(payload.room).emit('receive-ice-candidate', {
      sender: client.id,
      candidate: payload.candidate,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
