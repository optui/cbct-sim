import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { VolumeService } from '../../services/volume.service';
import { VolumeCreate } from '../../interfaces/volume';

@Component({
  selector: 'app-volume-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <h3>New Volume</h3>

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

      <fieldset formGroupName="translation">
        <legend>Translation</legend>
        <label *ngFor="let ctrl of translation.controls; let i = index">
          {{ ['X','Y','Z'][i] }}:
          <input type="number" [formControlName]="i" />
        </label>
        <label>
          Unit:
          <select formControlName="translation_unit">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </label>
      </fieldset>

      <fieldset formGroupName="rotation">
        <legend>Rotation</legend>
        <label>
          Axis:
          <select formControlName="axis">
            <option *ngFor="let a of ['x','y','z']" [value]="a">{{ a }}</option>
          </select>
        </label>
        <label>
          Angle:
          <input type="number" formControlName="angle" />
        </label>
      </fieldset>

      <fieldset formGroupName="shape">
        <legend>Shape</legend>
        <label>
          Type:
          <select formControlName="type">
            <option value="Box">Box</option>
            <option value="Sphere">Sphere</option>
          </select>
        </label>

        <ng-container *ngIf="form.value.shape.type === 'Box'">
          <label *ngFor="let s of size.controls; let i = index">
            Size {{ ['X','Y','Z'][i] }}:
            <input type="number" [formControlName]="i" />
          </label>
        </ng-container>

        <ng-container *ngIf="form.value.shape.type === 'Sphere'">
          <label>
            Inner radius (rmin):
            <input type="number" formControlName="rmin" />
          </label>
          <label>
            Outer radius (rmax):
            <input type="number" formControlName="rmax" />
          </label>
        </ng-container>

        <label>
          Unit:
          <select formControlName="unit">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </label>
      </fieldset>

      <fieldset formGroupName="dynamic_params">
        <legend>Dynamic params</legend>
        <label>
          <input type="checkbox" formControlName="enabled" />
          Enabled
        </label>

        <div *ngIf="form.value.dynamic_params.enabled">
          <fieldset formGroupName="translation_end">
            <legend>End Translation</legend>
            <label *ngFor="let ctrl of translation_end.controls; let i = index">
              {{ ['X','Y','Z'][i] }}:
              <input type="number" [formControlName]="i" />
            </label>
          </fieldset>

          <label>
            Angle End:
            <input type="number" formControlName="angle_end" />
          </label>
        </div>
      </fieldset>

      <button type="submit" [disabled]="form.invalid">Create</button>
      <button type="button" (click)="cancel()">Cancel</button>
    </form>
  `
})
export class VolumeCreateComponent implements OnInit {
  form!: FormGroup;
  units = ['nm', 'mm', 'cm', 'm'] as const;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private svc: VolumeService,
    private router: Router
  ) { }

  get translation() {
    return this.form.get('translation') as FormArray;
  }
  get size() {
    return this.form.get('shape')!.get('size') as FormArray;
  }
  get translation_end() {
    return this.form.get('dynamic_params')!.get('translation_end') as FormArray;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      mother: ['world', Validators.required],
      material: ['G4_AIR', Validators.required],
      translation: this.fb.array([0, 0, 0]),
      translation_unit: ['mm', Validators.required],
      rotation: this.fb.group({
        axis: ['x', Validators.required],
        angle: [0, Validators.required]
      }),
      shape: this.fb.group({
        type: ['Box', Validators.required],
        unit: ['mm', Validators.required],
        size: this.fb.array([10, 10, 10]),
        rmin: [0],
        rmax: [1]
      }),
      dynamic_params: this.fb.group({
        enabled: [false],
        translation_end: this.fb.array([0, 0, 0]),
        angle_end: [0]
      })
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const simId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    const raw = this.form.value;
    const shapePayload = raw.shape.type === 'Box'
      ? { type: 'Box' as const, unit: raw.shape.unit, size: raw.shape.size }
      : { type: 'Sphere' as const, unit: raw.shape.unit, rmin: raw.shape.rmin, rmax: raw.shape.rmax };

    const payload: VolumeCreate = {
      ...raw,
      shape: shapePayload
    };

    this.svc.create(simId, payload)
      .subscribe(() => this.router.navigate(['../volumes'], { relativeTo: this.route }));
  }

  cancel(): void {
    this.router.navigate(['../volumes'], { relativeTo: this.route });
  }
}
