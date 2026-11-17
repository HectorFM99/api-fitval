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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { GymClass } from './gym-class';
import { CreateClassDto } from './dto/create-class.dto';
import { ListClassesQueryDto } from './dto/list-classes-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { StaffGuard } from '../auth/staff.guard';

@Controller('classes')
@ApiTags('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // GET /api/v1/classes (opcionalmente con ?activity=...)
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Listar clases (v1)' })
  @ApiResponse({ status: 200, description: 'Lista de clases' })
  async findAll(@Query('activity') activity?: string): Promise<GymClass[]> {
    return this.classesService.findAll(activity);
  }

  // GET /api/v2/classes: paginación
  @Get()
  @Version('2')
  @ApiOperation({ summary: 'Listar clases paginadas (v2)' })
  @ApiResponse({ status: 200, description: 'Página de clases' })
  async findPage(@Query() dto: ListClassesQueryDto): Promise<{
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
  @ApiOperation({ summary: 'Obtener una clase por su id (v1)' })
  @ApiResponse({ status: 200, description: 'La clase solicitada' })
  @ApiResponse({ status: 400, description: 'El id no es un número' })
  @ApiResponse({ status: 404, description: 'La clase no existe' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<GymClass> {
    return this.classesService.findOne(id);
  }

  // POST /api/v1/classes (Solo personal / staff)
  @Post()
  @Version('1')
  @UseGuards(AuthGuard, StaffGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una clase (solo personal)' })
  @ApiResponse({ status: 201, description: 'Clase creada' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o monitor inexistente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No es personal del gimnasio' })
  async create(@Body() createClassDto: CreateClassDto): Promise<GymClass> {
    return this.classesService.create(createClassDto);
  }

  // DELETE /api/v1/classes/:id (Solo personal / staff)
  @Delete(':id')
  @Version('1')
  @UseGuards(AuthGuard, StaffGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Borrar una clase (solo personal)' })
  @ApiResponse({ status: 200, description: 'Clase borrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No es personal del gimnasio' })
  @ApiResponse({ status: 404, description: 'La clase no existe' })
  @ApiResponse({ status: 409, description: 'La clase tiene reservas' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<GymClass> {
    return this.classesService.remove(id);
  }
}
