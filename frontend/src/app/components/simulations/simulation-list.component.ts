import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SimulationRead } from '../../interfaces/simulation';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-simulation-list',
  standalone: true,
  imports: [CommonModule, NgFor, RouterModule, NgIf],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Simulations</h2>
        <a routerLink="/simulations/create" class="btn btn-primary">+ New Simulation</a>
      </div>

      <ul class="list-group mb-3">
        <li *ngFor="let sim of simulations" class="list-group-item d-flex justify-content-between align-items-center">
          <span class="fw-medium">{{ sim.name }}</span>
          <div class="btn-group" role="group">
            <button class="btn btn-outline-primary btn-sm" (click)="detail(sim.id)">Detail</button>
            <button class="btn btn-outline-secondary btn-sm" (click)="edit(sim.id)">Edit</button>
            <button class="btn btn-outline-danger btn-sm" (click)="delete(sim.id)">Delete</button>
          </div>
        </li>
      </ul>

      <div *ngIf="simulations.length === 0" class="alert alert-warning text-center">
        No simulations found. Create one!
      </div>
    </div>
  `,
  styles: []
})
export class SimulationListComponent implements OnInit {
  simulations: SimulationRead[] = [];

  constructor(
    private simulationService: SimulationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSimulations();
  }

  loadSimulations(): void {
    this.simulationService.list()
      .subscribe(data => this.simulations = data);
  }

  detail(id: number): void {
    this.router.navigate(['/simulations', id]);
  }

  edit(id: number): void {
    this.router.navigate(['/simulations', id, 'edit']);
  }

  delete(id: number): void {
    if (!confirm('Delete this simulation?')) return;
    this.simulationService.delete(id)
      .subscribe(() => this.loadSimulations());
  }
}
