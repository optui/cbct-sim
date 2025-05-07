import { Component, OnInit }          from '@angular/core';
import { ActivatedRoute, Router }     from '@angular/router';
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
    RouterOutlet,
    VolumeListComponent,
    SourceListComponent,
    ActorListComponent
  ],
  template: `
    <div *ngIf="simulation; else loading">
      <button (click)="back()">← Back to list</button>

      <h2>{{ simulation.name }}</h2>
      <p><strong>Number of runs:</strong> {{ simulation.num_runs }}</p>
      <p><strong>Run length:</strong> {{ simulation.run_len }}</p>
      <p><strong>Created at:</strong> {{ simulation.created_at }}</p>
      <p><strong>Output dir:</strong> {{ simulation.output_dir }}</p>
      <p><strong>Archive file:</strong> {{ simulation.json_archive_filename }}</p>

      <!-- inline lists -->
      <app-volume-list [simulationId]="simulation.id"></app-volume-list>

      <h3>Sources</h3>
      <app-source-list [simulationId]="simulation.id"></app-source-list>

      <h3>Actors</h3>
      <app-actor-list [simulationId]="simulation.id"></app-actor-list>

      <!-- nested child routes -->
      <router-outlet></router-outlet>
    </div>

    <ng-template #loading>
      <p>Loading simulation…</p>
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
