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

    <div class="card shadow-sm">
        <div class="card-body px-5 py-4">
        <dl class="row mb-0">
            <dt class="col-sm-3">Attached To</dt>
            <dd class="col-sm-9">{{ src.attached_to }}</dd>

            <dt class="col-sm-3">Particle</dt>
            <dd class="col-sm-9">{{ src.particle }}</dd>

            <dt class="col-sm-3">Energy</dt>
            <dd class="col-sm-9">{{ src.energy.energy }} {{ src.energy.unit }}</dd>

            <dt class="col-sm-3">Activity</dt>
            <dd class="col-sm-9">{{ src.activity }} {{ src.unit }}</dd>

            <dt class="col-sm-3">Focus Point</dt>
            <dd class="col-sm-9">{{ src.focus_point.join(' × ') }}</dd>

            <dt class="col-sm-3">Position (Translation)</dt>
            <dd class="col-sm-9">{{ src.position.translation.join(' × ') }} {{ src.position.unit }}</dd>

            <dt class="col-sm-3">Size</dt>
            <dd class="col-sm-9">{{ src.position.size.join(' × ') }} {{ src.position.unit }}</dd>
        </dl>
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
