import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload';
import { UsersService } from '../users/users.service';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const payload = request.user;

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('No autorizado');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || user.role !== 'staff') {
      throw new ForbiddenException('Solo para el personal del gimnasio');
    }

    return true;
  }
}
