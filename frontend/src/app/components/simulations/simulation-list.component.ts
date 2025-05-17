import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SimulationService } from '../../services/simulation.service';
import { SimulationRead } from '../../interfaces/simulation';
import { MessageResponse } from '../../interfaces/message';

@Component({
  selector: 'app-simulation-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 class="fw-bold display-6 mb-1">Simulations</h1>
          <p class="text-muted">Manage your simulations below.</p>
        </div>
        <button class="btn btn-lg btn-primary" (click)="create()">
          <i class="bi bi-plus-circle me-2"></i> New Simulation
        </button>
      </div>

      <div *ngIf="simulations.length; else empty">
        <div class="card shadow mb-4" *ngFor="let sim of simulations">
          <div class="card-body px-4 py-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="sim-icon bg-primary bg-opacity-10 text-primary me-4">
                <i class="bi bi-bezier2 fs-3"></i>
              </div>
              <div>
                <h4 class="mb-1 fw-semibold">{{ sim.name }}</h4>
                <div class="text-muted small">Created: {{ sim.created_at | date:'longDate' }}</div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm" (click)="view(sim.id)" title="Details">
                <i class="bi bi-info-circle me-1"></i> Details
              </button>
              <button class="btn btn-outline-primary btn-sm" (click)="edit(sim.id)" title="Edit">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
              <button class="btn btn-outline-danger btn-sm" (click)="delete(sim.id)" title="Delete">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
              <div class="vr"></div>
              <button class="btn btn-primary btn-sm" (click)="viewSimulation(sim.id)" title="View Simulation">
                <i class="bi bi-eye-fill me-1"></i> View
              </button>
              <button class="btn btn-success btn-sm" (click)="runSimulation(sim.id)" title="Run Simulation">
                <i class="bi bi-play-fill me-1"></i> Run
              </button>
              <button class="btn btn-secondary btn-sm" title="Reconstruct" disabled>
                <i class="bi bi-gear-fill me-1"></i> Reconstruct
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="card text-center border-0 p-5">
          <div class="py-4">
            <i class="bi bi-hourglass fs-1 text-primary mb-3"></i>
            <h3 class="fw-semibold mb-2">No simulations yet</h3>
            <p class="text-muted mb-4">Create your first simulation for it to appear here.</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .sim-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .vr {
      width: 1px;
      height: 3.5vh;
      background-color: #dee2e6;
    }

    button.btn-sm i {
      vertical-align: middle;
    }
  `]
})
export class SimulationListComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private router = inject(Router);
  simulations: SimulationRead[] = [];
  
  ngOnInit(): void {
    this.loadAll();
  }
  
  loadAll(): void {
    this.simulationService.getSimulations()
      .subscribe((data) => (this.simulations = data));
  }
  
  view(id: number): void {
    this.router.navigate(['/simulations', id]);
  }
  
  viewSimulation(id: number): void {
    this.simulationService.viewSimulation(id)
      .subscribe((res: MessageResponse) => {
        this.showToast(res.message, 'info');
      });
  }
  
  runSimulation(id: number): void {
    this.simulationService.runSimulation(id)
      .subscribe((res: MessageResponse) => {
        this.showToast(res.message, 'success');
      });
  }
  
  edit(id: number): void {
    this.router.navigate(['/simulations', id, 'edit']);
  }
  
  delete(id: number): void {
    const simulation = this.simulations.find((s) => s.id === id);
    if (!simulation) return;
    
    if (confirm(`Are you sure you want to delete "${simulation.name}"?`)) {
      this.simulationService.deleteSimulation(id)
        .subscribe(() => {
          this.loadAll();
          this.showToast(`Simulation "${simulation.name}" has been deleted`, 'warning');
        });
    }
  }
  
  create(): void {
    this.router.navigate(['/simulations', 'new']);
  }
  
  // Simple toast implementation - you might want to replace this with a proper toast service
  private showToast(message: string, type: 'success' | 'info' | 'warning' | 'danger'): void {
    // This is a placeholder. In a real app, you would use a toast service or component
    alert(message); // For now, we'll just use alert until you implement a proper toast component
  }
}