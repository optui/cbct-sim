import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SourceService } from '../../services/source.service';
import { GenericSourceRead } from '../../interfaces/source';

@Component({
  selector: 'app-source-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5" *ngIf="source as src; else loading">
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="fw-bold display-6 mb-0">{{ src.name }}</h1>
          <p class="text-muted">Source Details</p>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="back()">
          <i class="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title text-muted mb-3"><i class="bi bi-info-circle me-2"></i>General Info</h5>
              <p><strong>Attached To:</strong> {{ src.attached_to }}</p>
              <p><strong>Particle:</strong> {{ src.particle }}</p>
              <p><strong>Energy:</strong> {{ src.energy.energy }} <span>{{ src.energy.unit }}</span></p>
              <p><strong>Activity:</strong> {{ src.activity }} <span>{{ src.unit }}</span></p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title text-muted mb-3"><i class="bi bi-crosshair2 me-2"></i>Position</h5>
              <p><strong>Focus Point:</strong> {{ src.focus_point.join(' ' + src.position.unit + ' x ') }} <span>{{ src.position.unit }}</span></p>
              <p><strong>Translation:</strong> {{ src.position.translation.join(' ' + src.position.unit + ' x ') }} <span>{{ src.position.unit }}</span></p>
              <p><strong>Size:</strong> {{ src.position.size.join(' ' + src.position.unit + ' x ') }} <span>{{ src.position.unit }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="container py-5 text-center text-muted">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Loading source details…</div>
      </div>
    </ng-template>
  `
})
export class SourceDetailComponent implements OnInit {
  source: GenericSourceRead | null = null;
  simulationId!: number;
  sourceName!: string;

  private readonly sourceService = inject(SourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.simulationId = Number(this.route.snapshot.paramMap.get('simId'));
    this.sourceName = this.route.snapshot.paramMap.get('name')!;

    this.sourceService.getSource(this.simulationId, this.sourceName).subscribe(data => {
      this.source = data;
    });
  }

  back(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}
