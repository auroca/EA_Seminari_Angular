import type { Organizacion } from './organizacion.model';

export interface Usuario {
  _id: string;
  name: string;
  email: string;
  password?: string;
  organizacion: Organizacion | string;
  createdAt?: string;
  updatedAt?: string;
}