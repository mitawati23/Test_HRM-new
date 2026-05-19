import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { getErrorMessage } from '../common/utils/error.util';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @GetUser() user: { id: string; name: string; email: string; role: string },
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: user,
    });
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res() res: Response,
  ) {
    if (process.env.ALLOW_PUBLIC_REGISTER !== 'true') {
      throw new ForbiddenException('Public registration is disabled');
    }

    try {
      const result = await this.authService.register(registerDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: getErrorMessage(error),
      });
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.login(loginDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: getErrorMessage(error),
      });
    }
  }
}
