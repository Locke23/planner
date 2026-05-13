import {
  Controller, Post, Body, Get, UseGuards,
  HttpCode, HttpStatus, Req, Res, UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import { AuthService } from '../../infra/auth/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user: User = await this.commandBus.execute(
      new RegisterUserCommand(dto.email, dto.name, dto.password),
    );
    const { accessToken, refreshToken } = await this.authService.login(user.id, user.email.value);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    return { user: this.serializeUser(user), accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const { accessToken, refreshToken } = await this.authService.login(user.id, user.email.value);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    return { user: this.serializeUser(user), accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException('No refresh token');
    const payload = this.authService.verifyRefreshToken(token);
    const { accessToken, refreshToken } = await this.authService.refresh(payload.sub, payload.jti);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) {
      try {
        const payload = this.authService.verifyRefreshToken(token);
        await this.authService.logout(payload.sub, payload.jti);
      } catch { /* invalid token — still clear the cookie */ }
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() current: { userId: string }) {
    const user: User = await this.queryBus.execute(new GetCurrentUserQuery(current.userId));
    return this.serializeUser(user);
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
