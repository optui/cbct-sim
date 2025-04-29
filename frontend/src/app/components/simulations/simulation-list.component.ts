import { Component, OnInit, signal } from '@angular/core';
import { SimulationService } from '../../services/simulation.service';
import { SimulationRead } from '../../interfaces/simulation';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-simulation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h2>Simulations</h2>

    <ul>
      <li *ngFor="let sim of sims()">
        <a [routerLink]="['/simulations', sim.id]">
          {{ sim.name }}
        </a>
      </li>
    </ul>

    <p>
      <a routerLink="/simulations/create" class="contrast">Create New Simulation</a>
    </p>
  `
})
export class SimulationListComponent implements OnInit {
  sims = signal<SimulationRead[]>([]);

  constructor(private svc: SimulationService) {}

  ngOnInit() {
    this.svc.list().subscribe(data => this.sims.set(data));
  }
}
