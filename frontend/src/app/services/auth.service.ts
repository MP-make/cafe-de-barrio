import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://cafe-de-barrio.onrender.com/api/auth';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // --- NUEVO: MÉTODO DE REGISTRO AÑADIDO ---
  register(userData: any): Observable<any> {
    // responseType: 'text' es vital aquí porque Java nos va a responder con un mensaje de texto ("Usuario registrado") y no con un JSON.
    return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (Date.now() / 1000 > exp) {
        this.logout(); // Token expirado, hacer logout
        return false;
      }
      return true;
    } catch (e) {
      this.logout(); // Token inválido, hacer logout
      return false;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}