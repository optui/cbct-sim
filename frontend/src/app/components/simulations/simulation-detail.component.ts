import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SimulationService } from '../../services/simulation.service';
import { SimulationRead } from '../../interfaces/simulation';
import { VolumeListComponent } from '../volumes/volume-list.component';
import { SourceListComponent } from '../sources/source-list.component';

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [CommonModule, VolumeListComponent, SourceListComponent],
  template: `
    <div class="container py-5" *ngIf="simulation as sim; else loading">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="fw-bold display-6 mb-1 d-flex align-items-center">
            {{ sim.name }}
          </h1>
          <p class="text-muted">Detailed simulation configuration overview</p>
        </div>
        <div>
          <button class="btn btn-secondary btn-sm" (click)="back()">
            <i class="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>
      </div>

      <!-- Minimalist collapsible section: Simulation Configuration -->
      <div class="mb-4">
        <h5 class="fw-semibold mb-2 cursor-pointer user-select-none" data-bs-toggle="collapse" data-bs-target="#simulationConfig">
          Simulation Configuration
        </h5>
        <div class="collapse show" id="simulationConfig">
          <div class="row g-3">
            <div class="col-md-6" *ngFor="let item of generalInfoItems">
              <div class="border rounded p-3 h-100">
                <div class="small text-muted mb-1">
                  <i class="bi me-1" [ngClass]="'bi-' + item.icon"></i> {{ item.label }}
                </div>
                <div class="fs-6">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Minimalist collapsible section: Actor Configuration -->
      <div class="mb-4">
        <h5 class="fw-semibold mb-2 cursor-pointer user-select-none" data-bs-toggle="collapse" data-bs-target="#actorConfig">
          Actor Configuration
        </h5>
        <div class="collapse show" id="actorConfig">
          <div class="row g-3">
            <div class="col-md-6" *ngFor="let item of actorConfigItems">
              <div class="border rounded p-3 h-100">
                <div class="small text-muted mb-1">
                  <i class="bi me-1" [ngClass]="'bi-' + item.icon"></i> {{ item.label }}
                </div>
                <div class="fs-6">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mt-5" id="simTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="volumes-tab" data-bs-toggle="tab" data-bs-target="#volumes" type="button" role="tab">Volumes</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="sources-tab" data-bs-toggle="tab" data-bs-target="#sources" type="button" role="tab">Sources</button>
        </li>
      </ul>

      <div class="tab-content border border-top-0 p-4 rounded-bottom shadow-sm">
        <div class="tab-pane fade show active" id="volumes" role="tabpanel">
          <app-volume-list [simulationId]="sim.id"></app-volume-list>
        </div>
        <div class="tab-pane fade" id="sources" role="tabpanel">
          <app-source-list [simulationId]="sim.id"></app-source-list>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="container py-5 text-center text-muted">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Loading simulation details…</div>
      </div>
    </ng-template>

  `,
  styles: `
    .nav-tabs .nav-link {
      cursor: pointer;
    }
    .cursor-pointer {
      cursor: pointer;
    }

    .collapse-toggle-icon {
      transition: transform 0.2s ease;
    }

    .collapse:not(.show) + .collapse-toggle-icon {
      transform: rotate(-90deg);
    }
  `
})
export class SimulationDetailComponent implements OnInit {
  simulation: SimulationRead | null = null;
  private readonly simulationService = inject(SimulationService);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.simulationService.readSimulation(id).subscribe(data => {
        this.simulation = data;
      });
    });
  }

  back(): void {
    this.router.navigate(['/simulations']);
  }

  get generalInfoItems() {
    if (!this.simulation) return [];
    const sim = this.simulation;
    return [
      { label: 'Number of Runs', value: sim.num_runs, icon: 'graph-up' },
      { label: 'Run Length', value: `${sim.run_len} second(s)`, icon: 'clock' },
      { label: 'Created', value: new Date(sim.created_at).toLocaleString(), icon: 'calendar' },
      { label: 'Output Directory', value: sim.output_dir, icon: 'folder' },
      { label: 'Archive File', value: sim.json_archive_filename, icon: 'file-earmark-zip' },
    ];
  }

  get actorConfigItems() {
    if (!this.simulation) return [];
    const actor = this.simulation.actor;
    return [
      { label: 'Attached To', value: actor.attached_to, icon: 'link' },
      { label: 'Spacing', value: `${actor.spacing[0]} mm x ${actor.spacing[1]} mm`, icon: 'arrows-expand' },
      { label: 'Size', value: `${actor.size[0]} px x ${actor.size[1]} px`, icon: 'bounding-box' },
      { label: 'Origin as Center?', value: actor.origin_as_image_center ? 'Yes' : 'No', icon: 'bullseye' },
    ];
  }
}
