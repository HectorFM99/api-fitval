import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Post as PostMethod,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { Trainer } from './trainer';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { StaffGuard } from '../auth/staff.guard';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  // GET /api/v1/trainers/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Trainer> {
    return this.trainersService.findOne(id);
  }

  // POST /api/v1/trainers (solo personal / staff)
  @Post()
  @UseGuards(AuthGuard, StaffGuard)
  async create(@Body() dto: CreateTrainerDto): Promise<Trainer> {
    return this.trainersService.create(dto);
  }

  // POST /api/v1/trainers/:id/photo (solo personal / staff)
  @Post(':id/photo')
  @UseGuards(AuthGuard, StaffGuard)
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body('photoUrl') photoUrl: string,
  ): Promise<Trainer> {
    return this.trainersService.setPhoto(id, photoUrl);
  }
}
