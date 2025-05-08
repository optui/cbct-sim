import { Component, OnInit }          from '@angular/core';
import { ActivatedRoute, Router, RouterLink }     from '@angular/router';
import { CommonModule, NgIf }         from '@angular/common';
import { RouterOutlet }               from '@angular/router';

import { SimulationRead }             from '../../interfaces/simulation';
import { SimulationService }          from '../../services/simulation.service';

import { VolumeListComponent }        from '../volumes/volume-list.component';
import { SourceListComponent }        from '../sources/source-list.component';
import { ActorListComponent }         from '../actors/actor-list.component';

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    RouterLink
  ],
  template: `
    <div *ngIf="simulation; else loading" class="container py-4">
      <button (click)="back()" class="btn btn-secondary mb-3">← Back to list</button>

      <div class="card">
        <div class="card-body">
          <h3 class="card-title">{{ simulation.name }}</h3>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Number of runs:</strong> {{ simulation.num_runs }}</li>
            <li class="list-group-item"><strong>Run length:</strong> {{ simulation.run_len }}</li>
            <li class="list-group-item"><strong>Created at:</strong> {{ simulation.created_at }}</li>
            <li class="list-group-item"><strong>Output dir:</strong> {{ simulation.output_dir }}</li>
            <li class="list-group-item"><strong>Archive file:</strong> {{ simulation.json_archive_filename }}</li>
          </ul>
          <div class="mt-3 d-flex gap-3">
            <a [routerLink]="['/simulations', simulation.id, 'volumes']" class="btn btn-outline-primary">View Volumes</a>
            <a [routerLink]="['/simulations', simulation.id, 'sources']" class="btn btn-outline-primary">View Sources</a>
            <a [routerLink]="['/simulations', simulation.id, 'actors']" class="btn btn-outline-primary">View Actors</a>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="container py-4">
        <div class="alert alert-info">Loading simulation…</div>
      </div>
    </ng-template>
  `
})
export class SimulationDetailComponent implements OnInit {
  simulation?: SimulationRead;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simulationService: SimulationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.simulationService.get(id)
      .subscribe(sim => this.simulation = sim);
  }

  back(): void {
    this.router.navigate(['/simulations']);
  }
}
