import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../posts/api.service';
import { Usuario } from '../models/usuario.model';
import { Organizacion } from '../models/organizacion.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-list.html',
  styleUrls: ['./usuario-list.css'],
})
export class UsuarioList implements OnInit {
  usuarios: Usuario[] = [];
  organizaciones: Organizacion[] = [];
  loading = false;
  errorMsg = '';
  mostrarForm = false;
  usuarioForm!: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.usuarioForm = this.fb.group({
      name: ['', Validators.required],
      organizacion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();
    this.loadOrganizaciones();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res?.usuarios ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'No se han podido cargar los usuarios.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  trackById(_index: number, u: Usuario): string {
    return u._id;
  }

  organizacionLabel(u: Usuario): string {
    const org = u.organizacion;
    if (!org) return '-';
    if (typeof org === 'string') return org; 
    return (org as Organizacion).name ?? '-';
  }

   mostrarFormulario(): void {
  this.mostrarForm = true;
}

loadOrganizaciones(): void {
  this.api.getOrganizaciones().subscribe({
    next: (res) => this.organizaciones = res?.organizaciones ?? [],
    error: (err) => console.error(err)
  });
}

guardar(): void {
  if (this.usuarioForm.invalid) return;

  const payload = {
    name: this.usuarioForm.value.name,
    organizacion: this.usuarioForm.value.organizacion 
  };
  this.api.createUsuario(payload.name, payload.organizacion).subscribe({
    next: () => {
      this.mostrarForm = false;
      this.usuarioForm.reset();
      this.load();
    },
    error: (err) => {
      console.error('Error backend:', err.error);
      this.errorMsg = 'No se ha podido crear el usuario.';
    }
  });
}
}
