import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { Inject, Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotifyGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotifyGateway.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    console.log('✅ NotifyGateway constructed');
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const data = await this.cacheManager.get('elite_coin_market_data');
    if (data) {
      client.emit('market-data', data);
      console.log(`Sent cached data to client: ${client.id}`);
    } else {
      console.warn('No cached market data available.');
    }
  }

  emitData(event: string, data: any) {
    this.server.emit(event, data);
    console.log(`Emitted data to all connected clients: ${event}`);
  }
}
