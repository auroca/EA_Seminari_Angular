import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organizacion } from '../models/organizacion.model';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =========================
  // ORGANIZACIONES
  // =========================

  getOrganizaciones(): Observable<{ organizaciones: Organizacion[] }> {
    return this.http.get<{ organizaciones: Organizacion[] }>(
      `${this.baseUrl}/organizaciones`
    );
  }

  getOrganizacionById(organizacionId: string): Observable<{ organizacion: Organizacion }> {
    return this.http.get<{ organizacion: Organizacion }>(
      `${this.baseUrl}/organizaciones/${organizacionId}`
    );
  }

  createOrganizacion(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/organizaciones`, { name });
  }

  updateOrganizacion(organizacionId: string, name: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/organizaciones/${organizacionId}`, { name });
  }

  deleteOrganizacion(organizacionId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/organizaciones/${organizacionId}`);
  }

  // =========================
  // USUARIOS
  // =========================

  getUsuarios(): Observable<{ usuarios: Usuario[] }> {
  return this.http.get<{ usuarios: Usuario[] }>(`${this.baseUrl}/usuarios`);
}

  getUsuarioById(usuarioId: string): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(
      `${this.baseUrl}/usuarios/${usuarioId}`
    );
  }

  createUsuario(name: string, organizacion: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, { name, organizacion });
  }

  updateUsuario(usuarioId: string, name: string, organizacion: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/usuarios/${usuarioId}`, { name, organizacion });
  }

  deleteUsuario(usuarioId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${usuarioId}`);
  }
}