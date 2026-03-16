import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Usuario } from '../models/usuario.model';
import { Organizacion } from '../models/organizacion.model';
import { UsuarioService } from '../services/usuario.service';
import { OrganizacionService } from '../services/organizacion.service';

@Component({
  selector: 'app-organizacion-sync-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizacion-sync-users.html',
  styleUrls: ['./organizacion-sync-users.css'],
})
export class OrganizacionSyncUsers implements OnInit, OnChanges {
  @Input() organizacionId = '';

  usuariosEnOrganizacion: Usuario[] = [];
  usuariosDisponibles: Usuario[] = [];
  organizaciones: Organizacion[] = [];

  loading = true;
  errorMsg = '';
  successMsg = '';

  destinosSeleccionados: { [userId: string]: string } = {};

  constructor(
    private usuarioApi: UsuarioService,
    private organizacionApi: OrganizacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Sync ngOnInit organizacionId:', this.organizacionId);

    if (this.organizacionId) {
      this.cargarDatos();
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organizacionId']) {
      console.log('Sync ngOnChanges organizacionId:', this.organizacionId);
    }

    if (changes['organizacionId'] && this.organizacionId) {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    console.log('Sync cargarDatos INICIO con organizacionId:', this.organizacionId);

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.detectChanges();

    this.organizacionApi.getUsuariosByOrganizacion(this.organizacionId).subscribe({
      next: (usuariosOrg) => {
        console.log('Usuarios de la organización:', usuariosOrg);
        this.usuariosEnOrganizacion = usuariosOrg;

        this.usuarioApi.getUsuarios().subscribe({
          next: (todosUsuarios) => {
            console.log('Todos los usuarios:', todosUsuarios);

            this.organizacionApi.getOrganizaciones().subscribe({
              next: (orgs) => {
                console.log('Todas las organizaciones:', orgs);

                this.organizaciones = orgs;

                this.usuariosDisponibles = todosUsuarios.filter((u) => {
                  const orgId =
                    typeof u.organizacion === 'string'
                      ? u.organizacion
                      : u.organizacion?._id;

                  return orgId !== this.organizacionId;
                });

                this.loading = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error cargando organizaciones:', err);
                this.errorMsg = 'No se han podido cargar las organizaciones.';
                this.loading = false;
                this.cdr.detectChanges();
              },
            });
          },
          error: (err) => {
            console.error('Error cargando todos los usuarios:', err);
            this.errorMsg = 'No se han podido cargar los usuarios.';
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error('Error cargando usuarios de la organización:', err);
        this.errorMsg = 'No se han podido cargar los usuarios de la organización.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addUsuario(user: Usuario): void {
    if (!user.password || user.password.length < 6) {
      this.errorMsg = `No se puede añadir a ${user.name} porque el backend exige password en update y este usuario no la trae en la respuesta.`;
      this.cdr.detectChanges();
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.detectChanges();

    this.usuarioApi
      .updateUsuario(
        user._id,
        user.name,
        user.email,
        user.password,
        this.organizacionId
      )
      .subscribe({
        next: () => {
          this.successMsg = `Usuario ${user.name} añadido correctamente.`;
          this.cdr.detectChanges();
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error añadiendo usuario:', err);
          this.errorMsg = `No se ha podido añadir a ${user.name}.`;
          this.cdr.detectChanges();
        },
      });
  }

  removeUsuario(user: Usuario): void {
    const destinoId = this.destinosSeleccionados[user._id];

    if (!destinoId) {
      this.errorMsg = `Selecciona una organización de destino para quitar a ${user.name}.`;
      this.cdr.detectChanges();
      return;
    }

    if (!user.password || user.password.length < 6) {
      this.errorMsg = `No se puede mover a ${user.name} porque el backend exige password en update y este usuario no la trae en la respuesta.`;
      this.cdr.detectChanges();
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';
    this.cdr.detectChanges();

    this.usuarioApi
      .updateUsuario(
        user._id,
        user.name,
        user.email,
        user.password,
        destinoId
      )
      .subscribe({
        next: () => {
          this.successMsg = `Usuario ${user.name} quitado de la organización actual.`;
          this.cdr.detectChanges();
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error quitando usuario:', err);
          this.errorMsg = `No se ha podido quitar a ${user.name}.`;
          this.cdr.detectChanges();
        },
      });
  }

  nombreOrganizacion(user: Usuario): string {
    const orgId =
      typeof user.organizacion === 'string'
        ? user.organizacion
        : user.organizacion?._id;

    const org = this.organizaciones.find((o) => o._id === orgId);
    return org ? org.name : '-';
  }

  organizacionesDestino(): Organizacion[] {
    return this.organizaciones.filter((o) => o._id !== this.organizacionId);
  }
}