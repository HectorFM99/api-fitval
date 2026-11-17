import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { GymClass } from './gym-class';
import { CreateClassDto } from './dto/create-class.dto';
import { ListClassesQueryDto } from './dto/list-classes-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { StaffGuard } from '../auth/staff.guard';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // GET /api/v1/classes (opcionalmente con ?activity=...)
  @Get()
  @Version('1')
  async findAll(@Query('activity') activity?: string): Promise<GymClass[]> {
    return this.classesService.findAll(activity);
  }

  // GET /api/v2/classes: paginación
  @Get()
  @Version('2')
  async findPage(
    @Query() dto: ListClassesQueryDto,
  ): Promise<{
    data: GymClass[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.classesService.findPage(dto);
  }

  // GET /api/v1/classes/:id
  @Get(':id')
  @Version('1')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GymClass> {
    return this.classesService.findOne(id);
  }

  // POST /api/v1/classes (Solo personal / staff)
  @Post()
  @Version('1')
  @UseGuards(AuthGuard, StaffGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClassDto: CreateClassDto): Promise<GymClass> {
    return this.classesService.create(createClassDto);
  }

  // DELETE /api/v1/classes/:id (Solo personal / staff)
  @Delete(':id')
  @Version('1')
  @UseGuards(AuthGuard, StaffGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<GymClass> {
    return this.classesService.remove(id);
  }
}
