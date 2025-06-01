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
  SourceCreate,
  SourceRead,
  SourceUpdate,
} from '../../interfaces/source';
import { Unit, Vector3 } from '../../interfaces/primitives';

@Component({
  selector: 'app-source-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `source-form.component.html`
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
    this.sourceService.getSource(this.simulationId, this.sourceName!).subscribe((data: SourceRead) => {
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

    const payload: SourceCreate = {
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
