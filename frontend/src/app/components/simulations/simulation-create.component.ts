import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { SimulationCreate } from '../../interfaces/simulation';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-simulation-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf],
  template: `
    <div class="container py-4">
      <h2>Create New Simulation</h2>
      <form [formGroup]="form" (ngSubmit)="submit()" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="name" class="form-label">Name:</label>
          <input id="name" type="text" formControlName="name" class="form-control" 
                 [class.is-invalid]="name.invalid && (name.dirty || name.touched)">
          <div class="invalid-feedback">Name is required.</div>
        </div>

        <div class="mb-3">
          <label for="num_runs" class="form-label">Number of runs:</label>
          <input id="num_runs" type="number" formControlName="num_runs" class="form-control" 
                 [class.is-invalid]="numRuns.invalid && (numRuns.dirty || numRuns.touched)">
          <div class="invalid-feedback" *ngIf="numRuns.errors?.['required']">Required field</div>
          <div class="invalid-feedback" *ngIf="numRuns.errors?.['min']">Minimum 1 run required</div>
        </div>

        <div class="mb-3">
          <label for="run_len" class="form-label">Run length:</label>
          <input id="run_len" type="number" formControlName="run_len" class="form-control" 
                 [class.is-invalid]="runLen.invalid && (runLen.dirty || runLen.touched)">
          <div class="invalid-feedback" *ngIf="runLen.errors?.['required']">Required field</div>
          <div class="invalid-feedback" *ngIf="runLen.errors?.['min']">Minimum length is 1</div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Create</button>
          <a routerLink="/simulations" class="btn btn-outline-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class SimulationCreateComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private simulationService: SimulationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      num_runs: [1, [Validators.required, Validators.min(1)]],
      run_len: [1, [Validators.required, Validators.min(1)]],
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.simulationService.create(this.form.value).subscribe(() => {
        this.router.navigate(['/simulations']);
      });
    }
  }

  get name() { return this.form.get('name')!; }
  get numRuns() { return this.form.get('num_runs')!; }
  get runLen() { return this.form.get('run_len')!; }
}
