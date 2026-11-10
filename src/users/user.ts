export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: 'member' | 'staff';
}

export interface User {
  id: number;
  email: string;
  role: 'member' | 'staff';
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
  };
}
