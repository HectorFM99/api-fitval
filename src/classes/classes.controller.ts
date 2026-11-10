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
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { GymClass } from './gym-class';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // GET /api/classes (opcionalmente con ?activity=...)
  @Get()
  async findAll(@Query('activity') activity?: string): Promise<GymClass[]> {
    return this.classesService.findAll(activity);
  }

  // GET /api/classes/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GymClass> {
    return this.classesService.findOne(id);
  }

  // POST /api/classes
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClassDto: CreateClassDto): Promise<GymClass> {
    return this.classesService.create(createClassDto);
  }

  // DELETE /api/classes/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<GymClass> {
    return this.classesService.remove(id);
  }
}
