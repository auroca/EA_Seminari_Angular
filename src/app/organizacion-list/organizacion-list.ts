import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../posts/api.service';
import { Organizacion } from '../models/organizacion.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-organizacion-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organizacion-list.html',
  styleUrls: ['./organizacion-list.css'],
})
export class OrganizacionList implements OnInit {
  organizaciones: Organizacion[] = [];
  loading = true;
  errorMsg = '';
  // Variable para controlar la visibilidad del formulario
  mostrarForm = false;
  organizacionForm!: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.organizacionForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  //Función: leer
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getOrganizaciones().subscribe({
      next: (res) => {
        this.organizaciones = res?.organizaciones ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se han podido cargar las organizaciones.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  trackById(_index: number, org: Organizacion): string {
    return org._id;
  }

  //Función: crear
  mostrarFormulario(): void {
  this.mostrarForm = true;
}

guardar(): void {
  if (this.organizacionForm.invalid) return;

  this.loading = true;
  this.errorMsg = '';

  this.api.createOrganizacion(this.organizacionForm.value.nombre).subscribe({
    next: () => {
      this.mostrarForm = false;
      this.organizacionForm.reset();
      this.load();
    },
    error: () => {
      this.errorMsg = 'No se ha podido crear la organización.';
    }
  });
}

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;

    this.api.deleteOrganizacion(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
      }
    });
  }
}