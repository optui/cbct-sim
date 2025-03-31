import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { Simulation } from '../../services/simulation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="simulation">
      <h2>{{ simulation.name }}</h2>
      <p><strong>Created At:</strong> {{ 
          simulation.created_at | date:'short' 
        }}
      </p>
      <p><strong>Output Directory:</strong> {{ simulation.output_dir }}</p>
      <p><strong>JSON Archive Filename:</strong> {{ simulation.json_archive_filename }}</p>
      <!-- Add more simulation details here as needed -->
    </div>
    <div *ngIf="!simulation">
      <p>Loading simulation details...</p>
    </div>
  `,
  styles: [`
    div {
      padding: 1rem;
      height: 100%;
      width: auto;
    }
    h2 {
      font-size: 24px;
      margin-bottom: 1rem;
    }
  `]
})
export class SimulationDetailComponent implements OnInit {
  simulation: Simulation | null = null;

  constructor(
    private route: ActivatedRoute,
    private simService: SimulationService
  ) {}

  ngOnInit() {
    // Subscribe to paramMap so this code runs each time the ID changes
    this.route.paramMap.subscribe(paramMap => {
      const simId = paramMap.get('id');
      if (simId) {
        this.loadSimulation(+simId);
      }
    });
  }

  private loadSimulation(id: number) {
    this.simService.getSimulation(id).subscribe({
      next: sim => {
        this.simulation = sim;
      },
      error: err => {
        console.error('Error fetching simulation:', err);
      }
    });
  }
}
