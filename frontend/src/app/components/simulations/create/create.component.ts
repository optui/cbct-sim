import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimulationService } from '../../../services/simulation.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="simulation-container">
      <h2>Create New Simulation</h2>
      
      <form [formGroup]="simulationForm" (ngSubmit)="onSubmit()">
        <div class="simulation-details">
          <div class="detail-row">
            <span class="label">Simulation Name</span>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              placeholder="Enter simulation name"
              class="name-input"
            >
          </div>
          <div *ngIf="simulationForm.get('name')?.invalid && simulationForm.get('name')?.touched" class="error-message">
            Name is required
          </div>
          
          <div class="detail-row">
            <span class="label">Number of Runs</span>
            <input 
              type="number" 
              id="num_runs" 
              formControlName="num_runs" 
              min="1"
              class="name-input"
            >
          </div>
          <div *ngIf="simulationForm.get('num_runs')?.invalid && simulationForm.get('num_runs')?.touched" class="error-message">
            Must be at least 1
          </div>
          
          <div class="detail-row">
            <span class="label">Run Length (seconds)</span>
            <input 
              type="number" 
              id="run_length" 
              formControlName="run_length" 
              min="0.00" 
              step="1.0"
              class="name-input"
            >
          </div>
          <div *ngIf="simulationForm.get('run_length')?.invalid && simulationForm.get('run_length')?.touched" class="error-message">
            Must be at least 0.01
          </div>
        </div>
        
        <div class="actions">
          <button type="submit" class="btn save" [disabled]="simulationForm.invalid">Create</button>
          <button type="button" class="btn cancel" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
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

    .error-message {
      color: #e53935;
      font-size: 0.85rem;
      margin-left: 150px;
      margin-top: -8px;
      margin-bottom: 8px;
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

    .btn.save {
      background-color: rgb(0, 122, 204);
    }

    .btn.save:hover {
      background-color: rgb(0, 102, 184);
    }

    .btn.save:disabled {
      background-color: rgba(0, 122, 204, 0.5);
      cursor: not-allowed;
    }

    .btn.cancel {
      background-color: rgb(60, 60, 60);
    }

    .btn.cancel:hover {
      background-color: rgb(80, 80, 80);
    }
  `]
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  private simulationService = inject(SimulationService);
  private router = inject(Router);

  simulationForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    num_runs: [1, [Validators.required, Validators.min(1)]],
    run_length: [1.0, [Validators.required, Validators.min(0.01)]]
  });

  onSubmit(): void {
    if (this.simulationForm.valid) {
      this.simulationService.createSimulation(this.simulationForm.value).subscribe({
        next: (simulation) => {
          this.router.navigate(['/read', simulation.id]);
        },
        error: (err) => console.error('Failed to create simulation:', err)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['']);
  }
}