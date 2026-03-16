import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrganizacionService } from '../services/organizacion.service';
import { Organizacion } from '../models/organizacion.model';
import { OrganizacionSyncUsers } from '../organizacion-sync-users/organizacion-sync-users';

@Component({
  selector: 'app-organizacion-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, OrganizacionSyncUsers],
  templateUrl: './organizacion-detail.html',
  styleUrls: ['./organizacion-detail.css'],
})
export class OrganizacionDetail implements OnInit {
  organizacion: Organizacion | null = null;
  loading = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private api: OrganizacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID de la organización:', id);

    if (!id) {
      this.errorMsg = 'No se ha encontrado el ID de la organización.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.api.getOrganizacionById(id).subscribe({
      next: (organizacion) => {
        console.log('Organización cargada:', organizacion);
        this.organizacion = organizacion;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando organización:', err);
        this.errorMsg = 'No se ha podido cargar el detalle de la organización.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}