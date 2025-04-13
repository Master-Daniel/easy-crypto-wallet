import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotifyGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotifyGateway.name);
  private lastSentData: any[] = []; // Initialize as an empty array

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
      client.emit('market-data', data); // Send the array of objects
      console.log(`Sent cached data to client: ${client.id}`);
    } else {
      console.warn('No cached market data available.');
    }
  }

  emitData(event: string, data: any) {
    this.server.emit(event, data); // Emit the array of objects to all clients
    console.log(`Emitted data to all connected clients: ${event}`);
  }

  // Cron job to emit market data every 5 seconds
  @Cron('*/5 * * * * *') // every 5 seconds
  async handleCron() {
    const data = await this.cacheManager.get('elite_coin_market_data');

    if (Array.isArray(data)) {
      const hasChanged =
        JSON.stringify(data) !== JSON.stringify(this.lastSentData);

      if (hasChanged) {
        this.emitData('market-data', data);
        this.lastSentData = data;
        this.logger.log('Emitted new cached market data.');
      } else {
        this.logger.log('No change in market data, skipping emit.');
      }
    } else {
      this.logger.warn('Cached market data is not an array or is empty.');
    }
  }
}
