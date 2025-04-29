import { Component, signal } from '@angular/core';
import { SimulationService } from '../../services/simulation.service';
import { SimulationCreate } from '../../interfaces/simulation';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simulation-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <h2>Create New Simulation</h2>

    <form (ngSubmit)="create()">
      <label>
        Name:
        <input [ngModel]="form().name" (ngModelChange)="updateField('name', $event)" name="name" required />
      </label>

      <label>
        Number of Runs:
        <input type="number" [ngModel]="form().num_runs" (ngModelChange)="updateField('num_runs', $event)" name="num_runs" required />
      </label>

      <label>
        Run Length:
        <input type="number" [ngModel]="form().run_len" (ngModelChange)="updateField('run_len', $event)" name="run_len" required />
      </label>

      <button type="submit">Create Simulation</button>
    </form>
  `
})
export class SimulationCreateComponent {
  form = signal<SimulationCreate>({
    name: '',
    num_runs: 1,
    run_len: 100
  });

  constructor(private svc: SimulationService, private router: Router) {}

  updateField(field: keyof SimulationCreate, value: any) {
    this.form.update(current => ({ ...current, [field]: value }));
  }

  create() {
    this.svc.create(this.form()).subscribe(() => {
      alert('Simulation created successfully!');
      this.router.navigate(['/simulations']);
    });
  }
}
