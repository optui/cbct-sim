import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { SimulationUpdate, SimulationRead } from '../../interfaces/simulation';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-simulation-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf],
  template: `
    <div class="container py-4">
    <h2>Edit Simulation</h2>
      <form *ngIf="form" [formGroup]="form" (ngSubmit)="submit()" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="name" class="form-label">Name:</label>
          <input id="name" type="text" formControlName="name" class="form-control" [class.is-invalid]="name.invalid && (name.dirty || name.touched)">
          <div class="invalid-feedback">
            Name is required.
          </div>
        </div>

        <div class="mb-3">
          <label for="numRuns" class="form-label">Number of runs:</label>
          <input id="numRuns" type="number" formControlName="num_runs" class="form-control" [class.is-invalid]="numRuns.invalid && (numRuns.dirty || numRuns.touched)">
          <div class="invalid-feedback">
            Minimum 1 run required.
          </div>
        </div>

        <div class="mb-3">
          <label for="runLen" class="form-label">Run length:</label>
          <input id="runLen" type="number" formControlName="run_len" class="form-control" [class.is-invalid]="runLen.invalid && (runLen.dirty || runLen.touched)">
          <div class="invalid-feedback">
            Minimum length is 1.
          </div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" [disabled]="form.invalid" class="btn btn-success">Save</button>
          <a routerLink="/simulations" class="btn btn-outline-secondary">Cancel</a>
        </div>
      </form>

      <div *ngIf="!form" class="alert alert-info">Loading...</div>
    </div>
  `
})
export class SimulationEditComponent implements OnInit {
  form!: FormGroup;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private simulationService: SimulationService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.simulationService.get(this.id).subscribe({
      next: (sim) => {
        this.form = this.fb.group({
          name: [sim.name, Validators.required],
          num_runs: [sim.num_runs, [Validators.required, Validators.min(1)]],
          run_len: [sim.run_len, [Validators.required, Validators.min(1)]],
        });
      },
      error: () => this.router.navigate(['/simulations'])
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.simulationService.update(this.id, this.form.value).subscribe(() => {
        this.router.navigate(['/simulations']);
      });
    }
  }

  get name() { return this.form.get('name')!; }
  get numRuns() { return this.form.get('num_runs')!; }
  get runLen() { return this.form.get('run_len')!; }
}
