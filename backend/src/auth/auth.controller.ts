import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
type RoundInput = {
  score: number;
  guessLat: number;
  guessLong: number;
  speakerId: number;
};

type GameCreateInput = {
  totalScore: number;
  rounds?: RoundInput[];
};
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Accepts { idToken, game } in the request body. `game` is optional but passed through to the service.
  @Post('google')
  async googleLogin(
    @Body('idToken') idToken: string,
    @Body('games') games: GameCreateInput,
  ) {
    return this.authService.loginWithGoogle(idToken, games);
  }
}
