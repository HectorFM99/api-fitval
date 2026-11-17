import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TrainersService } from './trainers.service';
import { Trainer } from './trainer';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { StaffGuard } from '../auth/staff.guard';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return callback(
      new BadRequestException('El fichero debe ser una imagen (JPG o PNG)'),
      false,
    );
  }
  callback(null, true);
}

@Controller('trainers')
@ApiTags('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  // GET /api/v1/trainers/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un monitor con sus especialidades' })
  @ApiResponse({
    status: 200,
    description: 'El monitor con sus especialidades',
  })
  @ApiResponse({ status: 400, description: 'El id no es un número' })
  @ApiResponse({ status: 404, description: 'El monitor no existe' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Trainer> {
    return this.trainersService.findOne(id);
  }

  // POST /api/v1/trainers (solo personal / staff)
  @Post()
  @UseGuards(AuthGuard, StaffGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un monitor con sus especialidades (solo personal)',
  })
  @ApiResponse({ status: 201, description: 'Monitor creado' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o especialidad inexistente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No es personal del gimnasio' })
  @ApiResponse({
    status: 409,
    description: 'El DNI o el correo ya están registrados',
  })
  async create(@Body() dto: CreateTrainerDto): Promise<Trainer> {
    return this.trainersService.create(dto);
  }

  // POST /api/v1/trainers/:id/photo (solo personal / staff)
  @Post(':id/photo')
  @UseGuards(AuthGuard, StaffGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir la foto de un monitor (solo personal)' })
  @ApiResponse({
    status: 201,
    description: 'Foto subida y monitor actualizado',
  })
  @ApiResponse({ status: 400, description: 'Fichero inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No es personal del gimnasio' })
  @ApiResponse({ status: 404, description: 'El monitor no existe' })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Trainer> {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún fichero');
    }

    const photoUrl = `/uploads/${file.filename}`;
    return this.trainersService.setPhoto(id, photoUrl);
  }
}
