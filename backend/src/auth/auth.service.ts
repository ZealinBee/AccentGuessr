import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../user/user.service';

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
type UserResult = Awaited<ReturnType<UserService['findByEmail']>>;

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async verifyGoogleToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) throw new UnauthorizedException('Invalid Google token');

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
    };
  }

  async loginWithGoogle(idToken: string, games: GameCreateInput) {
    const googleUser = await this.verifyGoogleToken(idToken);
    if (!googleUser.email)
      throw new UnauthorizedException('Google token missing email');
    const email = googleUser.email;

    let user: UserResult | null = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.createOne({
        email: googleUser.email,
        name: googleUser.name ?? null,
        picture: googleUser.picture ?? null,
        games: games
          ? {
              create: [
                {
                  totalScore: games.totalScore,
                  rounds: games.rounds
                    ? {
                        create: games.rounds.map((round) => ({
                          score: round.score,
                          guessLat: round.guessLat,
                          guessLong: round.guessLong,
                          speaker: {
                            connect: { id: round.speakerId },
                          },
                        })),
                      }
                    : undefined,
                },
              ],
            }
          : undefined,
      });
    }

    if (!user) throw new UnauthorizedException('Failed to get or create user');

    const payload = { sub: user.id, email: user.email, username: user.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }
}
