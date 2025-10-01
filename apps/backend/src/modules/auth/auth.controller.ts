import { Controller, Get, HttpCode, Post, Query, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { Public } from './decorators/public.decorator';
import { AuthenticatedUser } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {}

  @Get('login')
  @Public()
  async login(@Res() res: Response, @Query('state') state = ''): Promise<void> {
    const url = await this.authService.getLoginUrl(state);
    res.redirect(url);
  }

  @Get('callback')
  @Public()
  async callback(@Query('code') code: string, @Res() res: Response): Promise<void> {
    if (!code) {
      throw new UnauthorizedException('Código inválido');
    }
    throw new UnauthorizedException('OIDC real no implementado en modo demo');
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ success: boolean }> {
    this.clearAuthCookie(res);
    await this.authService.logout();
    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return user;
  }

  @Get('dev-login')
  @Public()
  async devLogin(
    @Query('email') email = 'empleado@example.com',
    @Query('name') name = 'Empleado Demo',
    @Query('role') role: Role = Role.EMPLOYEE,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ token: string }> {
    const token = await this.authService.handleMockLogin(email, name, role);
    this.setAuthCookie(res, token);
    return { token };
  }

  private setAuthCookie(res: Response, token: string): void {
    const domain = this.config.get<string>('auth.cookieDomain');
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('app.nodeEnv') === 'production',
      domain,
      maxAge: 1000 * 60 * 60 * 12
    });
  }

  private clearAuthCookie(res: Response): void {
    const domain = this.config.get<string>('auth.cookieDomain');
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('app.nodeEnv') === 'production',
      domain
    });
  }
}
