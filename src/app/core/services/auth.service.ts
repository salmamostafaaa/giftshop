import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  AuthResponse,
  LoginPayload,
  PublicUser,
  RegisterPayload,
  User,
} from '../models/user.model';

const USERS_KEY = 'giftshop_users';
const TOKEN_KEY = 'giftshop_token';
const CURRENT_USER_KEY = 'giftshop_current_user';

/**
 * AuthService.
 *
 * Note on the "API": the public APIs allowed for this project (Makeup API,
 * TheMealDB, JSONPlaceholder) don't provide real authentication — JSONPlaceholder's
 * POST endpoints accept requests but never actually persist anything, and the
 * Makeup API has no user system at all. So authentication here is implemented
 * as a small local "backend" persisted in localStorage, with an artificial
 * network delay via RxJS so the rest of the app (loading states, disabled
 * buttons, etc.) behaves exactly as it would against a real HTTP API.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<PublicUser | null>(this.readCurrentUser());
  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  register(payload: RegisterPayload): Observable<AuthResponse> {
    const users = this.readUsers();

    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      return throwError(() => new Error('An account with this email already exists.')).pipe(delay(500));
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password, // demo-only mock store; never do this with real passwords
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const response = this.buildAuthResponse(newUser);
    return of(response).pipe(delay(600));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    const users = this.readUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.password === payload.password
    );

    if (!found) {
      return throwError(() => new Error('Invalid email or password.')).pipe(delay(500));
    }

    const response = this.buildAuthResponse(found);
    return of(response).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private buildAuthResponse(user: User): AuthResponse {
    const publicUser: PublicUser = { id: user.id, fullName: user.fullName, email: user.email };
    // Fake JWT-shaped token so it "looks" like a real bearer token in devtools/network tab.
    const token = btoa(`${user.id}.${Date.now()}.${Math.random().toString(36).slice(2)}`);

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));

    this.tokenSignal.set(token);
    this.currentUserSignal.set(publicUser);

    return { token, user: publicUser };
  }

  private readUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  }

  private readCurrentUser(): PublicUser | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  }
}
