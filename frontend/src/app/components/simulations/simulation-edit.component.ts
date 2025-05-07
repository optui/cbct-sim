import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { SimulationUpdate, SimulationRead } from '../../interfaces/simulation';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-simulation-edit',
  imports: [NgIf, ReactiveFormsModule],
  template: `
    <form *ngIf="form" [formGroup]="form" (ngSubmit)="submit()">
        <label>Name:<input formControlName="name" /></label>
        <label>Number of runs:<input type="number" formControlName="num_runs" /></label>
        <label>Run length:<input type="number" formControlName="run_len" /></label>
        <button type="submit" [disabled]="form.invalid">Save</button>
        <button type="button" (click)="router.navigate(['/simulations'])">Cancel</button>
    </form>

  `
})
export class SimulationEditComponent implements OnInit {
  form!: FormGroup;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private simulationService: SimulationService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.simulationService.get(this.id).subscribe((sim: SimulationRead) => {
      this.form = this.fb.group({
        name: [sim.name, Validators.required],
        num_runs: [sim.num_runs, [Validators.required, Validators.min(1)]],
        run_len: [sim.run_len, [Validators.required, Validators.min(1)]],
      });
    });
  }

  submit(): void {
    if (this.form.valid) {
      const payload: SimulationUpdate = this.form.value;
      this.simulationService.update(this.id, payload).subscribe(() =>
        this.router.navigate(['/simulations'])
      );
    }
  }
}
