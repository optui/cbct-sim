// src/app/components/volumes/volume-edit.component.ts
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
    <form *ngIf="form" [formGroup]="form" (ngSubmit)="submit()">
      <h3>Edit Volume</h3>

      <label>
        Name:
        <input formControlName="name" />
      </label>

      <label>
        Mother:
        <input formControlName="mother" />
      </label>

      <label>
        Material:
        <input formControlName="material" />
      </label>

      <div formArrayName="translation">
        <label *ngFor="let ctrl of translation.controls; let i = index">
          {{ ['X','Y','Z'][i] }}:
          <input type="number" [formControlName]="i" />
        </label>
      </div>

      <label>
        Translation Unit:
        <select formControlName="translation_unit">
          <option *ngFor="let u of units" [value]="u">{{u}}</option>
        </select>
      </label>

      <div formGroupName="rotation">
        <label>
          Axis:
          <select formControlName="axis">
            <option value="x">X</option>
            <option value="y">Y</option>
            <option value="z">Z</option>
          </select>
        </label>
        <label>
          Angle:
          <input type="number" formControlName="angle" />
        </label>
      </div>

      <fieldset formGroupName="shape">
        <legend>Shape</legend>
        <label>
          Type:
          <select formControlName="type">
            <option value="Box">Box</option>
            <option value="Sphere">Sphere</option>
          </select>
        </label>
        <label>
          Unit:
          <select formControlName="unit">
            <option *ngFor="let u of units" [value]="u">{{u}}</option>
          </select>
        </label>

        <div *ngIf="form.value.shape.type==='Box'" formArrayName="size">
          <label *ngFor="let c of size.controls; let i = index">
            {{ ['X','Y','Z'][i] }}:
            <input type="number" [formControlName]="i" />
          </label>
        </div>

        <div *ngIf="form.value.shape.type==='Sphere'">
          <label>
            Rmin:
            <input type="number" formControlName="rmin" />
          </label>
          <label>
            Rmax:
            <input type="number" formControlName="rmax" />
          </label>
        </div>
      </fieldset>

      <fieldset formGroupName="dynamic_params">
        <legend>Dynamics</legend>
        <label>
          <input type="checkbox" formControlName="enabled" />
          Enable animation
        </label>

        <div *ngIf="form.value.dynamic_params.enabled" formArrayName="translation_end">
          <label *ngFor="let c of translation_end.controls; let i = index">
            {{ ['X','Y','Z'][i] }} End:
            <input type="number" [formControlName]="i" />
          </label>
        </div>
        <label *ngIf="form.value.dynamic_params.enabled">
          Angle End:
          <input type="number" formControlName="angle_end" />
        </label>
      </fieldset>

      <button type="submit" [disabled]="form.invalid">Save</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class VolumeEditComponent implements OnInit {
  form!: FormGroup;
  units = ['nm','mm','cm','m'] as const;
  private simId!: number;
  private originalName!: string;

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
    // grab simId from the immediate parent (`/simulations/:id`)
    const simIdParam = this.route.parent!.snapshot.paramMap.get('id')!;
    this.simId = Number(simIdParam);

    // grab volumeName from this route (`/volumes/:volumeName/edit`)
    this.originalName = this.route.snapshot.paramMap.get('volumeName')!;

    this.svc.get(this.simId, this.originalName).subscribe(vol => {
      const translationArray   = this.fb.array(vol.translation || [0,0,0]);
      const sizeArray          = this.fb.array(vol.shape.type === 'Box' ? vol.shape.size : [0,0,0]);
      const translationEndArray= this.fb.array(vol.dynamic_params.translation_end || [0,0,0]);

      this.form = this.fb.group({
        name:             [vol.name,     Validators.required],
        mother:           [vol.mother || null],
        material:         [vol.material, Validators.required],
        translation:      translationArray,
        translation_unit: [vol.translation_unit, Validators.required],
        rotation: this.fb.group({
          axis:  [vol.rotation.axis, Validators.required],
          angle: [vol.rotation.angle, Validators.required],
        }),
        shape: this.fb.group({
          type: [vol.shape.type, Validators.required],
          unit: [vol.shape.unit, Validators.required],
          size: sizeArray,
          rmin: [vol.shape.type === 'Sphere' ? vol.shape.rmin : null],
          rmax: [vol.shape.type === 'Sphere' ? vol.shape.rmax : null],
        }),
        dynamic_params: this.fb.group({
          enabled:         [vol.dynamic_params.enabled],
          translation_end: translationEndArray,
          angle_end:       [vol.dynamic_params.angle_end || 0],
        }),
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

    this.svc.update(this.simId, this.originalName, payload)
      .subscribe(() => this.router.navigate(['../../'], { relativeTo: this.route }));
  }

  cancel(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
