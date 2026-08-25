export interface User {
  id: string;
  fullName: string;
  email: string;
  /** Stored only in the local mock "database" — never rendered anywhere. */
  password: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
