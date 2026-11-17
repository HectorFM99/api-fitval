import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { ClassesService } from './classes.service';

// Una fila de clase como la devuelve el JOIN. La usarás en varios tests
const spinningRow = {
  id: 1,
  activity: 'Spinning',
  room: 'Sala 1',
  starts_at: new Date('2026-11-02T09:00:00Z'),
  spots: 12,
  trainer_name: 'Carla Navarro',
};

describe('ClassesService', () => {
  // Un Pool FALSO: tiene un método query, pero no habla con PostgreSQL
  const fakePool = { query: jest.fn() };
  const service = new ClassesService(fakePool as unknown as Pool);

  beforeEach(() => {
    fakePool.query.mockReset(); // antes de cada test, el falso empieza de cero
  });

  it('findOne lanza un 404 si no hay ninguna fila', async () => {
    fakePool.query.mockResolvedValue({ rows: [] }); // "la base de datos no encuentra nada"

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('findOne devuelve la clase convertida cuando la base de datos encuentra una fila', async () => {
    fakePool.query.mockResolvedValue({ rows: [spinningRow] });

    const gymClass = await service.findOne(1);

    expect(gymClass).toEqual({
      id: 1,
      activity: 'Spinning',
      room: 'Sala 1',
      startsAt: new Date('2026-11-02T09:00:00Z'),
      spots: 12,
      trainerName: 'Carla Navarro',
    });
  });

  it('create con un monitor que no existe lanza BadRequestException y no hace el INSERT', async () => {
    // El SELECT de trainers devuelve vacío: no existe el monitor
    fakePool.query.mockResolvedValue({ rows: [] });

    await expect(
      service.create({
        activity: 'Fuerza',
        room: 'Sala 3',
        startsAt: '2026-11-10T18:00:00Z',
        spots: 15,
        trainerId: 99,
      }),
    ).rejects.toThrow(BadRequestException);

    // Solo se ha hecho una consulta (el SELECT de comprobación), no el INSERT
    expect(fakePool.query).toHaveBeenCalledTimes(1);
  });

  it('remove lanza ConflictException si la clase tiene reservas y nunca llega al DELETE', async () => {
    // 1.ª consulta: findOne encuentra la clase
    // 2.ª consulta: el COUNT dice que tiene 3 reservas
    fakePool.query
      .mockResolvedValueOnce({ rows: [spinningRow] })
      .mockResolvedValueOnce({ rows: [{ total: 3 }] });

    await expect(service.remove(1)).rejects.toThrow(ConflictException);

    // Nunca llega al DELETE: solo se han hecho 2 consultas
    expect(fakePool.query).toHaveBeenCalledTimes(2);
  });

  it('remove de una clase sin reservas: devuelve la clase y hace 3 consultas', async () => {
    // 1.ª: findOne encuentra la clase
    // 2.ª: el COUNT dice 0 reservas
    // 3.ª: el DELETE
    fakePool.query
      .mockResolvedValueOnce({ rows: [spinningRow] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })
      .mockResolvedValueOnce({ rows: [spinningRow] });

    const result = await service.remove(1);

    expect(result.id).toBe(1);
    expect(fakePool.query).toHaveBeenCalledTimes(3);
    expect(fakePool.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('DELETE'),
      [1],
    );
  });

  it('findPage devuelve total y totalPages', async () => {
    // 1.ª consulta: las clases de la página
    // 2.ª consulta: el COUNT total
    fakePool.query
      .mockResolvedValueOnce({ rows: [spinningRow] })
      .mockResolvedValueOnce({ rows: [{ total: '7' }] });

    const page = await service.findPage({
      page: 1,
      limit: 3,
      sort: 'startsAt',
      order: 'asc',
    });

    expect(page.total).toBe(7);
    expect(page.totalPages).toBe(3);
    expect(page.data).toHaveLength(1);
    EXPECT_TRAINER_NAME_PLACEHOLDER('Carla Navarro');
  });
});
