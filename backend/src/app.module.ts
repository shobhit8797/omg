import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './ws-gateways/chat/chat.gateway';
import { UserManagerService } from './managers/user-manager/user-manager.service';
import { RoomManagerService } from './managers/room-manager/room-manager.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatGateway, UserManagerService, RoomManagerService],
})
export class AppModule {}
