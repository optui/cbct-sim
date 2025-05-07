import { Component, OnInit } from '@angular/core';
import { Router }               from '@angular/router';
import { CommonModule }         from '@angular/common';
import { NgFor }                from '@angular/common';
import { SimulationRead }       from '../../interfaces/simulation';
import { SimulationService }    from '../../services/simulation.service';

@Component({
  selector: 'app-simulation-list',
  standalone: true,
  imports: [CommonModule, NgFor],
  template: `
    <ul>
      <li *ngFor="let sim of simulations">
        {{ sim.name }} 
        (runs: {{ sim.num_runs }}, length: {{ sim.run_len }})
        <button (click)="detail(sim.id)">Detail</button>
        <button (click)="edit(sim.id)">Edit</button>
        <button (click)="delete(sim.id)">Delete</button>
      </li>
    </ul>

    <button (click)="create()">+ New Simulation</button>
  `
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

  create(): void {
    this.router.navigate(['/simulations/create']);
  }
}
