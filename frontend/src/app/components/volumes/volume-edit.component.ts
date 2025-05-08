import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VolumeService } from '../../services/volume.service';
import { VolumeRead, VolumeUpdate } from '../../interfaces/volume';

@Component({
  standalone: true,
  selector: 'app-volume-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-4">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h3 class="mb-4">Edit Volume: {{ volumeName }}</h3>

        <div class="mb-3">
          <label class="form-label">Name</label>
          <input formControlName="name" class="form-control" [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
          <div class="invalid-feedback">Name is required</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Mother</label>
          <input formControlName="mother" class="form-control">
        </div>

        <div class="mb-3">
          <label class="form-label">Material</label>
          <input formControlName="material" class="form-control" [class.is-invalid]="form.get('material')?.invalid && form.get('material')?.touched">
          <div class="invalid-feedback">Material is required</div>
        </div>

        <!-- Translation -->
        <fieldset class="border rounded p-3 mb-3">
          <legend class="float-none w-auto px-2">Translation</legend>
          <div class="row g-2 mb-2">
            <div class="col" *ngFor="let ctrl of translation.controls; let i = index">
              <label class="form-label">{{ ['X','Y','Z'][i] }}</label>
              <input type="number" class="form-control" [formControlName]="i">
            </div>
          </div>
          <div>
            <label class="form-label">Unit</label>
            <select class="form-select" formControlName="translation_unit">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </fieldset>

        <!-- Rotation -->
        <fieldset class="border rounded p-3 mb-3" formGroupName="rotation">
          <legend class="float-none w-auto px-2">Rotation</legend>
          <div class="mb-3">
            <label class="form-label">Axis</label>
            <select class="form-select" formControlName="axis">
              <option value="x">x</option>
              <option value="y">y</option>
              <option value="z">z</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Angle</label>
            <input type="number" class="form-control" formControlName="angle">
          </div>
        </fieldset>

        <!-- Shape -->
        <fieldset class="border rounded p-3 mb-3" formGroupName="shape">
          <legend class="float-none w-auto px-2">Shape</legend>

          <div class="mb-3">
            <label class="form-label">Type</label>
            <select class="form-select" formControlName="type">
              <option value="Box">Box</option>
              <option value="Sphere">Sphere</option>
            </select>
          </div>

          <!-- Box Shape -->
          <div *ngIf="form.value.shape.type === 'Box'" formArrayName="size" class="row g-2 mb-3">
            <div class="col" *ngFor="let s of size.controls; let i = index">
              <label class="form-label">Size {{ ['X','Y','Z'][i] }}</label>
              <input type="number" class="form-control" [formControlName]="i">
            </div>
          </div>

          <!-- Sphere Shape -->
          <div *ngIf="form.value.shape.type === 'Sphere'" class="mb-3">
            <label class="form-label">Inner radius (rmin)</label>
            <input type="number" class="form-control" formControlName="rmin">
            <label class="form-label mt-2">Outer radius (rmax)</label>
            <input type="number" class="form-control" formControlName="rmax">
          </div>

          <div class="mb-3">
            <label class="form-label">Unit</label>
            <select class="form-select" formControlName="unit">
              <option *ngFor="let u of units" [value]="u">{{ u }}</option>
            </select>
          </div>
        </fieldset>

        <!-- Dynamic Parameters -->
        <fieldset class="border rounded p-3 mb-4" formGroupName="dynamic_params">
          <legend class="float-none w-auto px-2">Dynamic Parameters</legend>
          <div class="form-check mb-2">
            <input type="checkbox" class="form-check-input" formControlName="enabled" id="enableAnim">
            <label class="form-check-label" for="enableAnim">Enable animation</label>
          </div>

          <div *ngIf="form.value.dynamic_params.enabled">
            <fieldset formGroupName="translation_end" class="mb-3">
              <legend class="float-none w-auto px-2">End Translation</legend>
              <div class="row g-2">
                <div class="col" *ngFor="let ctrl of translation_end.controls; let i = index">
                  <label class="form-label">{{ ['X','Y','Z'][i] }}</label>
                  <input type="number" class="form-control" [formControlName]="i">
                </div>
              </div>
            </fieldset>

            <div class="mb-3">
              <label class="form-label">End Angle</label>
              <input type="number" class="form-control" formControlName="angle_end">
            </div>
          </div>
        </fieldset>

        <!-- Action Buttons -->
        <div class="d-flex gap-2">
          <button class="btn btn-success" type="submit" [disabled]="form.invalid">Create</button>
          <button class="btn btn-outline-secondary" type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>

  `,
  styles: [`
    .form-container { max-width: 600px; margin: 20px; }
    .loading { padding: 20px; }
    fieldset { margin-bottom: 15px; padding: 15px; border: 1px solid #ccc; }
    legend { font-weight: bold; }
    .form-group { margin-bottom: 10px; }
    .coord-group { display: flex; gap: 10px; margin-bottom: 10px; }
    label { display: block; margin-bottom: 5px; }
    input, select { padding: 5px; width: 100%; }
    .button-group { display: flex; gap: 10px; margin-top: 20px; }
    .error-msg { color: red; font-size: 0.8em; margin-top: 2px; }
  `]
})
export class VolumeEditComponent implements OnInit {
  form!: FormGroup;
  units = ['nm','mm','cm','m'] as const;
  simulationId!: number;
  volumeName!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: VolumeService,
    private router: Router
  ) {}

  get translation()    { return this.form.get('translation') as FormArray; }
  get size()           { return this.form.get('shape')!.get('size') as FormArray; }
  get translation_end(){ return this.form.get('dynamic_params')!.get('translation_end') as FormArray; }

  ngOnInit(): void {
    // Get simulation ID from parent route or current route
    this.simulationId = Number(this.route.parent?.snapshot.paramMap.get('id') || 
                               this.route.snapshot.paramMap.get('simId'));
    
    // Get volume name from route params
    this.volumeName = this.route.snapshot.paramMap.get('name') || 
                      this.route.snapshot.paramMap.get('volumeName')!;

    // Fetch volume data and build form
    this.svc.get(this.simulationId, this.volumeName).subscribe(vol => {
      const translationArray = this.fb.array(vol.translation || [0,0,0]);
      const sizeArray = this.fb.array(vol.shape.type === 'Box' ? vol.shape.size : [0,0,0]);
      const translationEndArray = this.fb.array(vol.dynamic_params.translation_end || [0,0,0]);

      this.form = this.fb.group({
        name: [vol.name, Validators.required],
        mother: [vol.mother || 'world'],
        material: [vol.material, Validators.required],
        translation: translationArray,
        translation_unit: [vol.translation_unit, Validators.required],
        rotation: this.fb.group({
          axis: [vol.rotation.axis, Validators.required],
          angle: [vol.rotation.angle, Validators.required],
        }),
        shape: this.fb.group({
          type: [vol.shape.type, Validators.required],
          unit: [vol.shape.unit, Validators.required],
          size: sizeArray,
          rmin: [vol.shape.type === 'Sphere' ? vol.shape.rmin : 0],
          rmax: [vol.shape.type === 'Sphere' ? vol.shape.rmax : 1],
        }),
        dynamic_params: this.fb.group({
          enabled: [vol.dynamic_params.enabled],
          translation_end: translationEndArray,
          angle_end: [vol.dynamic_params.angle_end || 0],
        }),
      });
      
      // Set up listener for shape type changes
      this.form.get('shape.type')?.valueChanges.subscribe((type) => {
        if (type === 'Box') {
          this.form.get('shape.rmin')?.clearValidators();
          this.form.get('shape.rmax')?.clearValidators();
        } else if (type === 'Sphere') {
          this.form.get('shape.rmin')?.setValidators([Validators.required, Validators.min(0)]);
          this.form.get('shape.rmax')?.setValidators([Validators.required, Validators.min(0)]);
        }
        
        this.form.get('shape.rmin')?.updateValueAndValidity();
        this.form.get('shape.rmax')?.updateValueAndValidity();
      });
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;

    const shapePayload = raw.shape.type === 'Box'
      ? { type: 'Box' as const, unit: raw.shape.unit, size: raw.shape.size }
      : { type: 'Sphere' as const, unit: raw.shape.unit, rmin: raw.shape.rmin, rmax: raw.shape.rmax };

    const payload: VolumeUpdate = {
      ...raw,
      shape: shapePayload
    };

    this.svc.update(this.simulationId, this.volumeName, payload)
      .subscribe(() => this.router.navigate([`/simulations/${this.simulationId}/volumes`]));
  }

  cancel(): void {
    this.router.navigate([`/simulations/${this.simulationId}/volumes`]);
  }
}