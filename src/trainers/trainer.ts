// Así llega un monitor desde PostgreSQL (una fila por especialidad, del JOIN)
export interface TrainerRow {
  id: number;
  dni: string;
  name: string;
  email: string;
  photo_url: string | null;
  specialty: string | null;
}

// Así lo devuelve nuestra API
export interface Trainer {
  id: number;
  dni: string;
  name: string;
  email: string;
  photoUrl: string | null;
  specialties: string[];
}

// Convierte filas (una por especialidad) en un monitor con sus especialidades
export function toTrainer(rows: TrainerRow[]): Trainer {
  const first = rows[0];
  return {
    id: first.id,
    dni: first.dni,
    name: first.name,
    email: first.email,
    photoUrl: first.photo_url ?? null,
    specialties: rows
      .filter((row) => row.specialty !== null)
      .map((row) => row.specialty!),
  };
}
