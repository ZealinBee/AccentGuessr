import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  private userServiceRef: unknown;

  constructor(
    private jwtService: JwtService,
    userService: UserService,
  ) {
    this.userServiceRef = userService;
  }

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

  async loginWithGoogle(idToken: string) {
    const googleUser = await this.verifyGoogleToken(idToken);
    // Ensure email is present (verifyGoogleToken should provide it)
    if (!googleUser.email)
      throw new UnauthorizedException('Google token missing email');
    const email = googleUser.email;

    const us = this.userServiceRef as UserService;
    let user = await us.findByEmail(email);
    if (!user) {
      user = await us.createOne({
        email: googleUser.email,
        name: googleUser.name ?? null,
        picture: googleUser.picture ?? null,
      });
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { accessToken, user };
  }
}
