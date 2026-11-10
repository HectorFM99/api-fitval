import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { User, UserRow, toUser } from './user';

@Injectable()
export class UsersService {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email],
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT id, email, password_hash, role FROM users WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return toUser(result.rows[0]);
  }

  async create(
    email: string,
    passwordHash: string,
    role = 'member',
  ): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash, role
    `;
    const result = await this.pool.query<UserRow>(query, [
      email,
      passwordHash,
      role,
    ]);
    return toUser(result.rows[0]);
  }
}
