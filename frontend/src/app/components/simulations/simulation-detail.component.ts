import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SimulationService } from '../../services/simulation.service';
import { SimulationRead } from '../../interfaces/simulation';
import { VolumeListComponent } from "../volumes/volume-list.component";
import { SourceListComponent } from "../sources/source-list.component";

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [CommonModule, VolumeListComponent, SourceListComponent],
  template: `
    <div class="container py-5" *ngIf="simulation as sim; else loading">
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="fw-bold display-6 mb-1">{{ sim.name }}</h1>
          <p class="text-muted">Details for selected simulation</p>
        </div>
        <div class="d-flex">
          <button class="btn btn-secondary btn-sm" (click)="back()">
            <i class="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body px-5 py-4">
          <dl class="row mb-0">
            <dt class="col-sm-3 fw-semibold">Number of Runs</dt>
            <dd class="col-sm-9">{{ sim.num_runs }}</dd>

            <dt class="col-sm-3 fw-semibold">Run Length</dt>
            <dd class="col-sm-9">{{ sim.run_len }}</dd>

            <dt class="col-sm-3 fw-semibold">Actor - Attached To</dt>
            <dd class="col-sm-9">{{ sim.actor.attached_to }}</dd>

            <dt class="col-sm-3 fw-semibold">Actor - Spacing</dt>
            <dd class="col-sm-9">{{ sim.actor.spacing[0] }} × {{ sim.actor.spacing[1] }}</dd>

            <dt class="col-sm-3 fw-semibold">Actor - Size</dt>
            <dd class="col-sm-9">{{ sim.actor.size[0] }} × {{ sim.actor.size[1] }}</dd>

            <dt class="col-sm-3 fw-semibold">Actor - Origin Center?</dt>
            <dd class="col-sm-9">{{ sim.actor.origin_as_image_center ? 'Yes' : 'No' }}</dd>

            <dt class="col-sm-3 fw-semibold">Created</dt>
            <dd class="col-sm-9">{{ sim.created_at | date : 'medium' }}</dd>

            <dt class="col-sm-3 fw-semibold">Output Directory</dt>
            <dd class="col-sm-9">{{ sim.output_dir }}</dd>

            <dt class="col-sm-3 fw-semibold">Archive File</dt>
            <dd class="col-sm-9">{{ sim.json_archive_filename }}</dd>
          </dl>
        </div>
      </div>

      <hr class="mt-4 mb-3">

      <h2 class="fw-bold">Volumes</h2>
      <app-volume-list [simulationId]="sim.id"></app-volume-list>

      <hr class="mt-4 mb-3">

      <h2 class="fw-bold">Sources</h2>
      <app-source-list [simulationId]="sim.id"></app-source-list>
    </div>

    <ng-template #loading>
      <div class="container py-5 text-center text-muted">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Loading simulation details…</div>
      </div>
    </ng-template>
  `,
})
export class SimulationDetailComponent implements OnInit {
  simulation: SimulationRead | null = null;
  private readonly simulationService = inject(SimulationService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.simulationService.getSimulation(id).subscribe(data => {
        this.simulation = data;
      });
    });
  }

  back(): void {
    this.router.navigate(['/simulations']);
  }
}
