import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { GenericSourceUpdate, GenericSourceRead, ParticleType } from '../../interfaces/source';

@Component({
  standalone: true,
  selector: 'app-source-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-4">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h3 class="mb-4">Edit Source</h3>

        <!-- Name -->
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input class="form-control" formControlName="name" [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
          <div class="invalid-feedback">Name is required</div>
        </div>

        <!-- Attached To -->
        <div class="mb-3">
          <label class="form-label">Attached To</label>
          <input class="form-control" formControlName="attached_to" />
        </div>

        <!-- Particle -->
        <div class="mb-3">
          <label class="form-label">Particle Type</label>
          <select class="form-select" formControlName="particle">
            <option *ngFor="let p of particleTypes" [value]="p">{{ p }}</option>
          </select>
        </div>

        <!-- Position -->
        <fieldset class="border p-3 rounded mb-3" formGroupName="position">
          <legend class="w-auto px-2">Position Configuration</legend>

          <div class="mb-3">
            <label class="form-label">Position Type</label>
            <select class="form-select" formControlName="type">
              <option value="box">Box</option>
            </select>
          </div>

          <div class="row g-2 mb-3" formArrayName="translation">
            <div class="col" *ngFor="let ctrl of positionTranslation.controls; let i = index">
              <label class="form-label">{{ ['X','Y','Z'][i] }}</label>
              <input class="form-control" type="number" [formControlName]="i" />
            </div>
          </div>

          <fieldset formGroupName="rotation" class="border p-3 rounded mb-3">
            <legend class="w-auto px-2">Rotation</legend>
            <div class="row">
              <div class="col">
                <label class="form-label">Axis</label>
                <select class="form-select" formControlName="axis">
                  <option value="x">x</option>
                  <option value="y">y</option>
                  <option value="z">z</option>
                </select>
              </div>
              <div class="col">
                <label class="form-label">Angle</label>
                <input class="form-control" type="number" formControlName="angle" />
              </div>
            </div>
          </fieldset>

          <div class="row g-2 mb-3" formArrayName="size">
            <div class="col" *ngFor="let ctrl of positionSize.controls; let i = index">
              <label class="form-label">Size {{ ['X','Y','Z'][i] }}</label>
              <input class="form-control" type="number" [formControlName]="i" />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Unit</label>
            <select class="form-select" formControlName="unit">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </fieldset>

        <!-- Direction -->
        <fieldset formGroupName="direction" class="border p-3 rounded mb-3">
          <legend class="w-auto px-2">Direction Configuration</legend>

          <div class="mb-3">
            <label class="form-label">Direction Type</label>
            <select class="form-select" formControlName="type">
              <option value="focused">Focused</option>
            </select>
          </div>

          <div class="row g-2" formArrayName="focus_point">
            <div class="col" *ngFor="let ctrl of directionFocus.controls; let i = index">
              <label class="form-label">{{ ['X','Y','Z'][i] }}</label>
              <input class="form-control" type="number" [formControlName]="i" />
            </div>
          </div>
        </fieldset>

        <!-- Energy -->
        <fieldset formGroupName="energy" class="border p-3 rounded mb-3">
          <legend class="w-auto px-2">Energy Configuration</legend>

          <div class="mb-3">
            <label class="form-label">Energy Type</label>
            <select class="form-select" formControlName="type">
              <option value="mono">Monoenergetic</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Energy Value</label>
            <input class="form-control" type="number" formControlName="mono" />
          </div>

          <div class="mb-3">
            <label class="form-label">Energy Unit</label>
            <select class="form-select" formControlName="unit">
              <option value="eV">eV</option>
              <option value="keV">keV</option>
              <option value="MeV">MeV</option>
            </select>
          </div>
        </fieldset>

        <!-- Misc -->
        <div class="mb-3">
          <label class="form-label">Number of Particles</label>
          <input class="form-control" type="number" formControlName="n" />
        </div>

        <div class="mb-3">
          <label class="form-label">Activity</label>
          <input class="form-control" type="number" formControlName="activity" />
        </div>

        <div class="mb-3">
          <label class="form-label">Activity Unit</label>
          <select class="form-select" formControlName="activity_unit">
            <option value="Bq">Bq</option>
            <option value="kBq">kBq</option>
            <option value="MBq">MBq</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="d-flex gap-2">
          <button class="btn btn-success" type="submit" [disabled]="form.invalid">Create</button>
          <button class="btn btn-outline-secondary" type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class SourceEditComponent implements OnInit {
  form!: FormGroup;
  particleTypes: ParticleType[] = ['gamma'];
  units = ['nm', 'mm', 'cm', 'm'];
  simulationId!: number;
  sourceName!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: SourceService,
    private router: Router
  ) {}

  get positionTranslation() {
    return this.form.get('position.translation') as FormArray;
  }
  
  get positionSize() {
    return this.form.get('position.size') as FormArray;
  }
  
  get directionFocus() {
    return this.form.get('direction.focus_point') as FormArray;
  }  

  ngOnInit(): void {
    this.simulationId = Number(this.route.snapshot.paramMap.get('id'));
    this.sourceName = this.route.snapshot.paramMap.get('name')!;

    this.svc.get(this.simulationId, this.sourceName).subscribe(src => {
      this.form = this.fb.group({
        name: [src.name, Validators.required],
        attached_to: [src.attached_to, Validators.required],
        particle: [src.particle, Validators.required],
        position: this.fb.group({
          type: [src.position.type, Validators.required],
          translation: this.fb.array(src.position.translation),
          rotation: this.fb.group({
            axis: [src.position.rotation.axis, Validators.required],
            angle: [src.position.rotation.angle, Validators.required]
          }),
          size: this.fb.array(src.position.size),
          unit: [src.position.unit, Validators.required]
        }),
        direction: this.fb.group({
          type: [src.direction.type, Validators.required],
          focus_point: this.fb.array(src.direction.focus_point)
        }),
        energy: this.fb.group({
          type: [src.energy.type, Validators.required],
          mono: [src.energy.mono, [Validators.required, Validators.min(0)]],
          unit: [src.energy.unit, Validators.required]
        }),
        n: [src.n, [Validators.required, Validators.min(1)]],
        activity: [src.activity],
        activity_unit: [src.activity_unit]
      });
    });
  }

  submit(): void {
    if (!this.form.valid) return;
    const payload: GenericSourceUpdate = this.form.value;
    this.svc.update(this.simulationId, this.sourceName, payload)
      .subscribe(() => this.router.navigate([`/simulations/${this.simulationId}`]));
  }

  cancel(): void {
    this.router.navigate([`/simulations/${this.simulationId}`]);
  }
}