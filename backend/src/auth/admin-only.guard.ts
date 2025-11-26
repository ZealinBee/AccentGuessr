import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminOnlyGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly ADMIN_EMAIL = 'thenukezealot@gmail.com';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First verify JWT is valid
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Authentication required');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as { email?: string } | undefined;

    // Check if user email matches the admin email
    if (!user || user.email !== this.ADMIN_EMAIL) {
      throw new UnauthorizedException(
        'Access denied: Admin privileges required',
      );
    }

    return true;
  }
}
