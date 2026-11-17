import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Trainer, TrainerRow, toTrainer } from './trainer';
import { CreateTrainerDto } from './dto/create-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly pool: Pool) {}

  // GET /api/v1/trainers/:id
  async findOne(id: number): Promise<Trainer> {
    const query = `
      SELECT t.id, t.dni, t.name, t.email, t.photo_url, s.name AS specialty
      FROM trainers t
      LEFT JOIN trainer_specialties ts ON ts.trainer_id = t.id
      LEFT JOIN specialties s ON s.id = ts.specialty_id
      WHERE t.id = $1
      ORDER BY s.id
    `;
    const result = await this.pool.query<TrainerRow>(query, [id]);

    if (result.rows.length === 0 || result.rows[0].id === null) {
      throw new NotFoundException(`Monitor con ID ${id} no encontrado`);
    }

    return toTrainer(result.rows);
  }

  // POST /api/v1/trainers (solo staff)
  async create(dto: CreateTrainerDto): Promise<Trainer> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Insertar el monitor
      const trainerResult = await client.query<{ id: number }>(
        `INSERT INTO trainers (dni, name, email)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [dto.dni, dto.name, dto.email],
      );
      const trainerId = trainerResult.rows[0].id;

      // 2. Para cada especialidad: comprobar que existe, y si no, lanzar 400
      for (const specialtyId of dto.specialtyIds) {
        const specialty = await client.query(
          'SELECT id FROM specialties WHERE id = $1',
          [specialtyId],
        );
        if (specialty.rows.length === 0) {
          await client.query('ROLLBACK');
          throw new BadRequestException(
            `No existe la especialidad ${specialtyId}`,
          );
        }

        // 3. Insertar en la tabla intermedia
        await client.query(
          'INSERT INTO trainer_specialties (trainer_id, specialty_id) VALUES ($1, $2)',
          [trainerId, specialtyId],
        );
      }

      // 4. COMMIT y devolver el monitor creado
      await client.query('COMMIT');

      return this.findOne(trainerId);
    } catch (error) {
      await client.query('ROLLBACK');

      // Si es error de clave ajena duplicada (23505), responder 409
      const pgError = error as { code?: string };
      if (pgError.code === '23505') {
        throw new ConflictException('El DNI o el correo ya están registrados');
      }

      throw error;
    } finally {
      client.release();
    }
  }

  // POST /api/v1/trainers/:id/photo
  async setPhoto(id: number, photoUrl: string): Promise<Trainer> {
    const result = await this.pool.query<{ id: number }>(
      `UPDATE trainers SET photo_url = $1 WHERE id = $2 RETURNING id`,
      [photoUrl, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Monitor con ID ${id} no encontrado`);
    }

    return this.findOne(id);
  }
}
