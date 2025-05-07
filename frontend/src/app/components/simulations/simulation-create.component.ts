import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { SimulationCreate } from '../../interfaces/simulation';

@Component({
    selector: 'app-simulation-create',
    imports: [ReactiveFormsModule],
    template: `
        <form [formGroup]="form" (ngSubmit)="submit()">
            <label>Name:<input formControlName="name" /></label>
            <label>Number of runs:<input type="number" formControlName="num_runs" /></label>
            <label>Run length:<input type="number" formControlName="run_len" /></label>
            <button type="submit" [disabled]="form.invalid">Create</button>
            <button type="button" (click)="router.navigate(['/simulations'])">Cancel</button>
        </form>
    `
})
export class SimulationCreateComponent implements OnInit {
    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private simulationService: SimulationService,
        public router: Router
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            num_runs: [1, [Validators.required, Validators.min(1)]],
            run_len: [1, [Validators.required, Validators.min(1)]],
        });
    }

    submit(): void {
        if (this.form.valid) {
            const payload: SimulationCreate = this.form.value;
            this.simulationService.create(payload).subscribe(() =>
                this.router.navigate(['/simulations'])
            );
        }
    }
}