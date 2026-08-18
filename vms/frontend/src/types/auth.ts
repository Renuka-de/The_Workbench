export type Role = 'VENDOR' | 'CONTRACTOR' | 'PROJECT_MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthSession {
  user: User;
  token: string;
}
