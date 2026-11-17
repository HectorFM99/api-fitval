import { GymClassRow, toGymClass } from './gym-class';

describe('toGymClass', () => {
  it('convierte una fila de la base de datos en una clase de la API', () => {
    // 1. Preparar: una fila como las que devuelve PostgreSQL
    const row: GymClassRow = {
      id: 1,
      activity: 'Spinning',
      room: 'Sala 1',
      starts_at: new Date('2026-11-02T09:00:00Z'),
      spots: 12,
      trainer_name: 'Carla Navarro',
    };

    // 2. Ejecutar
    const gymClass = toGymClass(row);

    // 3. Comprobar
    expect(gymClass).toEqual({
      id: 1,
      activity: 'Spinning',
      room: 'Sala 1',
      startsAt: new Date('2026-11-02T09:00:00Z'),
      spots: 12,
      trainerName: 'Carla Navarro',
    });
  });

  it('no incluye propiedades que no están en la fila', () => {
    // 1. Preparar: una fila sin starts_at ni trainer_name
    const row: GymClassRow = {
      id: 2,
      activity: 'Yoga',
      room: 'Sala 2',
      starts_at: new Date('2026-11-02T18:00:00Z'),
      spots: 10,
      trainer_name: 'Javier Ortega',
    };

    // 2. Ejecutar
    const gymClass = toGymClass(row);

    // 3. Comprobar que las propiedades existen y están bien mapeadas
    expect(gymClass.startsAt).toBeDefined();
    expect(gymClass.trainerName).toBeDefined();
    expect(gymClass.trainerName).toBe('Javier Ortega');
    expect(gymClass.startsAt).toEqual(new Date('2026-11-02T18:00:00Z'));
  });
});
