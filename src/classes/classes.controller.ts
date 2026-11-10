import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { GymClass } from './gym-class';

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
}
