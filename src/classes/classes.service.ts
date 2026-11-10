import { Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { GymClass, GymClassRow, toGymClass } from './gym-class';

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
}
