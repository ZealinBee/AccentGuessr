import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchesService } from './matches.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MatchesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly matchesService: MatchesService) {}
  private playerConnections = new Map<
    string,
    { matchCode: number; playerId: number }
  >();

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    const connectionInfo = this.playerConnections.get(socket.id);
    if (connectionInfo) {
      const { matchCode, playerId } = connectionInfo;
      const match = await this.matchesService.removePlayerFromMatch(
        matchCode,
        playerId,
      );
      if (match) {
        this.server.to(`match_${matchCode}`).emit('player_left', match);
      }
      this.playerConnections.delete(socket.id);
    }
  }

  @SubscribeMessage('join_match')
  async onJoinMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: { matchCode: number; playerName: string; isGuest: boolean },
  ) {
    const { matchCode, playerName, isGuest } = payload;
    const match = await this.matchesService.joinRoom(
      matchCode,
      playerName,
      isGuest,
    );
    if (!match) {
      socket.emit('error', { message: 'Match not found' });
      return;
    }

    const player = match.matchPlayers.find(
      (p) => p.name === payload.playerName,
    );
    if (!player) {
      return;
    }
    await this.matchesService.assignOwnerIfNone(matchCode, player.id);
    const updatedMatch = await this.matchesService.findByCode(matchCode);
    if (!updatedMatch) {
      return;
    }
    this.playerConnections.set(socket.id, {
      matchCode: payload.matchCode,
      playerId: player.id,
    });
    await socket.join(`match_${matchCode}`);
    socket.emit('match_joined', {
      match: updatedMatch,
      isOwner: updatedMatch.ownerId === player?.id,
      playerId: player.id,
    });
    socket.broadcast.to(`match_${matchCode}`).emit('player_joined', match);
  }

  @SubscribeMessage('start_match')
  async onStartMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { matchCode: number },
  ) {
    const match = await this.matchesService.startMatch(payload.matchCode);
    if (!match) {
      socket.emit('error', { message: 'Match not found or cannot be started' });
      return;
    }
    this.server.to(`match_${payload.matchCode}`).emit('match_started', match);
  }

  @SubscribeMessage('confirm_guess')
  async onConfirmGuess(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      matchCode: number;
      guessLong: number;
      guessLat: number;
      score: number;
    },
  ) {
    const connectionInfo = this.playerConnections.get(socket.id);
    if (!connectionInfo) {
      socket.emit('error', {
        message: 'Player not found in connection records',
      });
      return;
    }
    const playerId = connectionInfo.playerId;
    const updatedMatch = await this.matchesService.confirmGuess(
      payload.matchCode,
      playerId,
      payload.guessLong,
      payload.guessLat,
      payload.score,
    );
    if (!updatedMatch) {
      socket.emit('error', { message: 'Match or player not found' });
      return;
    }
    this.server
      .to(`match_${payload.matchCode}`)
      .emit('guess_confirmed', updatedMatch);
  }
}
