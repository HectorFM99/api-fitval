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
