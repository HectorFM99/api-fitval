import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@Controller('plans')
@ApiTags('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los planes del gimnasio' })
  @ApiResponse({ status: 200, description: 'Lista de planes' })
  findAll() {
    return this.plansService.findAll();
  }
}
