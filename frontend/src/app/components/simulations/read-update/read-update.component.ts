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
  template: `
    <div class="simulation-container" *ngIf="simulation(); else loading">
      <h2>Simulation Details</h2>

      <div class="simulation-details">
        <div class="detail-row">
          <span class="label">ID:</span>
          <span class="value">{{ simulation()!.id }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Name:</span>
          <input 
            type="text" 
            [(ngModel)]="editableSimulation().name" 
            name="name" 
            [readOnly]="!isEditMode()" 
            class="name-input" 
            [class.readonly]="!isEditMode()"
            required 
          />
        </div>
        
        <div class="detail-row">
          <span class="label">Created At:</span>
          <span class="value">{{ simulation()!.created_at | date:'medium' }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">Output Directory:</span>
          <span class="value">{{ simulation()!.output_dir }}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">JSON File:</span>
          <span class="value">{{ simulation()!.json_archive_filename }}</span>
        </div>
      </div>

      <div class="actions">
        <button 
          *ngIf="isEditMode()" 
          class="btn save" 
          (click)="updateSimulation()"
        >
          Save Changes
        </button>
        <button 
          class="btn" 
          [class.cancel]="isEditMode()" 
          [class.edit]="!isEditMode()" 
          (click)="toggleEditMode()"
        >
          {{ isEditMode() ? 'Cancel' : 'Edit' }}
        </button>
      </div>
    </div>
    <ng-template #loading>
      <div class="loading">Loading simulation details...</div>
    </ng-template>
  `,
  styles: [`
    .simulation-container {
      width: 80vw;
      padding: 5%;
    }

    h2 {
      margin-bottom: 24px;
      font-weight: 300;
      letter-spacing: 0.5px;
      color: rgb(230, 230, 230);
      border-bottom: 1px solid rgb(50, 50, 50);
      padding-bottom: 12px;
    }

    .simulation-details {
      margin-bottom: 24px;
    }

    .detail-row {
      display: flex;
      margin: 16px 0;
      align-items: center;
    }

    .label {
      flex: 0 0 150px;
      color: rgb(150, 150, 150);
      font-size: 14px;
    }

    .value {
      color: rgb(230, 230, 230);
      font-size: 16px;
    }

    .name-input {
      background-color: rgb(40, 40, 40);
      border: 1px solid rgb(60, 60, 60);
      border-radius: 4px;
      color: rgb(230, 230, 230);
      padding: 8px 12px;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .name-input:focus {
      outline: none;
      border-color: rgb(0, 122, 204);
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
    }

    .name-input.readonly {
      background-color: transparent;
      border-color: transparent;
      padding-left: 0;
      cursor: default;
    }

    .actions {
      display: flex;
      justify-content: flex-start;
      gap: 12px;
      margin-top: 24px;
    }

    .btn {
      background-color: rgb(40, 40, 40);
      color: rgb(230, 230, 230);
      border: none;
      border-radius: 4px;
      padding: 10px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn:hover {
      background-color: rgb(60, 60, 60);
    }

    .btn.edit {
      background-color: rgb(40, 40, 40);
    }

    .btn.save {
      background-color: rgb(0, 122, 204);
    }

    .btn.save:hover {
      background-color: rgb(0, 102, 184);
    }

    .btn.cancel {
      background-color: rgb(60, 60, 60);
    }

    .btn.cancel:hover {
      background-color: rgb(80, 80, 80);
    }

    .loading {
      color: rgb(150, 150, 150);
      font-size: 16px;
      text-align: center;
      margin: 6rem;
    }
  `]
})
export class ReadUpdateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationService = inject(SimulationService);

  simulation = signal<Simulation | null>(null);
  editableSimulation = signal<SimulationUpdate>({ name: '' });

  isEditMode = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const simulationId = Number(params.get('id'));
      if (simulationId) {
        this.simulationService.getSimulation(simulationId).subscribe({
          next: sim => {
            this.simulation.set(sim);
            this.editableSimulation.set({ name: sim.name });
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

    // Reset editable fields when cancelling edit
    if (!this.isEditMode() && this.simulation()) {
      this.editableSimulation.set({ name: this.simulation()!.name });
    }
  }

  updateSimulation(): void {
    const simulationId = this.simulation()?.id;
    if (!simulationId) return;

    this.simulationService.updateSimulation(simulationId, this.editableSimulation())
      .subscribe({
        next: updatedSim => {
          this.simulation.set(updatedSim);
          this.isEditMode.set(false);
          console.log('Simulation updated successfully');
        },
        error: err => console.error('Update failed:', err)
      });
  }
}