import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulationService } from '../../../services/simulation.service';
import { Simulation, SimulationUpdate } from '../../../models/simulation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-read-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'read-update.component.html',
  styleUrl: 'read-update.component.scss'
})
export class ReadUpdateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(SimulationService);

  simulation = signal<Simulation | null>(null);
  editableSimulation = signal<SimulationUpdate>({ name: '', num_runs: 1, run_len: 0.01 });
  isEditMode = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const simulationId = Number(params.get('id'));
      if (simulationId) {
        this.simulationService.simulation(simulationId).subscribe({
          next: sim => {
            this.simulation.set(sim);
            this.editableSimulation.set({
              name: sim.name,
              num_runs: sim.num_runs,
              run_len: sim.run_len
            });
          },
          error: err => {
            console.error('Error loading simulation:', err);
            this.simulation.set(null);
          }
        });
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode.update(mode => !mode);
    if (!this.isEditMode() && this.simulation()) {
      const sim = this.simulation()!;
      this.editableSimulation.set({
        name: sim.name,
        num_runs: sim.num_runs,
        run_len: sim.run_len
      });
    }
  }

  updateSimulation(): void {
    
  }
}
