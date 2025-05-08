import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { GenericSourceRead } from '../../interfaces/source';

@Component({
  standalone: true,
  selector: 'app-source-detail',
  imports: [CommonModule, NgIf, RouterModule],
  template: `
    <div class="container py-4" *ngIf="source; else loading">
      <button class="btn btn-outline-secondary mb-3" (click)="back()">← Back to sources</button>
      <h3 class="mb-3">Source: {{ source.name }}</h3>

      <div class="mb-3">
        <p><strong>Attached To:</strong> {{ source.attached_to }}</p>
        <p><strong>Particle Type:</strong> {{ source.particle }}</p>
      </div>

      <fieldset class="border p-3 rounded mb-3">
        <legend class="w-auto px-2">Position Configuration</legend>
        <p><strong>Type:</strong> {{ source.position.type }}</p>
        <p><strong>Translation:</strong> {{ source.position.translation.join(', ') }} {{ source.position.unit }}</p>
        <p><strong>Rotation:</strong> Axis {{ source.position.rotation.axis }}, Angle {{ source.position.rotation.angle }}°</p>
        <p><strong>Size:</strong> {{ source.position.size.join(' × ') }} {{ source.position.unit }}</p>
      </fieldset>

      <fieldset class="border p-3 rounded mb-3">
        <legend class="w-auto px-2">Direction Configuration</legend>
        <p><strong>Type:</strong> {{ source.direction.type }}</p>
        <p><strong>Focus Point:</strong> {{ source.direction.focus_point.join(', ') }}</p>
      </fieldset>

      <fieldset class="border p-3 rounded mb-3">
        <legend class="w-auto px-2">Energy Configuration</legend>
        <p><strong>Type:</strong> {{ source.energy.type }}</p>
        <p><strong>Energy:</strong> {{ source.energy.mono }} {{ source.energy.unit }}</p>
      </fieldset>

      <p><strong>Number of Particles:</strong> {{ source.n }}</p>
      <p *ngIf="source.activity">
        <strong>Activity:</strong> {{ source.activity }} {{ source.activity_unit }}
      </p>

      <div class="mt-4 d-flex gap-2">
        <button class="btn btn-primary" (click)="edit()">Edit</button>
        <button class="btn btn-outline-secondary" (click)="back()">← Back</button>
      </div>
    </div>

    <ng-template #loading>
      <div class="container py-4">
        <div class="alert alert-info text-center">Loading source details…</div>
      </div>
    </ng-template>
  `
})
export class SourceDetailComponent implements OnInit {
  simulationId!: number;
  sourceName!: string;
  source?: GenericSourceRead;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private svc: SourceService
  ) {}

  ngOnInit() {
    // Get simulation ID from parent route
    this.simulationId = Number(
      this.route.parent?.snapshot.paramMap.get('id') || 
      this.route.snapshot.paramMap.get('simId')
    );
    
    this.sourceName = decodeURIComponent(
      this.route.snapshot.paramMap.get('name')!
    );

    this.svc.get(this.simulationId, this.sourceName)
      .subscribe({
        next: (s) => this.source = s,
        error: (err) => console.error('Failed to load source:', err)
      });
  }

  edit() {
    this.router.navigate([`/simulations/${this.simulationId}/sources/${this.sourceName}/edit`]);
  }

  back() {
    this.router.navigate([`/simulations/${this.simulationId}/sources`]);
  }
}