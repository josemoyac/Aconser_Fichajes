import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Role, User } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async validateUserByJwt(payload: { sub: string }): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async handleMockLogin(email: string, name: string, role: Role = Role.EMPLOYEE): Promise<string> {
    const user = await this.usersService.ensureUserFromOidc({
      email,
      name,
      oidcSub: `mock-${email}`,
      role
    });
    return this.createToken(user);
  }

  createToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  }

  async getLoginUrl(state: string): Promise<string> {
    const provider = this.configService.get<string>('auth.provider');
    if (provider === 'mock') {
      return `/auth/dev-login?state=${state}`;
    }
    const issuer = this.configService.get<string>('auth.issuer');
    const clientId = this.configService.get<string>('auth.clientId');
    const redirectUri = this.configService.get<string>('auth.redirectUri');
    const scopes = encodeURIComponent(this.configService.get<string>('auth.scopes') ?? 'openid');
    return `${issuer}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_mode=query&scope=${scopes}&state=${state}`;
  }

  async logout(): Promise<void> {
    return;
  }

  async serializeUser(user: User): Promise<AuthenticatedUser> {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
