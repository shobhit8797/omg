import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserManagerService } from 'src/managers/user-manager/user-manager.service';
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

  constructor(private readonly userManager: UserManagerService) {}

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Assuming the client sends their name upon connection
    client.on('join', (name: string) => {
      this.userManager.addUser(name, client);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.userManager.removeUser(client.id);
  }
}
