import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { GymClass, GymClassRow, toGymClass } from './gym-class';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly pool: Pool) {}

  // GET /api/classes (y con filtro ?activity=...)
  async findAll(activity?: string): Promise<GymClass[]> {
    let query = `
      SELECT c.id, c.activity, c.room, c.starts_at, c.spots, t.name AS trainer_name
      FROM classes c
      JOIN trainers t ON c.trainer_id = t.id
    `;
    const params: any[] = [];

    if (activity) {
      query += ` WHERE c.activity ILIKE $1`;
      params.push(`%${activity}%`);
    }

    query += ` ORDER BY c.starts_at`;

    const result = await this.pool.query<GymClassRow>(query, params);
    return result.rows.map(toGymClass);
  }

  // GET /api/classes/:id
  async findOne(id: number): Promise<GymClass> {
    const query = `
      SELECT c.id, c.activity, c.room, c.starts_at, c.spots, t.name AS trainer_name
      FROM classes c
      JOIN trainers t ON c.trainer_id = t.id
      WHERE c.id = $1
    `;
    const result = await this.pool.query<GymClassRow>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    return toGymClass(result.rows[0]);
  }

  // POST /api/classes
  async create(createClassDto: CreateClassDto): Promise<GymClass> {
    // Comprobar si el entrenador existe (devuelve 400 según las reglas de prueba)
    const trainerCheck = await this.pool.query(
      'SELECT id FROM trainers WHERE id = $1',
      [createClassDto.trainerId],
    );
    if (trainerCheck.rows.length === 0) {
      throw new BadRequestException(
        `Entrenador con ID ${createClassDto.trainerId} no encontrado`,
      );
    }

    const query = `
      WITH inserted AS (
        INSERT INTO classes (activity, room, starts_at, spots, trainer_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, activity, room, starts_at, spots, trainer_id
      )
      SELECT i.id, i.activity, i.room, i.starts_at, i.spots, t.name AS trainer_name
      FROM inserted i
      JOIN trainers t ON i.trainer_id = t.id
    `;

    const values = [
      createClassDto.activity,
      createClassDto.room,
      createClassDto.startsAt,
      createClassDto.spots,
      createClassDto.trainerId,
    ];

    const result = await this.pool.query<GymClassRow>(query, values);
    return toGymClass(result.rows[0]);
  }

  // DELETE /api/classes/:id
  async remove(id: number): Promise<GymClass> {
    // 1. Comprobar si la clase existe (404 si no existe)
    const classCheck = await this.pool.query(
      'SELECT id FROM classes WHERE id = $1',
      [id],
    );
    if (classCheck.rows.length === 0) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    // 2. Comprobar si tiene reservas (409 Conflict si tiene reservas)
    const bookingsCheck = await this.pool.query<{ total: number }>(
      'SELECT COUNT(*)::int AS total FROM bookings WHERE class_id = $1',
      [id],
    );
    const totalBookings = bookingsCheck.rows[0].total;
    if (totalBookings > 0) {
      throw new ConflictException(
        `No se puede borrar la clase porque tiene ${totalBookings} reserva(s) asociadas`,
      );
    }

    // 3. Borrar y devolver la clase borrada con el nombre del monitor
    const query = `
      WITH deleted AS (
        DELETE FROM classes WHERE id = $1
        RETURNING id, activity, room, starts_at, spots, trainer_id
      )
      SELECT d.id, d.activity, d.room, d.starts_at, d.spots, t.name AS trainer_name
      FROM deleted d
      JOIN trainers t ON d.trainer_id = t.id
    `;
    const result = await this.pool.query<GymClassRow>(query, [id]);
    return toGymClass(result.rows[0]);
  }
}
