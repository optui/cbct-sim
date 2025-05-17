import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SourceService } from '../../services/source.service';
import {
  GenericSourceCreate,
  GenericSourceRead,
  GenericSourceUpdate,
} from '../../interfaces/source';
import { Unit, Vector3 } from '../../interfaces/primitives';

@Component({
  selector: 'app-source-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <h1 class="fw-bold display-6 mb-4">
        {{ isEdit ? 'Edit Source' : 'New Source' }}
      </h1>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <!-- General -->
        <div class="card shadow-sm mb-4">
          <div class="card-header fw-semibold">General</div>
          <div class="card-body row g-3">
            <div class="col-md-4">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" formControlName="name" placeholder="e.g. src1" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Attached To</label>
              <input type="text" class="form-control" formControlName="attached_to" placeholder="e.g. world" />
            </div>
            <div class="col-md-4">
              <label class="form-label">Particle</label>
              <input type="text" class="form-control" formControlName="particle" placeholder="e.g. gamma" />
            </div>
          </div>
        </div>

        <!-- Energy & Activity -->
        <div class="card shadow-sm mb-4">
          <div class="card-header fw-semibold">Energy & Activity</div>
          <div class="card-body row g-3">
            <div class="col-md-6">
              <label class="form-label">Energy</label>
              <div class="input-group">
                <input type="number" class="form-control" formControlName="energy" />
                <select class="form-select" formControlName="energyUnit">
                  <option *ngFor="let unit of unitOptions" [value]="unit">{{ unit }}</option>
                </select>
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Activity</label>
              <div class="input-group">
                <input type="number" class="form-control" formControlName="activity" />
                <select class="form-select" formControlName="activityUnit">
                  <option *ngFor="let unit of unitOptions" [value]="unit">{{ unit }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Focus Point -->
        <div class="card shadow-sm mb-4">
          <div class="card-header fw-semibold">Focus Point</div>
          <div class="card-body row g-3">
            <div class="col-md-4" *ngFor="let axis of ['X', 'Y', 'Z']">
              <div class="input-group">
                <label class="input-group-text">{{ axis }}</label>
                <input type="number" class="form-control" [formControlName]="'focus' + axis" />
                <span class="input-group-text">{{ positionUnitLabel }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Position -->
        <div class="card shadow-sm mb-4">
          <div class="card-header fw-semibold">Position</div>
          <div class="card-body">
            <label class="form-label mb-2">Translation</label>
            <div class="row g-3 mb-3">
              <div class="col-md-4" *ngFor="let axis of ['X', 'Y', 'Z']">
                <div class="input-group">
                  <span class="input-group-text">{{ axis }}</span>
                  <input type="number" class="form-control" [formControlName]="'translation' + axis" />
                  <span class="input-group-text">{{ positionUnitLabel }}</span>
                </div>
              </div>
            </div>


            <label class="form-label mb-2">Size</label>
            <div class="row g-3 mb-3">
              <div class="col-md-4" *ngFor="let axis of ['X', 'Y', 'Z']">
                <div class="input-group">
                  <span class="input-group-text">{{ axis }}</span>
                  <input type="number" class="form-control" [formControlName]="'size' + axis" />
                  <span class="input-group-text">{{ positionUnitLabel }}</span>
                </div>
              </div>
            </div>


            <div class="mb-3">
              <label class="form-label">Unit</label>
              <select class="form-select" formControlName="positionUnit">
                <option *ngFor="let unit of unitOptions" [value]="unit">{{ unit }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2 mt-3">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
            <i class="bi bi-check-circle me-1"></i> {{ isEdit ? 'Save Changes' : 'Create Source' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="cancel()">
            <i class="bi bi-x-circle me-1"></i> Cancel
          </button>
        </div>
      </form>
    </div>

  `
})
export class SourceFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  simulationId!: number;
  sourceName: string | null = null;

  readonly unitOptions = Object.values(Unit);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sourceService = inject(SourceService);

  ngOnInit(): void {
    this.buildForm();

    this.simulationId = Number(this.route.snapshot.paramMap.get('simId'));
    this.sourceName = this.route.snapshot.paramMap.get('name');

    if (this.sourceName && this.sourceName !== 'new') {
      this.isEdit = true;
      this.loadSource();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      attached_to: ['world', Validators.required],
      particle: ['gamma', Validators.required],

      energy: [80.0, Validators.required],
      energyUnit: [Unit.KEV],

      activity: [1e4, Validators.required],
      activityUnit: [Unit.BQ],

      focusX: [0],
      focusY: [0],
      focusZ: [0],

      translationX: [0],
      translationY: [0],
      translationZ: [0],
      sizeX: [1],
      sizeY: [1],
      sizeZ: [1],
      positionUnit: [Unit.MM],
    });
  }

  private loadSource(): void {
    this.sourceService.getSource(this.simulationId, this.sourceName!).subscribe((data: GenericSourceRead) => {
      this.form.patchValue({
        name: data.name,
        attached_to: data.attached_to,
        particle: data.particle,
        energy: data.energy.energy,
        energyUnit: data.energy.unit,
        activity: data.activity,
        activityUnit: data.unit,
        focusX: data.focus_point[0],
        focusY: data.focus_point[1],
        focusZ: data.focus_point[2],
        translationX: data.position.translation[0],
        translationY: data.position.translation[1],
        translationZ: data.position.translation[2],
        sizeX: data.position.size[0],
        sizeY: data.position.size[1],
        sizeZ: data.position.size[2],
        positionUnit: data.position.unit
      });
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const f = this.form.value;

    const payload: GenericSourceCreate = {
      name: f.name,
      attached_to: f.attached_to,
      particle: f.particle,
      energy: { energy: f.energy, unit: f.energyUnit },
      activity: f.activity,
      unit: f.activityUnit,
      focus_point: [f.focusX, f.focusY, f.focusZ] as Vector3,
      position: {
        type: 'box',
        translation: [f.translationX, f.translationY, f.translationZ] as Vector3,
        size: [f.sizeX, f.sizeY, f.sizeZ] as Vector3,
        unit: f.positionUnit
      }
    };

    const action$ = this.isEdit
      ? this.sourceService.updateSource(this.simulationId, this.sourceName!, payload)
      : this.sourceService.createSource(this.simulationId, payload);

    action$.subscribe(() => {
      this.router.navigate(['/simulations', this.simulationId]);
    });
  }

  cancel(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }

  get positionUnitLabel(): string {
    return this.form?.get('positionUnit')?.value ?? 'mm';
  }
}
