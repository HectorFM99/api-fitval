import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Pool } from 'pg';

@Controller()
@ApiTags('health')
export class AppController {
  constructor(private readonly pool: Pool) {}

  // GET /api/health: ¿está viva la API? ¿y la base de datos?
  @Get('health')
  @ApiOperation({ summary: 'Comprobar el estado de la API y la base de datos' })
  @ApiResponse({ status: 200, description: 'API y base de datos funcionando' })
  async health() {
    const result = await this.pool.query<{ database: string }>(
      'SELECT current_database() AS database',
    );
    return { status: 'ok', database: result.rows[0].database };
  }
}
