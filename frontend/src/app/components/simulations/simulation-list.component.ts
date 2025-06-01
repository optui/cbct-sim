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
  templateUrl: `simulation-list.component.html`,
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
    this.simulationService.readSimulations()
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

  /**
   * Prompt the user for sod/sdd, then POST to /{id}/reconstruct
   */
  reconstruct(id: number): void {
    const sodInput = prompt('Enter SOD (source–object distance):', '0');
    const sddInput = prompt('Enter SDD (source–detector distance):', '0');
    const sod = parseFloat(sodInput ?? '');
    const sdd = parseFloat(sddInput ?? '');
    if (isNaN(sod) || isNaN(sdd)) {
      this.showToast('Invalid SOD or SDD.', 'danger');
      return;
    }
    this.simulationService.reconstructSimulation(id, { sod, sdd })
      .subscribe((res: MessageResponse) => {
        this.showToast(res.message, 'info');
      });
  }

  /**
   * GET the zip from /{id}/export and trigger browser download
   */
  exportSimulation(id: number): void {
    this.simulationService.exportSimulation(id)
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sim_${id}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
  
  // Simple toast implementation - you might want to replace with a real service
  private showToast(message: string, type: 'success' | 'info' | 'warning' | 'danger'): void {
    alert(message);
  }
}
