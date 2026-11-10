import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await argon2.hash(registerDto.password);

    const user = await this.usersService.create(
      registerDto.email,
      passwordHash,
      'member',
    );

    return user;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const userRow = await this.usersService.findByEmail(loginDto.email);
    if (!userRow) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await argon2.verify(
      userRow.password_hash,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: userRow.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    return { accessToken };
  }

  async getMe(userId: number): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
