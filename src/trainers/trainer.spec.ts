import { TrainerRow, toTrainer } from './trainer';

describe('toTrainer', () => {
  it('junta las especialidades de varias filas en un solo monitor', () => {
    const rows: TrainerRow[] = [
      {
        id: 1,
        dni: '90000001J',
        name: 'Carla Navarro',
        email: 'carla@gym.com',
        photo_url: null,
        specialty: 'Ciclo indoor',
      },
      {
        id: 1,
        dni: '90000001J',
        name: 'Carla Navarro',
        email: 'carla@gym.com',
        photo_url: null,
        specialty: 'Fuerza',
      },
    ];

    const trainer = toTrainer(rows);

    expect(trainer).toEqual({
      id: 1,
      dni: '90000001J',
      name: 'Carla Navarro',
      email: 'carla@gym.com',
      photoUrl: null,
      specialties: ['Ciclo indoor', 'Fuerza'],
    });
  });
});
