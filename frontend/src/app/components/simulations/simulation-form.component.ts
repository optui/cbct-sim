import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SimulationService } from '../../services/simulation.service';
import {
  SimulationCreate,
  SimulationRead,
  SimulationUpdate,
} from '../../interfaces/simulation';

@Component({
  selector: 'app-simulation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="mb-4">
        <h1 class="fw-bold display-6">{{ isEdit ? 'Edit' : 'New' }} Simulation</h1>
        <p class="text-muted">Fill out the fields below to configure your simulation.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="card shadow-sm mb-4">
          <div class="card-header fw-semibold">General</div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" formControlName="name" class="form-control" />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Number of Runs</label>
                <input type="number" formControlName="num_runs" class="form-control" />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Run Length</label>
                <input type="number" formControlName="run_len" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm mb-4" formGroupName="actor">
          <div class="card-header fw-semibold">Actor</div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Attached To</label>
              <input type="text" formControlName="attached_to" class="form-control" />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Spacing X</label>
                <input type="number" formControlName="spacing0" class="form-control" />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Spacing Y</label>
                <input type="number" formControlName="spacing1" class="form-control" />
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Size X</label>
                <input type="number" formControlName="size0" class="form-control" />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Size Y</label>
                <input type="number" formControlName="size1" class="form-control" />
              </div>
            </div>
            <div class="form-check mt-3">
              <input
                type="checkbox"
                formControlName="origin_as_image_center"
                class="form-check-input"
                id="originCheck"
              />
              <label class="form-check-label" for="originCheck">
                Origin as image center
              </label>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
            <i class="bi bi-check-circle me-1"></i> Save
          </button>
          <button type="button" class="btn btn-secondary" (click)="cancel()">
            <i class="bi bi-x-circle me-1"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
    }

    .form-check-input {
      cursor: pointer;
    }

    button i {
      vertical-align: middle;
    }
  `]
})
export class SimulationFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private simulationId: number | null = null;
  private readonly simulationService = inject(SimulationService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = idParam !== 'new';
      if (this.isEdit) {
        this.simulationId = Number(idParam);
        this.simulationService
          .getSimulation(this.simulationId)
          .subscribe((data) => this.patchForm(data));
      }
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      num_runs: [180, [Validators.required, Validators.min(1)]],
      run_len: [1, [Validators.required, Validators.min(1)]],
      actor: this.fb.group({
        attached_to: ['world', Validators.required],
        spacing0: [1, Validators.required],
        spacing1: [1, Validators.required],
        size0: [256, Validators.required],
        size1: [256, Validators.required],
        origin_as_image_center: [true],
      }),
    });
  }

  private patchForm(sim: SimulationRead): void {
    this.form.patchValue({
      name: sim.name,
      num_runs: sim.num_runs,
      run_len: sim.run_len,
      actor: {
        attached_to: sim.actor.attached_to,
        spacing0: sim.actor.spacing[0],
        spacing1: sim.actor.spacing[1],
        size0: sim.actor.size[0],
        size1: sim.actor.size[1],
        origin_as_image_center: sim.actor.origin_as_image_center,
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const actorGroup = this.form.get('actor')!;
    const payloadBase = {
      name: this.form.value.name,
      num_runs: this.form.value.num_runs,
      run_len: this.form.value.run_len,
      actor: {
        attached_to: actorGroup.value.attached_to,
        spacing: [actorGroup.value.spacing0, actorGroup.value.spacing1] as [
          number,
          number,
        ],
        size: [actorGroup.value.size0, actorGroup.value.size1] as [
          number,
          number,
        ],
        origin_as_image_center: actorGroup.value.origin_as_image_center,
      },
    } as SimulationCreate;

    if (this.isEdit && this.simulationId != null) {
      this.simulationService
        .updateSimulation(this.simulationId, payloadBase as SimulationUpdate)
        .subscribe(() => this.router.navigate(['/simulations', this.simulationId]));
    } else {
      this.simulationService
        .createSimulation(payloadBase)
        .subscribe(() => this.router.navigate(['/simulations']));
    }
  }

  cancel(): void {
    this.router.navigate(['/simulations']);
  }
}
